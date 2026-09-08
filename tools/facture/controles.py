#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Contrôles sur les données d'une facture, avant de figer le PDF.

Une facture part chez un tiers qui la paie et la comptabilise : une coquille
sur l'IBAN ou une clé de TVA fausse se découvre trop tard. Ces vérifications
sont bon marché et se font ici, pas à la relecture.

Deux niveaux : les *erreurs* empêchent le rendu, les *avertissements*
s'affichent et laissent passer (un gabarit à trous en est plein).
"""

import re

# Un gabarit non renseigné : points de suspension, tirets bas, « XXX ».
LACUNE = re.compile(r"…|_{2,}|X{3,}")


def _lacunaire(texte):
    return bool(LACUNE.search(texte))


# ------------------------------------------------------------------ IBAN
def iban_valide(iban):
    """Contrôle la clé mod 97 (ISO 7064) — attrape toute faute de frappe usuelle."""
    compact = re.sub(r"\s", "", iban).upper()
    if not re.fullmatch(r"[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}", compact):
        return False
    permute = compact[4:] + compact[:4]
    entier = "".join(str(ord(c) - 55) if c.isalpha() else c for c in permute)
    return int(entier) % 97 == 1


# ------------------------------------------------------------------ TVA
def cle_tva(siren):
    """Clé du numéro de TVA intracommunautaire français, à partir du SIREN."""
    return (12 + 3 * (int(siren) % 97)) % 97


def tva_valide(numero):
    """Vérifie un numéro français « FRxx999999999 » (les autres pays passent)."""
    compact = re.sub(r"\s", "", numero).upper()
    if not compact.startswith("FR"):
        return True
    if not re.fullmatch(r"FR[0-9]{2}[0-9]{9}", compact):
        return False
    return int(compact[2:4]) == cle_tva(compact[4:])


# ------------------------------------------------------------- structure
CHAMPS_RACINE = ("numero", "date", "taux_tva", "emetteur", "client", "objet",
                 "lignes", "reglement", "mentions", "pied")
CHAMPS_PARTIE = ("nom", "forme", "adresse", "identite")
CHAMPS_LIGNE = ("titre", "quantite", "unite", "pu", "details")


def anomalies(d):
    """Renvoie (erreurs, avertissements) — deux listes de messages."""
    erreurs, avertissements = [], []

    manquants = [c for c in CHAMPS_RACINE if c not in d]
    if manquants:
        erreurs.append("champs absents à la racine : " + ", ".join(manquants))
        return erreurs, avertissements

    for role in ("emetteur", "client"):
        absents = [c for c in CHAMPS_PARTIE if c not in d[role]]
        if absents:
            erreurs.append(f"{role} : champs absents — " + ", ".join(absents))

    if not isinstance(d["taux_tva"], (int, float)) or d["taux_tva"] < 0:
        erreurs.append("taux_tva doit être un nombre positif")

    if not d["lignes"]:
        erreurs.append("aucune ligne de prestation")
    for i, ligne in enumerate(d["lignes"], 1):
        absents = [c for c in CHAMPS_LIGNE if c not in ligne]
        if absents:
            erreurs.append(f"ligne {i} : champs absents — " + ", ".join(absents))
            continue
        for champ in ("quantite", "pu"):
            if not isinstance(ligne[champ], (int, float)):
                erreurs.append(f"ligne {i} : {champ} doit être un nombre")
            elif ligne[champ] < 0:
                erreurs.append(f"ligne {i} : {champ} est négatif")

    # Le numéro de facture doit être unique et la séquence sans trou : on ne
    # peut pas le vérifier ici, mais un gabarit oublié, si.
    if _lacunaire(str(d["numero"])):
        avertissements.append(f"numéro de facture non renseigné : {d['numero']!r}")

    for role in ("emetteur", "client"):
        for ligne in d[role].get("identite", []):
            if "TVA" not in ligne.upper():
                continue
            valeur = ligne.split(":", 1)[-1].strip()
            if _lacunaire(valeur):
                avertissements.append(f"{role} : numéro de TVA non renseigné")
            elif not tva_valide(valeur):
                avertissements.append(
                    f"{role} : clé du numéro de TVA incohérente — {valeur!r}"
                )

    for ligne in d["reglement"].get("banque", []):
        if "IBAN" not in ligne.upper():
            continue
        valeur = ligne.split(":", 1)[-1].strip()
        if _lacunaire(valeur):
            avertissements.append("IBAN non renseigné (gabarit)")
        elif not iban_valide(valeur):
            erreurs.append(f"IBAN invalide (clé de contrôle) : {valeur!r}")

    return erreurs, avertissements
