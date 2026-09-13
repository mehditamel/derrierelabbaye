# Le Ticket d’Or de l’Abbaye

## Livraison et état d’ouverture

Une expérience mobile à gratter est disponible sur `/ticket-or`, avec une page `/ticket-or/equipe` pour le comptoir et `/ticket-or/reglement`.

**Sans configuration complète, le site reste en avant-première.** Aucun formulaire de coordonnées, aucun SMS, aucun vrai tirage ni bon échangeable. Les exemples gagnants sont marqués « SPÉCIMEN · SANS VALEUR ». La rubrique d’accueil est masquée. Il est donc possible de publier et de faire essayer le design avant d’engager des dépenses ou des lots.

Le raccordement à un projet Supabase dédié, à Twilio Verify et la publication des modalités de campagne restent nécessaires pour ouvrir le jeu réel. Aucun projet d’une autre activité ne doit être réutilisé. Aucun service payant n’est provisionné par ce code.

## Parcours

- Prénom et mobile français 06/07 ; nom et e-mail facultatifs.
- Majorité et règlement acceptés ; deux accords commerciaux séparés, facultatifs et décochés.
- Code SMS Twilio Verify, six chiffres, dix minutes. Cinq essais au maximum par demande.
- Une participation par numéro vérifié, campagne et semaine civile, heure de Paris.
- Résultat aléatoire calculé sur le serveur et enregistré avant l’animation. La nouvelle tentative retrouve le même ticket.
- Gain : un cocktail individuel, inspiration agrumes, fruits ou herbes, sans alcool par défaut. La campagne peut autoriser une version alcoolisée après validation de ses modalités. Ce choix est conservé sur chaque bon, même après changement de campagne.
- Bon valable 14 jours, QR généré localement, code de secours affiché et téléchargement SVG. Le bon est retrouvé avec une nouvelle vérification du même mobile.
- Aucun envoi d’e-mail n’est promis ni raccordé dans cette version. Les coordonnées marketing ne servent pas à envoyer des campagnes automatiquement.

## Comptoir

Le QR contient l’adresse de l’espace équipe et le code du bon dans le fragment `#bon=`, absent des requêtes HTTP et des journaux d’accès. Utiliser l’appareil photo habituel du téléphone pour l’ouvrir ; le site ne demande pas de permission caméra. L’équipe peut également coller ou saisir le code.

La connexion équipe dure huit heures. Une lecture ne consomme pas le bon. Le bouton « Confirmer le service » l’enregistre atomiquement ; une seconde validation affiche qu’il a déjà été utilisé. Vérifier ce résultat **avant de servir**. Pour une version alcoolisée, contrôler la preuve de majorité puis cocher la confirmation demandée. Signaler les allergies directement au personnel ; aucune donnée de santé n’est stockée.

Le bouton d’export ne contient que les canaux pour lesquels le client a donné son accord. Les cellules sont protégées contre l’interprétation en formules. Avant toute future campagne SMS/e-mail, respecter les retraits intervenus depuis l’export et prévoir un désabonnement effectif ; un ancien fichier CSV ne prouve pas un consentement toujours valable.

## Raccordement serveur

Variables privées uniquement, **sans préfixe NEXT_PUBLIC** :

| Variable                   | Contenu                                                    |
| -------------------------- | ---------------------------------------------------------- |
| TICKET_OR_MODE             | Laisser vide en aperçu ; `live` uniquement à l’ouverture   |
| TICKET_SUPABASE_URL        | URL HTTPS du projet dédié                                  |
| TICKET_SUPABASE_SECRET_KEY | Nouvelle clé serveur `sb_secret_…`                         |
| TICKET_RATE_SECRET         | Secret aléatoire d’au moins 32 caractères                  |
| TWILIO_ACCOUNT_SID         | Identifiant AC…                                            |
| TWILIO_AUTH_TOKEN          | Secret du compte                                           |
| TWILIO_VERIFY_SERVICE_SID  | Service Verify VA… avec canal SMS et protection antifraude |
| TICKET_STAFF_PASSWORD_HASH | Empreinte scrypt générée localement                        |
| TICKET_SMS_DAILY_LIMIT     | 60 par défaut, borne 1–500 sur une fenêtre de 24 heures    |

Renseigner les secrets directement dans les paramètres sécurisés du déploiement, jamais dans une conversation, un commit ou un journal. Les aperçus de branches doivent conserver le mode vide et ne pas recevoir les clés de production.

Le mot de passe équipe est saisi localement avec `node scripts/ticket-staff-password.mjs`. L’outil masque la saisie, demande deux fois le mot de passe et ne produit que son empreinte. Conserver un mot de passe long dans le gestionnaire de mots de passe de l’équipe. Après rotation, révoquer également les anciennes sessions équipe dans le registre.

## Installation de la base

