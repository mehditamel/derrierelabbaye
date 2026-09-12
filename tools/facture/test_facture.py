#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tests du montant en lettres et des contrôles de saisie.

Volontairement sans dépendance : `python3 tools/facture/test_facture.py`
suffit, y compris en CI, là où le rendu PDF demanderait reportlab et Pillow.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import dates  # noqa: E402
import epc  # noqa: E402
from controles import anomalies, cle_tva, iban_valide, tva_valide  # noqa: E402
from lettres import entier_en_lettres, montant_en_lettres  # noqa: E402

ENTIERS = {
    0: "zéro",
    1: "un",
    17: "dix-sept",
    21: "vingt et un",
    31: "trente et un",
    70: "soixante-dix",
    71: "soixante et onze",
    79: "soixante-dix-neuf",
    80: "quatre-vingts",
    81: "quatre-vingt-un",
    91: "quatre-vingt-onze",
    100: "cent",
    180: "cent quatre-vingts",
    200: "deux cents",
    201: "deux cent un",
    360: "trois cent soixante",
    1000: "mille",
    1200: "mille deux cents",
    # « vingt » et « cent » restent invariables devant « mille », qui est un
    # numéral, mais s'accordent devant « million », qui est un nom.
    80_000: "quatre-vingt mille",
    200_000: "deux cent mille",
    180_000: "cent quatre-vingt mille",
    1_000_000: "un million",
    2_000_000: "deux millions",
    80_000_000: "quatre-vingts millions",
    1_000_000_000: "un milliard",
}

MONTANTS = {
    360.0: "trois cent soixante euros",
    1.0: "un euro",
    0.0: "zéro euro",
    0.5: "zéro euro et cinquante centimes",
    1.01: "un euro et un centime",
    360.5: "trois cent soixante euros et cinquante centimes",
    # Le total TTC vient d'une multiplication : l'arrondi doit tomber juste.
    1234.56: "mille deux cent trente-quatre euros et cinquante-six centimes",
}

# Le RIB réel n'est pas versionné : on contrôle l'algorithme sur les IBAN de
# démonstration publiés par les banques.
IBAN_VALIDES = ("FR14 2004 1010 0505 0001 3M02 606", "DE89370400440532013000")
IBAN_INVALIDES = ("FR14 2004 1010 0505 0001 3M02 607", "FR76", "bonjour")


# Échéances vérifiées à la main : le report « fin de mois » se fait APRÈS
# l'ajout des jours, et doit franchir proprement les mois courts et l'année.
ECHEANCES = {
    ("2026-09-08", "reception"): "2026-09-08",
    ("2026-09-08", "30j"): "2026-10-08",
    ("2026-09-08", "45j"): "2026-10-23",
    ("2026-09-08", "60j"): "2026-11-07",
    ("2026-09-08", "30j-fin-de-mois"): "2026-10-31",
    ("2026-09-08", "45j-fin-de-mois"): "2026-10-31",
    ("2026-11-15", "30j-fin-de-mois"): "2026-12-31",   # décembre, mois de bord
    ("2026-12-15", "30j-fin-de-mois"): "2027-01-31",   # passage d'année
    ("2026-01-31", "30j-fin-de-mois"): "2026-03-31",   # février, mois court
}


def gabarit():
    return {
        "numero": "2026-09-001",
        "date": "2026-09-08",
        "taux_tva": 20,
        "emetteur": {
            "nom": "N", "forme": "F", "adresse": ["A"],
            "identite": ["TVA intracommunautaire : FR61 105 044 291"],
        },
        "client": {"nom": "N", "forme": "F", "adresse": ["A"], "identite": []},
        "objet": "O",
        "lignes": [{"titre": "T", "quantite": 1, "unite": "u", "pu": 300.0,
                    "details": []}],
        "reglement": {
            "mode": "M", "titulaire": "DERRIERE L ABBAYE",
            "iban": "FR14 2004 1010 0505 0001 3M02 606", "bic": "PSSTFRPPXXX",
            "banque": "B", "delai": "30j-fin-de-mois",
        },
        "mentions": ["M"],
        "pied": "P",
    }


