-- À installer avec le rôle postgres dans le projet dédié, après ticket-or.sql.
-- Cette tâche ne transmet aucune donnée au réseau et ne contient aucune clé.
create extension if not exists pg_cron;
select cron.schedule(
  'ticket-or-purge-quotidienne',
  '15 3 * * *',
  $$select public.ticket_or_api('purge', '{}'::jsonb);$$
);
-- Vérifier les exécutions dans Integrations > Cron.
-- Réutiliser ce nom met à jour la programmation sans créer de doublon.
