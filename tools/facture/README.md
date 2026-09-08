# Facture PDF

Générateur de factures aux couleurs de la maison (papier blanc, filets or,
logo détouré), pour les prestations ponctuelles : mise à disposition des lieux
pour un tournage, privatisation, prestation traiteur…

```bash
pip install reportlab pillow segno
cp tools/facture/facture.exemple.json tools/facture/2026-09-001.json
# renseigner numéro, client, lignes, RIB…
python3 tools/facture/facture.py tools/facture/2026-09-001.json
```

Le PDF est écrit à côté du JSON (ou au chemin passé en second argument).

## Ce que l'outil calcule pour vous

- **Le montant de chaque ligne** : `quantite × pu`. La colonne « Qté » se
  compose du nombre et de son unité, accordée au pluriel (`unite_pluriel` si
  l'accord n'est pas un simple `s`).
- **Le total HT, la TVA et le TTC**, au taux du champ `taux_tva`.
- **Le montant en toutes lettres** (`trois cent soixante euros`). Le champ
  `montant_lettres` existe encore mais ne sert qu'à forcer une formulation :
  laissé vide, il est calculé, et ne peut donc plus contredire le total.
- **La date d'échéance**, depuis la date de facture et le délai convenu
  (`delai` : `reception`, `30j`, `45j`, `60j`, `30j-fin-de-mois`,
  `45j-fin-de-mois`). Le report « fin de mois » se fait après l'ajout des
  jours, et franchit les mois courts et les fins d'année.
- **Le QR-code de virement SEPA** (norme EPC069-12), posé dans le vide à
  gauche du cartouche de total. Le payeur le scanne, son application bancaire
  pré-remplit bénéficiaire, IBAN, montant et référence : plus d'IBAN recopié à
  27 caractères. Le carré est simplement omis si `segno` manque ou si l'IBAN
  est encore au gabarit — le PDF reste valable.
- **La pagination** : au-delà d'une page, le tableau se poursuit sous un
  bandeau « suite », les feuillets sont numérotés, et le bloc totaux +
  règlement n'est jamais coupé en deux.

## Ce que l'outil vérifie avant de produire le PDF

Les _erreurs_ arrêtent le rendu, les _avertissements_ s'affichent et laissent
passer (un gabarit à trous en est plein) :

| Contrôle                                                  | Niveau        |
| --------------------------------------------------------- | ------------- |
| Champs absents, montants non numériques ou négatifs       | erreur        |
| Clé de contrôle de l'IBAN (mod 97)                        | erreur        |
| Clé du numéro de TVA intracommunautaire français          | avertissement |
| Date hors format `AAAA-MM-JJ`, délai de règlement inconnu | erreur        |
| Numéro de facture resté au gabarit (`XXX`, `…`)           | avertissement |
| Débordement du texte sur les mentions légales             | erreur        |

Ce que l'outil ne peut pas vérifier et qui reste à votre charge : que le
**numéro de facture** suive une séquence continue et sans trou, et que le
**numéro de TVA** soit bien celui délivré à l'établissement — la clé peut être
cohérente et le SIREN faux.

## Tests

```bash
python3 tools/facture/test_facture.py
```

Sans dépendance (le rendu PDF, lui, demande reportlab et Pillow), et lancés en
CI à chaque poussée. Ils couvrent les montants en toutes lettres (accords de
« vingt » et « cent » compris), le calcul des échéances, le contenu du QR de
virement et les contrôles de saisie.

## Données confidentielles

Le dépôt est **public** : `.gitignore` exclut les JSON de travail et les PDF
produits. Seul `facture.exemple.json` est versionné, avec le RIB et les
coordonnées client remplacés par des pointillés. Ne jamais lever cette
exclusion.

## Mentions portées automatiquement

Numéro et date de facture, identité des deux parties, date et nature de la
prestation, total HT / TVA / TTC, date d'échéance, absence d'escompte, TVA sur
les encaissements, pénalités de retard et indemnité forfaitaire de 40 €
(art. L.441-10 et D.441-5 du code de commerce).

Le numéro de TVA intracommunautaire et le SIRET restent à renseigner dans le
JSON : ils ne figurent pas dans les sources du site.
