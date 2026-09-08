#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Génère une facture PDF aux couleurs de la maison.

Usage : python3 tools/facture/facture.py mes-donnees.json sortie.pdf
Le fichier de données suit la structure de `facture.exemple.json`.
"""

import json
import os
import sys

from PIL import Image
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

HERE = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------- palette
NOIR = HexColor("#14110D")
OR = HexColor("#A8884C")
GRIS = HexColor("#6B6559")
HAIRLINE = Color(168 / 255, 136 / 255, 76 / 255, 0.45)
PAPIER = HexColor("#FFFFFF")

SERIF = "Times-Roman"
SERIF_IT = "Times-Italic"
SANS = "Helvetica"

W, H = A4
MG = 22 * 2.83465  # 22 mm
mm = 2.83465


def data(chemin):
    with open(chemin, encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------- helpers
def caps(c, x, y, txt, font=SANS, size=7.2, track=1.6, color=GRIS, center=False):
    """Petites capitales tracées — la signature typographique de la maison."""
    txt = txt.upper()
    total = stringWidth(txt, font, size) + track * max(len(txt) - 1, 0)
    if center:
        x -= total / 2
    c.setFont(font, size)
    c.setFillColor(color)
    for ch in txt:
        c.drawString(x, y, ch)
        x += stringWidth(ch, font, size) + track
    return total


def rule(c, x1, y, x2, color=HAIRLINE, width=0.5):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(x1, y, x2, y)


def wrap(text, font, size, maxw):
    lignes, courante = [], ""
    for mot in text.split():
        essai = (courante + " " + mot).strip()
        if stringWidth(essai, font, size) <= maxw:
            courante = essai
        else:
            if courante:
                lignes.append(courante)
            courante = mot
    if courante:
        lignes.append(courante)
    return lignes


def para(c, x, y, text, font=SERIF, size=9, leading=12.5, maxw=200, color=NOIR):
    c.setFont(font, size)
    c.setFillColor(color)
    for ligne in wrap(text, font, size, maxw):
        c.drawString(x, y, ligne)
        y -= leading
    return y


def euros(v):
    s = f"{v:,.2f}".replace(",", " ").replace(".", ",")
    return f"{s} €"


def logo():
    """Logo détouré de ses marges blanches, prêt à poser sur le papier."""
    src = Image.open(os.path.join(HERE, "..", "..", "public", "logo-noir.png")).convert("RGBA")
    # Le PNG traîne un voile d'alpha résiduel (≈2 %) sur toute sa surface : il
    # se lit comme un carré gris à l'impression. On l'écrête avant de détourer.
    alpha = src.split()[3].point(lambda a: a if a > 60 else 0)
    src.putalpha(alpha)
    bbox = alpha.getbbox()
    return ImageReader(src.crop(bbox) if bbox else src)


# ---------------------------------------------------------------- rendu
def build(d, sortie):
    c = canvas.Canvas(sortie, pagesize=A4)
    c.setTitle(f"Facture {d['numero']} — {d['emetteur']['nom']}")
    c.setAuthor(d["emetteur"]["nom"])
    c.setSubject(d["objet"])

    c.setFillColor(PAPIER)
    c.rect(0, 0, W, H, stroke=0, fill=1)

    # Cadre filet — le liseré de la carte, repris en impression.
    c.setStrokeColor(HAIRLINE)
    c.setLineWidth(0.5)
    c.rect(12 * mm, 12 * mm, W - 24 * mm, H - 24 * mm, stroke=1, fill=0)

    x0, x1 = MG, W - MG
    y = H - 26 * mm

    # ---- en-tête : logo + mention FACTURE
    img = logo()
    iw, ih = img.getSize()
    hl = 15 * mm
    c.drawImage(img, x0, y - hl + 1 * mm, width=hl * iw / ih, height=hl,
                mask="auto")

    lt = stringWidth("FACTURE", SANS, 13) + 5.5 * 6
    caps(c, x1 - lt, y - 2 * mm, "Facture", font=SANS, size=13, track=5.5, color=NOIR)
    c.setFont(SERIF, 9)
    c.setFillColor(GRIS)
    c.drawRightString(x1, y - 9 * mm, f"N° {d['numero']}")
    c.drawRightString(x1, y - 13.5 * mm, f"Le {d['date']}")

    y -= 24 * mm
    rule(c, x0, y, x1)
    y -= 9 * mm

    # ---- émetteur / client
    colw = (x1 - x0 - 14 * mm) / 2
    xc = x0 + colw + 14 * mm

    caps(c, x0, y, "Émetteur")
    caps(c, xc, y, "Facturé à")
    ya = y - 6.5 * mm
    yb = ya

    e = d["emetteur"]
    c.setFont(SERIF, 10.5)
    c.setFillColor(NOIR)
    c.drawString(x0, ya, e["nom"])
    ya -= 12
    ya = para(c, x0, ya, e["forme"], font=SERIF, size=8.8, leading=11.5, maxw=colw,
              color=GRIS)
    for l in e["adresse"]:
        c.setFont(SERIF, 9)
        c.setFillColor(NOIR)
        c.drawString(x0, ya, l)
        ya -= 11.5
    ya -= 2
    for l in e["identite"]:
        ya = para(c, x0, ya, l, font=SERIF, size=8.6, leading=10.5, maxw=colw,
                  color=GRIS)

    cl = d["client"]
    c.setFont(SERIF, 10.5)
    c.setFillColor(NOIR)
    c.drawString(xc, yb, cl["nom"])
    yb -= 12
    yb = para(c, xc, yb, cl["forme"], font=SERIF, size=8.8, leading=11.5, maxw=colw,
              color=GRIS)
    for l in cl["adresse"]:
        c.setFont(SERIF, 9)
        c.setFillColor(NOIR)
        c.drawString(xc, yb, l)
        yb -= 11.5
    yb -= 2
    for l in cl["identite"]:
        yb = para(c, xc, yb, l, font=SERIF, size=8.6, leading=10.5, maxw=colw,
                  color=GRIS)

    y = min(ya, yb) - 6 * mm
    rule(c, x0, y, x1)
    y -= 9 * mm

    # ---- objet
    caps(c, x0, y, "Objet")
    y -= 6.5 * mm
    y = para(c, x0, y, d["objet"], font=SERIF, size=9.6, leading=13,
             maxw=x1 - x0) - 3 * mm

    # ---- tableau
    y -= 4 * mm
    col_qte = x1 - 92 * mm
    col_pu = x1 - 40 * mm
    col_tot = x1

    caps(c, x0, y, "Désignation")
    caps(c, col_qte, y, "Qté")
    caps(c, col_pu - stringWidth("PRIX UNITAIRE HT", SANS, 7.2) - 1.6 * 15, y,
         "Prix unitaire HT")  # aligné à droite sur la colonne des prix
    caps(c, col_tot - stringWidth("MONTANT HT", SANS, 7.2) - 1.6 * 9, y, "Montant HT")
    y -= 3 * mm
    rule(c, x0, y, x1, color=NOIR, width=0.7)
    y -= 7 * mm

    for ligne in d["lignes"]:
        c.setFont(SERIF, 10)
        c.setFillColor(NOIR)
        c.drawString(x0, y, ligne["titre"])
        c.drawString(col_qte, y, ligne["qte"])
        c.drawRightString(col_pu, y, euros(ligne["pu"]))
        c.drawRightString(col_tot, y, euros(ligne["pu"] * ligne["n"]))
        y -= 12.5
        for detail in ligne["details"]:
            y = para(c, x0 + 4 * mm, y, detail, font=SERIF_IT, size=8.6,
                     leading=11.5, maxw=col_qte - x0 - 8 * mm, color=GRIS)
        y -= 3 * mm

    y += 1 * mm
    rule(c, x0, y, x1)
    y -= 8 * mm

    # ---- totaux
    ht = sum(l["pu"] * l["n"] for l in d["lignes"])
    tva = round(ht * d["taux_tva"] / 100, 2)
    ttc = ht + tva
    xt = x1 - 62 * mm

    c.setFont(SERIF, 9.5)
    c.setFillColor(GRIS)
    c.drawString(xt, y, "Total HT")
    c.setFillColor(NOIR)
    c.drawRightString(x1, y, euros(ht))
    y -= 13
    c.setFillColor(GRIS)
    tx = f"{d['taux_tva']:g}".replace(".", ",")
    c.drawString(xt, y, f"TVA {tx} %")
    c.setFillColor(NOIR)
    c.drawRightString(x1, y, euros(tva))
    y -= 9 * mm

    c.setFillColor(HexColor("#FBF8F1"))
    c.rect(xt - 6 * mm, y - 6.5 * mm, x1 - xt + 6 * mm, 12 * mm, stroke=0, fill=1)
    c.setStrokeColor(OR)
    c.setLineWidth(0.7)
    c.line(xt - 6 * mm, y + 5.5 * mm, x1, y + 5.5 * mm)
    c.line(xt - 6 * mm, y - 6.5 * mm, x1, y - 6.5 * mm)
    caps(c, xt, y - 1 * mm, "Net à payer TTC", size=7.6, color=NOIR)
    c.setFont(SERIF, 13)
    c.setFillColor(NOIR)
    c.drawRightString(x1, y - 1.5 * mm, euros(ttc))

    y -= 14 * mm
    c.setFont(SERIF_IT, 8.8)
    c.setFillColor(GRIS)
    c.drawRightString(x1, y, f"Arrêtée à la somme de {d['montant_lettres']}.")

    # ---- règlement
    y -= 8 * mm
    rule(c, x0, y, x1)
    y -= 8 * mm
    caps(c, x0, y, "Règlement")
    y -= 6.5 * mm

    r = d["reglement"]
    yg = y
    c.setFont(SERIF, 9)
    c.setFillColor(NOIR)
    c.drawString(x0, yg, r["mode"])
    yg -= 12
    for l in r["banque"]:
        c.setFont(SERIF, 9)
        c.setFillColor(NOIR)
        c.drawString(x0, yg, l)
        yg -= 11.5

    xd = x0 + colw + 14 * mm
    yd = y
    for label, val in r["echeance"]:
        caps(c, xd, yd, label, size=6.8)
        c.setFont(SERIF, 9)
        c.setFillColor(NOIR)
        c.drawString(xd, yd - 5.5 * mm, val)
        yd -= 13 * mm

    y = min(yg, yd) - 4 * mm

    # ---- mentions légales, en pied de page
    yl = 22 * mm + 4 * mm
    c.setFont(SANS, 6.6)
    c.setFillColor(GRIS)
    lignes = [sub for l in d["mentions"] for sub in wrap(l, SANS, 6.6, x1 - x0)]
    for sub in reversed(lignes):
        c.drawString(x0, yl, sub)
        yl += 8.6
    yl += 2
    rule(c, x0, yl - 4, x1)

    caps(c, (x0 + x1) / 2, 15.5 * mm, d["pied"], size=6.4, track=1.8, color=OR,
         center=True)

    c.showPage()
    c.save()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("usage : facture.py <donnees.json> [sortie.pdf]")
    source = sys.argv[1]
    sortie = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(source)[0] + ".pdf"
    build(data(source), sortie)
    print(sortie)
