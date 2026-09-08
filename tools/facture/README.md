# Facture PDF

Générateur de factures aux couleurs de la maison (papier blanc, filets or,
logo détouré), pour les prestations ponctuelles : mise à disposition des lieux
pour un tournage, privatisation, prestation traiteur…

```bash
pip install reportlab pillow
cp tools/facture/facture.exemple.json tools/facture/2026-09-001.json
# renseigner numéro, client, lignes, RIB…
python3 tools/facture/facture.py tools/facture/2026-09-001.json
```

Le PDF est écrit à côté du JSON (ou au chemin passé en second argument).

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