def verifier():
    for n, attendu in ENTIERS.items():
        obtenu = entier_en_lettres(n)
        assert obtenu == attendu, f"{n} → {obtenu!r}, attendu {attendu!r}"

    for montant, attendu in MONTANTS.items():
        obtenu = montant_en_lettres(montant)
        assert obtenu == attendu, f"{montant} → {obtenu!r}, attendu {attendu!r}"

    for iban in IBAN_VALIDES:
        assert iban_valide(iban), f"{iban} devrait être valide"
    for iban in IBAN_INVALIDES:
        assert not iban_valide(iban), f"{iban} devrait être rejeté"

    assert cle_tva("105044291") == 61
    assert tva_valide("FR61 105 044 291")
    assert not tva_valide("FR62 105 044 291")
    assert tva_valide("BE0123456789"), "les numéros hors France ne sont pas contrôlés"

    for (jour, delai), attendu in ECHEANCES.items():
        obtenu = dates.echeance(jour, delai).isoformat()
        assert obtenu == attendu, f"{jour} + {delai} → {obtenu}, attendu {attendu}"

    assert dates.en_toutes_lettres("2026-09-08") == "8 septembre 2026"
    assert dates.en_toutes_lettres("2026-09-01") == "1er septembre 2026"
    assert dates.en_toutes_lettres("2026-08-31") == "31 août 2026"
    for delai in dates.DELAIS:
        assert dates.echeance("2026-09-08", delai), delai

    texte = epc.payload(nom="DERRIERE L ABBAYE",
                        iban="FR14 2004 1010 0505 0001 3M02 606",
                        montant=360.0, bic="PSSTFRPPXXX",
                        communication="Facture 2026-09-001")
    lignes = texte.split("\n")
    assert lignes[0] == "BCD" and lignes[3] == "SCT", lignes
    assert lignes[6] == "FR1420041010050500013M02606", "l'IBAN doit être compacté"
    assert lignes[7] == "EUR360.00", lignes[7]
    assert lignes[-1] == "Facture 2026-09-001", lignes
    assert len(texte.encode("utf-8")) <= epc.TAILLE_MAX

    for montant in (0.0, 1_000_000_000.0):
        try:
            epc.payload("N", "FR1420041010050500013M02606", montant)
        except ValueError:
            pass
        else:
            raise AssertionError(f"montant {montant} aurait dû être rejeté")
    # Un gabarit à trous ne doit jamais produire de carré scannable.
    try:
        epc.payload("N", "FR76 …", 10.0)
    except ValueError:
        pass
    else:
        raise AssertionError("un IBAN au gabarit aurait dû être rejeté")

    try:
        epc.payload("N" * 71, "FR1420041010050500013M02606", 10.0)
    except ValueError:
        pass
    else:
        raise AssertionError("un nom de 71 caractères aurait dû être rejeté")

    erreurs, avertissements = anomalies(gabarit())
    assert not erreurs and not avertissements, (erreurs, avertissements)

    d = gabarit()
    del d["objet"]
    erreurs, _ = anomalies(d)
    assert any("objet" in e for e in erreurs), erreurs

    d = gabarit()
    d["lignes"][0]["pu"] = "300"
    erreurs, _ = anomalies(d)
    assert any("pu doit être un nombre" in e for e in erreurs), erreurs

    d = gabarit()
    d["reglement"]["iban"] = "FR14 2004 1010 0505 0001 3M02 607"
    erreurs, _ = anomalies(d)
    assert any("IBAN invalide" in e for e in erreurs), erreurs

    d = gabarit()
    d["reglement"]["delai"] = "quand vous pourrez"
    erreurs, _ = anomalies(d)
    assert any("délai de règlement inconnu" in e for e in erreurs), erreurs

    d = gabarit()
    d["date"] = "08/09/2026"
    erreurs, _ = anomalies(d)
    assert any("AAAA-MM-JJ" in e for e in erreurs), erreurs

    d = gabarit()
    d["emetteur"]["identite"] = ["TVA intracommunautaire : FR62 105 044 291"]
    _, avertissements = anomalies(d)
    assert any("clé du numéro de TVA" in a for a in avertissements), avertissements

    d = gabarit()
    d["numero"] = "2026-09-XXX"
    _, avertissements = anomalies(d)
    assert any("numéro de facture" in a for a in avertissements), avertissements


if __name__ == "__main__":
    verifier()
    print(f"{len(ENTIERS) + len(MONTANTS)} montants, {len(ECHEANCES)} échéances "
          "et 19 contrôles vérifiés.")