1. Créer un projet dédié après choix de l’organisation, région et confirmation du coût réel.
2. Installer une seule fois `database/ticket-or.sql` avec une migration Supabase. Le script crée les tables dans le schéma privé `ticket_or`, active RLS et refuse tout accès public. Aucun lot ni campagne n’est créé.
3. Installer `database/ticket-or-maintenance.sql` avec le rôle postgres. Contrôler son exécution dans Integrations > Cron. Cette tâche quotidienne purge les vérifications et sessions expirées et les identités arrivées à échéance.
4. Vérifier que les rôles anon et authenticated ne peuvent ni lire les tables ni appeler `public.ticket_or_api` ; seule la clé serveur peut exécuter ce point d’entrée.
5. Tester la connexion SMS avec un numéro de test autorisé, le tirage, la récupération, l’usage unique et le refus d’un bon expiré dans un environnement dédié. Les tests automatisés utilisent des données fictives et des appels SMS simulés.
6. Créer une campagne initialement inactive avec dates explicites, nombre de lots, probabilité, version du règlement et option alcool. Aucune valeur commerciale n’est choisie automatiquement.
7. Publier et valider les modalités, les prestataires et la notice de données avant de passer la campagne et le site en mode actif.

Une campagne dure au plus 28 jours et offre au plus 500 lots. Une seule campagne peut être active. Les dates, probabilités et dotations annoncées doivent rester fixes pendant la campagne. Fermer les participations avec `active = false` conserve la validité des bons déjà délivrés. Ne pas supprimer une campagne ou ses tickets pour remettre des compteurs à zéro.

## Sécurité et limites

Le registre réserve les quotas et les lots sous verrou transactionnel. Les sessions et demandes de codes utilisent des jetons aléatoires dont seule l’empreinte est enregistrée. Les cookies sont HttpOnly, SameSite Strict et Secure en production. Les mutations exigent la même origine, un corps JSON borné et l’authentification adaptée. Les erreurs ne journalisent pas de coordonnées ni de secrets.

Les règles SMS combinent 3 demandes par mobile et par heure, 20 par IP en dix minutes et un quota global de 60 sur 24 heures par défaut. Ce quota limite les requêtes applicatives ; ce n’est pas une garantie de facture maximale en euros. Régler aussi les destinations autorisées, les alertes et protections du prestataire. Ne pas envoyer de SMS réel sans autorisation pour le destinataire.

La limite est par numéro vérifié, elle ne prouve pas qu’une même personne ne possède pas plusieurs mobiles. Le jeu n’est pas disponible hors connexion ; les pages et API du jeu sont exclues du service worker et du cache. Une panne du registre interdit le service du bon.

Les tests PostgreSQL locaux utilisent PGlite, avec les mêmes tables et fonctions, et vérifient droits, plafonds, rejeu, expiration et usage unique. Ce moteur utilise une connexion ; les verrous doivent aussi être vérifiés dans le projet dédié avant ouverture avec plusieurs connexions indépendantes.

## Données et exploitation

L’absence de consentement commercial n’empêche pas de jouer. Sans accord commercial, les identités inactives sont purgées après 90 jours ; avec accord, après trois ans de dernier contact volontaire, sous réserve d’un bon encore valable. Le retrait est immédiatement pris en compte dans les futurs exports. Répondre aux demandes de droits à l’adresse du bar et supprimer aussi les exports locaux devenus inutiles.

Avant ouverture, confirmer les contrats et régions des prestataires, les éventuels transferts, la durée des journaux SMS et sauvegardes, et mettre à jour la notice actuellement présentée comme document de préparation. Examiner spécifiquement les modalités de la version alcoolisée au regard des règles françaises applicables. L’activation technique ne vaut pas validation juridique.

## Vérifications

- Tests de registre : droits privés, quotas, résultat immuable, double remise, expiration, consentements, purge.
- Tests des API : configuration incomplète, origine, données excessives, validation SMS, cookies, erreurs, CSV.
- Tests d’interface : aperçu sans collecte, révélation clavier, inscription et préférences, perte/expiration, contrôle équipe.
- Vérification manuelle sur ordinateur et mobile avant publication.

Documentation consultée : [clés Supabase](https://supabase.com/docs/guides/api/api-keys), [Supabase Cron](https://supabase.com/docs/guides/cron), [Twilio Verify](https://www.twilio.com/docs/verify/api/verification), [vérification du code](https://www.twilio.com/docs/verify/api/verification-check).

Références pour la préparation des modalités : [CNIL, jeux concours](https://www.cnil.fr/sites/default/files/atoms/files/commerce-donnees_perso_parrainage_jeux_concours.pdf), [CNIL, prospection par e-mail et SMS](https://www.cnil.fr/fr/la-prospection-commerciale-par-sms-mms).
