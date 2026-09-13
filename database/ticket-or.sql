-- Ticket d'Or : schéma privé, accessible uniquement par le serveur du site.
-- Installer dans un projet dédié. Aucune campagne n'est activée par ce script.
begin;
create schema if not exists ticket_or;
revoke all on schema ticket_or from public, anon, authenticated;
grant usage on schema ticket_or to service_role;

create table ticket_or.campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Le Ticket d’Or de l’Abbaye',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  active boolean not null default false,
  max_prizes integer not null check (max_prizes between 1 and 500),
  awarded integer not null default 0 check (awarded >= 0 and awarded <= max_prizes),
  probability integer not null check (probability between 1 and 100),
  alcohol_allowed boolean not null default false,
  rules_version text not null,
  check (ends_at > starts_at and ends_at <= starts_at + interval '28 days')
);
create unique index one_active_ticket_campaign on ticket_or.campaigns ((active)) where active;
create table ticket_or.players (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique check (phone ~ '^\+33[67][0-9]{8}$'),
  first_name text not null check (length(first_name) between 1 and 60),
  last_name text not null default '' check (length(last_name) <= 60),
  email text not null default '' check (length(email) <= 254),
  email_opt_in boolean not null default false,
  sms_opt_in boolean not null default false,
  consent_at timestamptz not null default now(),
  last_contact_at timestamptz not null default now(),
  rules_version text not null
);
create table ticket_or.consents (
  id bigint generated always as identity primary key,
  player_id uuid not null references ticket_or.players on delete cascade,
  email_opt_in boolean not null,
  sms_opt_in boolean not null,
  version text not null,
  created_at timestamptz not null default now()
);
create index on ticket_or.consents (player_id);
create table ticket_or.sessions (
  token_hash text primary key check (length(token_hash) = 64),
  player_id uuid references ticket_or.players on delete cascade,
  staff boolean not null default false,
  expires_at timestamptz not null,
  check ((staff and player_id is null) or (not staff and player_id is not null))
);
create index on ticket_or.sessions (player_id);
create index on ticket_or.sessions (expires_at);
create table ticket_or.challenges (
  token_hash text primary key check (length(token_hash) = 64),
  verification_sid text not null,
  profile jsonb not null,
  attempts integer not null default 0,
  expires_at timestamptz not null default now() + interval '10 minutes'
);
create index on ticket_or.challenges (expires_at);
create table ticket_or.limits (
  key text primary key,
  count integer not null default 0,
  expires_at timestamptz not null
);
create index on ticket_or.limits (expires_at);
create table ticket_or.tickets (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references ticket_or.players on delete set null,
  campaign_id uuid not null references ticket_or.campaigns,
  week_start date not null,
  won boolean not null,
  code text unique,
  flavour text not null default 'agrumes' check (flavour in ('agrumes', 'fruits', 'herbes')),
  alcohol boolean not null default false,
  alcohol_allowed boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  redeemed_at timestamptz,
  redeemed_by text,
  unique (player_id, campaign_id, week_start),
  check ((won and code ~ '^DLA-[A-F0-9]{24}$' and expires_at is not null) or (not won and code is null and expires_at is null))
);
create index on ticket_or.tickets (campaign_id);
create index on ticket_or.tickets (expires_at);

alter table ticket_or.campaigns enable row level security;
alter table ticket_or.players enable row level security;
alter table ticket_or.consents enable row level security;
alter table ticket_or.sessions enable row level security;
alter table ticket_or.challenges enable row level security;
alter table ticket_or.limits enable row level security;
alter table ticket_or.tickets enable row level security;
revoke all on all tables in schema ticket_or from public, anon, authenticated;
grant select, insert, update, delete on all tables in schema ticket_or to service_role;
grant usage, select on all sequences in schema ticket_or to service_role;

