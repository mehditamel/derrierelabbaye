#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""QR-code de virement SEPA (norme EPC069-12).

Le payeur scanne le code avec son application bancaire et le virement arrive
pré-rempli : bénéficiaire, IBAN, montant, référence. Plus d'IBAN recopié à la
main à 27 caractères, donc plus de virement égaré.

Le contenu est du texte simple ; cette partie n'a besoin d'aucune dépendance
et se teste seule. Seul le tracé du carré demande `segno`.
"""

import re

from controles import iban_valide

TAILLE_MAX = 331  # octets, imposé par la norme

LIMITES = {
    "nom": 70,
    "iban": 34,
    "bic": 11,
    "communication": 140,
}


def payload(nom, iban, montant, bic="", communication=""):
    """Le texte encodé dans le QR — 12 lignes, dernières facultatives."""
    iban = re.sub(r"\s", "", iban).upper()
    bic = re.sub(r"\s", "", bic).upper()

    # Un QR est fait pour être scanné sans relecture : mieux vaut pas de carré
    # du tout qu'un carré qui envoie l'argent sur un IBAN mal formé.
    if not iban_valide(iban):
        raise ValueError(f"IBAN inexploitable pour un QR de virement : {iban!r}")

    if not 0.01 <= montant <= 999_999_999.99:
        raise ValueError(f"montant hors des bornes de la norme : {montant}")
    for champ, valeur in (("nom", nom), ("iban", iban), ("bic", bic),
                          ("communication", communication)):
        if len(valeur) > LIMITES[champ]:
            raise ValueError(f"{champ} trop long : {len(valeur)} > {LIMITES[champ]}")

    lignes = [
        "BCD",              # entête de service
        "002",              # version de la norme
        "1",                # jeu de caractères : UTF-8
        "SCT",              # SEPA Credit Transfer
        bic,
        nom,
        iban,
        f"EUR{montant:.2f}",
        "",                 # code purpose (facultatif)
        "",                 # référence structurée — exclusive de la suivante
        communication,      # communication libre
    ]
    texte = "\n".join(lignes).rstrip("\n")

    if len(texte.encode("utf-8")) > TAILLE_MAX:
        raise ValueError("contenu trop long pour un QR de virement SEPA")
    return texte


def image(texte, echelle=3):
    """Rend le QR en PNG (objet fichier en mémoire). Demande `segno`."""
    import io

    import segno

    tampon = io.BytesIO()
    # Correction d'erreur M : le carré reste lisible même un peu abîmé à
    # l'impression, sans gonfler la trame au point de la rendre illisible.
    segno.make(texte, error="m").save(tampon, kind="png", scale=echelle,
                                      border=2, dark="#14110D")
    tampon.seek(0)
    return tampon
