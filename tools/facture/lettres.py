#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Montants en toutes lettres, en français.

La mention « arrêtée à la somme de … » doit concorder au centime près avec le
total chiffré. La saisir à la main sur chaque facture, c'est se ménager une
contradiction interne sur une pièce comptable : on la calcule.

Orthographe traditionnelle (« soixante et onze », pas de trait d'union entre
les tranches), accords de « vingt » et « cent » compris : ils prennent un s
quand ils terminent le nombre, mais restent invariables devant « mille », qui
est un numéral. « Million » et « milliard », eux, sont des noms : « deux cents
millions » garde son s.
"""

UNITES = (
    "zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit",
    "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
)

DIZAINES = {
    2: "vingt", 3: "trente", 4: "quarante", 5: "cinquante", 6: "soixante",
    7: "soixante", 8: "quatre-vingt", 9: "quatre-vingt",
}


def _sous_cent(n, pluriel=True):
    if n < 17:
        return UNITES[n]
    if n < 20:
        return "dix-" + UNITES[n - 10]

    d, u = divmod(n, 10)
    # 70 et 90 se comptent par vingtaines : 71 = soixante + onze, 91 = quatre-vingt + onze.
    if d in (7, 9):
        if n == 71:
            return "soixante et onze"
        return DIZAINES[d] + "-" + _sous_cent(n - (d - 1) * 10)

    base = DIZAINES[d]
    if u == 0:
        return base + ("s" if d == 8 and pluriel else "")
    if u == 1 and d in (2, 3, 4, 5, 6):
        return base + " et un"
    return base + "-" + UNITES[u]


def _sous_mille(n, pluriel=True):
    """`pluriel=False` devant « mille », où « cent » et « vingt » restent invariables."""
    centaines, reste = divmod(n, 100)
    if centaines == 0:
        return _sous_cent(reste, pluriel)

    tete = "cent" if centaines == 1 else UNITES[centaines] + " cent"
    if reste == 0:
        return tete + ("s" if centaines > 1 and pluriel else "")
    return tete + " " + _sous_cent(reste, pluriel)


def entier_en_lettres(n):
    """1200 → « mille deux cents »."""
    if n < 0:
        raise ValueError("montant négatif")
    if n == 0:
        return "zéro"

    milliards, reste = divmod(n, 10**9)
    millions, reste = divmod(reste, 10**6)
    milliers, unites = divmod(reste, 1000)

    morceaux = []
    if milliards:
        morceaux.append(_sous_mille(milliards) + (" milliard" if milliards == 1 else " milliards"))
    if millions:
        morceaux.append(_sous_mille(millions) + (" million" if millions == 1 else " millions"))
    if milliers:
        # « mille » est invariable et se passe de « un ».
        morceaux.append("mille" if milliers == 1 else _sous_mille(milliers, pluriel=False) + " mille")
    if unites:
        morceaux.append(_sous_mille(unites))
    return " ".join(morceaux)


def montant_en_lettres(montant, devise="euro", subdivision="centime"):
    """360.0 → « trois cent soixante euros »."""
    centimes_totaux = int(round(float(montant) * 100))
    entier, centimes = divmod(centimes_totaux, 100)

    texte = f"{entier_en_lettres(entier)} {devise}" + ("s" if entier > 1 else "")
    if centimes:
        texte += f" et {entier_en_lettres(centimes)} {subdivision}" + ("s" if centimes > 1 else "")
    return texte
