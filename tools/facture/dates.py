#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dates de facture : mise en forme française et calcul d'échéance.

L'échéance se déduit de la date de facture et du délai convenu. La saisir à la
main, c'est refaire le calcul « 30 jours fin de mois » de tête à chaque envoi,
et se tromper une fois sur trois.
"""

import datetime
import re

MOIS = ("janvier", "février", "mars", "avril", "mai", "juin", "juillet",
        "août", "septembre", "octobre", "novembre", "décembre")

# Délais reconnus, et leur libellé sur la facture. La table s'arrête aux
# plafonds de l'article L.441-10 du code de commerce — 60 jours date de
# facture, 45 jours fin de mois : n'y ajouter un délai plus long qu'en
# connaissance de cause, aucun contrôle en aval ne le rattrapera.
DELAIS = {
    "reception": "À réception de facture",
    "30j": "30 jours à compter de la date de facture",
    "45j": "45 jours à compter de la date de facture",
    "60j": "60 jours à compter de la date de facture",
    "30j-fin-de-mois": "30 jours fin de mois",
    "45j-fin-de-mois": "45 jours fin de mois",
}


def lire(valeur):
    """Accepte une date ISO (2026-09-08) ou un objet date."""
    if isinstance(valeur, datetime.date):
        return valeur
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(valeur)):
        raise ValueError(f"date attendue au format AAAA-MM-JJ, reçu {valeur!r}")
    return datetime.date.fromisoformat(valeur)


def en_toutes_lettres(valeur):
    """2026-09-08 → « 8 septembre 2026 » ; le 1er garde son ordinal."""
    d = lire(valeur)
    jour = "1er" if d.day == 1 else str(d.day)
    return f"{jour} {MOIS[d.month - 1]} {d.year}"


def _fin_de_mois(d):
    if d.month == 12:
        return d.replace(day=31)
    return d.replace(month=d.month + 1, day=1) - datetime.timedelta(days=1)


def echeance(date_facture, delai):
    """Date d'exigibilité, selon le délai convenu."""
    if delai not in DELAIS:
        raise ValueError(
            f"délai inconnu : {delai!r} — attendu parmi {', '.join(DELAIS)}"
        )

    d = lire(date_facture)
    if delai == "reception":
        return d

    jours = int(delai[:2])
    echue = d + datetime.timedelta(days=jours)
    if delai.endswith("fin-de-mois"):
        echue = _fin_de_mois(echue)
    return echue