-- Un seul point d'entrée REST, jamais accessible avec une clé publique.
-- SECURITY INVOKER : aucune élévation implicite des privilèges.
create function public.ticket_or_api(action text, payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  c ticket_or.campaigns;
  p ticket_or.players;
  s ticket_or.sessions;
  t ticket_or.tickets;
  ch ticket_or.challenges;
  item jsonb;
  lim ticket_or.limits;
  week date := date_trunc('week', now() at time zone 'Europe/Paris')::date;
  next_week timestamptz := (date_trunc('week', now() at time zone 'Europe/Paris') + interval '7 days') at time zone 'Europe/Paris';
  win boolean;
  result jsonb;
begin
  if action = 'limit' then
    -- Sérialise une courte réservation de quotas, même entre instances Vercel.
    perform pg_advisory_xact_lock(84629101);
    for item in select value from jsonb_array_elements(payload->'limits') loop
      select * into lim from ticket_or.limits where key = item->>'key';
      if found and lim.expires_at > now() and lim.count >= (item->>'max')::integer then
        return jsonb_build_object('error', 'rate_limit');
      end if;
    end loop;
    for item in select value from jsonb_array_elements(payload->'limits') loop
      insert into ticket_or.limits (key, count, expires_at)
      values (item->>'key', 1, now() + make_interval(secs => (item->>'seconds')::integer))
      on conflict (key) do update set
        count = case when ticket_or.limits.expires_at <= now() then 1 else ticket_or.limits.count + 1 end,
        expires_at = case when ticket_or.limits.expires_at <= now() then excluded.expires_at else ticket_or.limits.expires_at end;
    end loop;
    return '{"ok":true}';
  elsif action = 'challenge_create' then
    insert into ticket_or.challenges (token_hash, verification_sid, profile)
    values (payload->>'hash', payload->>'sid', payload->'profile');
    return '{"ok":true}';
  elsif action = 'challenge_attempt' then
    update ticket_or.challenges set attempts = attempts + 1
    where token_hash = payload->>'hash' and expires_at > now() and attempts < 5 returning * into ch;
    if not found then return '{"error":"challenge"}'; end if;
    return jsonb_build_object('sid', ch.verification_sid);
  elsif action = 'challenge_finish' then
    delete from ticket_or.challenges where token_hash = payload->>'hash' and expires_at > now() returning * into ch;
    if not found then return '{"error":"challenge"}'; end if;
    insert into ticket_or.players (phone, first_name, last_name, email, email_opt_in, sms_opt_in, rules_version)
    values (ch.profile->>'phone', ch.profile->>'first_name', ch.profile->>'last_name', ch.profile->>'email',
      (ch.profile->>'email_opt_in')::boolean, (ch.profile->>'sms_opt_in')::boolean, payload->>'version')
    on conflict (phone) do update set first_name = excluded.first_name, last_name = excluded.last_name,
      email = excluded.email, email_opt_in = excluded.email_opt_in, sms_opt_in = excluded.sms_opt_in,
      consent_at = now(), last_contact_at = now(), rules_version = excluded.rules_version returning * into p;
    insert into ticket_or.consents (player_id, email_opt_in, sms_opt_in, version)
    values (p.id, p.email_opt_in, p.sms_opt_in, p.rules_version);
    insert into ticket_or.sessions (token_hash, player_id, expires_at)
    values (payload->>'session_hash', p.id, now() + interval '7 days');
    return '{"ok":true}';
  elsif action = 'staff_create' then
    insert into ticket_or.sessions (token_hash, staff, expires_at) values (payload->>'hash', true, now() + interval '8 hours');
    return '{"ok":true}';
  elsif action = 'logout' then
    delete from ticket_or.sessions where token_hash = payload->>'hash';
    return '{"ok":true}';
  elsif action = 'purge' then
    delete from ticket_or.challenges where expires_at < now();
    delete from ticket_or.sessions where expires_at < now();
    delete from ticket_or.limits where expires_at < now();
    -- Les bons restent comptabilisés ; seules les coordonnées sont effacées.
    delete from ticket_or.players p0 where
      p0.last_contact_at < now() - case when p0.email_opt_in or p0.sms_opt_in then interval '3 years' else interval '90 days' end
      and not exists (select 1 from ticket_or.tickets t0 where t0.player_id = p0.id and t0.expires_at > now());
    return '{"ok":true}';
  end if;

  select * into s from ticket_or.sessions where token_hash = payload->>'hash' and expires_at > now();
  if s.player_id is not null then select * into p from ticket_or.players where id = s.player_id; end if;
  select * into c from ticket_or.campaigns where active order by starts_at desc limit 1;

  if action = 'state' then
    return jsonb_build_object(
      'campaign', case when c.id is null then null else to_jsonb(c) - 'active' end,
      'player', case when p.id is null then null else to_jsonb(p) - 'id' - 'rules_version' - 'consent_at' - 'last_contact_at' end,
      'tickets', coalesce((select jsonb_agg(to_jsonb(tt) - 'player_id' - 'campaign_id' - 'week_start' - 'redeemed_by' order by tt.created_at desc)
        from ticket_or.tickets tt where tt.player_id = p.id and (tt.campaign_id = c.id or tt.expires_at > now())), '[]'::jsonb),
      'available', c.id is not null and c.starts_at <= now() and c.ends_at > now() and c.awarded < c.max_prizes,
      'played', exists(select 1 from ticket_or.tickets where player_id = p.id and campaign_id = c.id and week_start = week),
      'next_play_at', case when next_week < c.ends_at then next_week else null end
    );
  elsif action = 'play' then
    if p.id is null or s.staff then return '{"error":"unauthorized"}'; end if;
    select * into c from ticket_or.campaigns where active for update;
    select * into t from ticket_or.tickets where player_id = p.id and campaign_id = c.id and week_start = week;
    if found then return jsonb_build_object('ticket', to_jsonb(t) - 'player_id' - 'campaign_id' - 'week_start' - 'redeemed_by'); end if;
    if c.id is null or now() < c.starts_at or now() >= c.ends_at or c.awarded >= c.max_prizes then return '{"error":"closed"}'; end if;
    if p.rules_version <> c.rules_version or payload->>'version' <> c.rules_version then return '{"error":"rules"}'; end if;
    -- La valeur est produite par crypto.randomInt côté serveur, jamais par le joueur.
    if (payload->>'draw')::integer not between 0 and 999999 then return '{"error":"draw"}'; end if;
    win := (payload->>'draw')::integer < c.probability * 10000;
    insert into ticket_or.tickets (player_id, campaign_id, week_start, won, code, alcohol_allowed, expires_at)
    values (p.id, c.id, week, win, case when win then payload->>'code' else null end, c.alcohol_allowed,
      case when win then now() + interval '14 days' else null end) returning * into t;
    if win then update ticket_or.campaigns set awarded = awarded + 1 where id = c.id; end if;
    update ticket_or.players set last_contact_at = now() where id = p.id;
    return jsonb_build_object('ticket', to_jsonb(t) - 'player_id' - 'campaign_id' - 'week_start' - 'redeemed_by');
  elsif action = 'choice' then
    if p.id is null or s.staff then return '{"error":"unauthorized"}'; end if;
    select * into t from ticket_or.tickets where id = (payload->>'id')::uuid and player_id = p.id for update;
    if not found or not t.won or t.redeemed_at is not null or t.expires_at <= now() then return '{"error":"ticket"}'; end if;
    if (payload->>'alcohol')::boolean and not t.alcohol_allowed then return '{"error":"alcohol"}'; end if;
    update ticket_or.tickets set flavour = payload->>'flavour', alcohol = (payload->>'alcohol')::boolean where id = t.id;
    return '{"ok":true}';
  elsif action = 'consent' then
    if p.id is null or s.staff then return '{"error":"unauthorized"}'; end if;
    if (payload->>'email_opt_in')::boolean and p.email = '' then return '{"error":"email"}'; end if;
    update ticket_or.players set email_opt_in = (payload->>'email_opt_in')::boolean,
      sms_opt_in = (payload->>'sms_opt_in')::boolean, consent_at = now(), last_contact_at = now() where id = p.id;
    insert into ticket_or.consents (player_id, email_opt_in, sms_opt_in, version)
    values (p.id, (payload->>'email_opt_in')::boolean, (payload->>'sms_opt_in')::boolean, p.rules_version);
    return '{"ok":true}';
  end if;

  if s.staff is distinct from true then return '{"error":"unauthorized"}'; end if;
  if action = 'staff_state' then
    return jsonb_build_object('ok', true, 'campaign', to_jsonb(c),
      'participants', (select count(distinct player_id) from ticket_or.tickets where campaign_id = c.id),
      'redeemed', (select count(*) from ticket_or.tickets where campaign_id = c.id and redeemed_at is not null));
  elsif action in ('lookup', 'redeem') then
    select * into t from ticket_or.tickets where code = payload->>'code' and won for update;
    if not found then return '{"error":"ticket"}'; end if;
    win := false;
    if action = 'redeem' and t.redeemed_at is null and t.expires_at > now() then
      if t.alcohol and coalesce((payload->>'adult_checked')::boolean, false) is not true then return '{"error":"adult"}'; end if;
      update ticket_or.tickets set redeemed_at = now(), redeemed_by = s.token_hash where id = t.id returning * into t;
      win := true;
    end if;
    select * into p from ticket_or.players where id = t.player_id;
    return jsonb_build_object('redeemed_now', win, 'ticket', (to_jsonb(t) - 'player_id' - 'campaign_id' - 'week_start' - 'redeemed_by') ||
      jsonb_build_object('first_name', coalesce(p.first_name, 'Client'), 'status',
        case when t.redeemed_at is not null then 'used' when t.expires_at <= now() then 'expired' else 'valid' end));
  elsif action = 'contacts' then
    select coalesce(jsonb_agg(jsonb_build_object('first_name', first_name, 'last_name', last_name,
      'email', case when email_opt_in then email else '' end, 'phone', case when sms_opt_in then phone else '' end,
      'email_opt_in', email_opt_in, 'sms_opt_in', sms_opt_in, 'consent_at', consent_at, 'rules_version', rules_version)), '[]'::jsonb)
      into result from ticket_or.players where email_opt_in or sms_opt_in;
    return jsonb_build_object('contacts', result);
  end if;
  return '{"error":"action"}';
end;
$$;
revoke all on function public.ticket_or_api(text, jsonb) from public, anon, authenticated;
grant execute on function public.ticket_or_api(text, jsonb) to service_role;
commit;
