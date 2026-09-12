#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Génère une facture PDF aux couleurs de la maison.

Usage : python3 tools/facture/facture.py mes-donnees.json sortie.pdf
Le fichier de données suit la structure de `facture.exemple.json`.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from PIL import Image
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

import dates
import epc
from controles import anomalies
from lettres import montant_en_lettres

HERE = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------- palette
NOIR = HexColor("#14110D")
OR = HexColor("#A8884C")
GRIS = HexColor("#6B6559")
CREME = HexColor("#FBF8F1")
HAIRLINE = Color(168 / 255, 136 / 255, 76 / 255, 0.45)
PAPIER = HexColor("#FFFFFF")

SERIF = "Times-Roman"
SERIF_IT = "Times-Italic"
SANS = "Helvetica"

W, H = A4
mm = 2.83465
MG = 22 * mm
COTE_QR = 24 * mm


def data(chemin):
    with open(chemin, encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------- helpers
def caps(c, x, y, txt, font=SANS, size=7.2, track=1.6, color=GRIS, center=False,
         right=False):
    """Petites capitales tracées — la signature typographique de la maison."""
    txt = txt.upper()
    total = stringWidth(txt, font, size) + track * max(len(txt) - 1, 0)
    if center:
        x -= total / 2
    elif right:
        x -= total
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


def montant_ligne(ligne):
    return round(ligne["quantite"] * ligne["pu"], 2)


def quantite(ligne):
    """« 1 demi-journée », « 3 demi-journées » — accord fait à la volée."""
    n, unite = ligne["quantite"], ligne["unite"]
    if n > 1:
        unite = ligne.get("unite_pluriel") or (
            unite if unite.endswith(("s", "x")) else unite + "s"
        )
    return f"{n:g} {unite}".strip()


def euros(v):
    s = f"{v:,.2f}".replace(",", " ").replace(".", ",")
    return f"{s} €"


def logo():
    """Logo détouré de ses marges blanches, prêt à poser sur le papier."""
    chemin = os.path.join(HERE, "..", "..", "public", "logo-noir.png")
    src = Image.open(chemin).convert("RGBA")
    # Le PNG traîne un voile d'alpha résiduel (≈2 %) sur toute sa surface : il
    # se lit comme un carré gris à l'impression. On l'écrête avant de détourer.
    alpha = src.split()[3].point(lambda a: a if a > 60 else 0)
    src.putalpha(alpha)
    bbox = alpha.getbbox()
    return ImageReader(src.crop(bbox) if bbox else src)


# ------------------------------------------------------------ pagination
class Canevas(canvas.Canvas):
    """Canvas qui numérote ses pages.

    Le « x / y » ne peut s'écrire qu'une fois le total connu : on met les pages
    de côté et on les repasse à l'enregistrement.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._pages = []

    def showPage(self):
        self._pages.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self._pages)
        for numero, etat in enumerate(self._pages, 1):
            self.__dict__.update(etat)
            if total > 1:
                # Au-dessus du pied doré, qui est centré : côte à côte, les
                # deux se toucheraient sur les libellés longs.
                caps(self, W - MG, 20 * mm, f"page {numero} / {total}",
                     size=6.4, track=1.2, color=GRIS, right=True)
            super().showPage()
        super().save()


class Feuille:
    """Le canvas, la position d'écriture, et le passage à la page suivante.

    Toutes les pages réservent la même bande basse (mentions légales), même
    celles qui ne les portent pas : le bloc de texte reste à la même cote d'un
    feuillet à l'autre.
    """

    def __init__(self, c, d):
        self.c, self.d = c, d
        self.x0, self.x1 = MG, W - MG
        self.colw = (self.x1 - self.x0 - 14 * mm) / 2
        self.xc = self.x0 + self.colw + 14 * mm
        self.mentions = [sub for m in d["mentions"]
                         for sub in wrap(m, SANS, 6.6, self.x1 - self.x0)]
        self.plancher = 26 * mm + len(self.mentions) * 8.6 + 5 * mm
        self.bas = H
        self._ouvrir(premiere=True)

    # -- mécanique de page
    def _decor(self):
        c = self.c
        c.setFillColor(PAPIER)
        c.rect(0, 0, W, H, stroke=0, fill=1)
        # Cadre filet — le liseré de la carte, repris en impression.
        c.setStrokeColor(HAIRLINE)
        c.setLineWidth(0.5)
        c.rect(12 * mm, 12 * mm, W - 24 * mm, H - 24 * mm, stroke=1, fill=0)
        caps(c, (self.x0 + self.x1) / 2, 15.5 * mm, self.d["pied"], size=6.4,
             track=1.8, color=OR, center=True)

    def _ouvrir(self, premiere):
        c, d = self.c, self.d
        self._decor()
        self.y = H - 26 * mm

        if premiere:
            img = logo()
            iw, ih = img.getSize()
            hl = 15 * mm
            c.drawImage(img, self.x0, self.y - hl + 1 * mm, width=hl * iw / ih,
                        height=hl, mask="auto")
            caps(c, self.x1, self.y - 2 * mm, "Facture", font=SANS, size=13,
                 track=5.5, color=NOIR, right=True)
            c.setFont(SERIF, 9)
            c.setFillColor(GRIS)
            c.drawRightString(self.x1, self.y - 9 * mm, f"N° {d['numero']}")
            c.drawRightString(self.x1, self.y - 13.5 * mm,
                              f"Le {dates.en_toutes_lettres(d['date'])}")
            self.y -= 24 * mm
        else:
            caps(c, self.x0, self.y - 2 * mm, f"Facture n° {d['numero']} — suite",
                 size=7.2, color=GRIS)
            self.y -= 8 * mm

        self.trait()
        self.y -= 9 * mm

    def page_suivante(self):
        self.c.showPage()
        self._ouvrir(premiere=False)

    def tient(self, hauteur):
        return self.y - hauteur >= self.plancher

    def reserver(self, hauteur):
        """Bascule de page si le bloc n'entre pas d'un tenant."""
        if not self.tient(hauteur):
            self.page_suivante()

    # -- primitives de tracé
    def trait(self, **kw):
        rule(self.c, self.x0, self.y, self.x1, **kw)

    def ecrire(self, x, y, texte, font=SERIF, size=9, color=NOIR):
        self.c.setFont(font, size)
        self.c.setFillColor(color)
        self.c.drawString(x, y, texte)
        self.bas = min(self.bas, y)

    def bloc(self, x, y, texte, font=SERIF, size=9, leading=12.5, maxw=200,
             color=NOIR):
        y = para(self.c, x, y, texte, font, size, leading, maxw, color)
        self.bas = min(self.bas, y + leading)
        return y


# ------------------------------------------------------------- fragments
def partie(f, x, y, p):
    """Bloc « émetteur » ou « facturé à »."""
    f.ecrire(x, y, p["nom"], size=10.5)
    y -= 12
    y = f.bloc(x, y, p["forme"], size=8.8, leading=11.5, maxw=f.colw, color=GRIS)
    for l in p["adresse"]:
        f.ecrire(x, y, l)
        y -= 11.5
    y -= 2
    for l in p["identite"]:
        y = f.bloc(x, y, l, size=8.6, leading=10.5, maxw=f.colw, color=GRIS)
    return y


def entete_tableau(f):
    col_qte = f.x1 - 92 * mm
    col_pu = f.x1 - 40 * mm
    caps(f.c, f.x0, f.y, "Désignation")
    caps(f.c, col_qte, f.y, "Qté")
    caps(f.c, col_pu, f.y, "Prix unitaire HT", right=True)
    caps(f.c, f.x1, f.y, "Montant HT", right=True)
    f.y -= 3 * mm
    f.trait(color=NOIR, width=0.7)
    f.y -= 7 * mm
    return col_qte, col_pu


def hauteur_ligne(f, ligne, largeur_details):
    haut = 12.5 + 3 * mm
    for detail in ligne["details"]:
        haut += len(wrap(detail, SERIF_IT, 8.6, largeur_details)) * 11.5
    return haut


def hauteur_cloture(f):
    """Totaux + montant en lettres + règlement : un bloc qu'on ne coupe pas.

    Calquée sur la géométrie réellement tracée plus bas — une estimation à la
    louche ferait basculer en page 2 des factures qui tiennent sur une seule.
    """
    entete = 13 + 9 * mm + 11 * mm + 7 * mm + 7 * mm + 6.5 * mm
    # Colonne de gauche : mode + titulaire, IBAN, BIC, banque.
    # Colonne du milieu : échéance et conditions. À droite, le QR de virement.
    colonnes = max(12 + 3 * 11.5, 13 * mm + 5.5 * mm)
    return entete + colonnes + 2 * mm  # 2 mm de marge pour les jambages


def qr_virement(f, r, ttc, y_haut):
    """Carré EPC, dans le vide à gauche du cartouche : le payeur scanne, son
    application pré-remplit le virement — bénéficiaire, IBAN, montant,
    référence. Placé là, il jouxte la somme qu'il encode et ne coûte pas une
    ligne de hauteur.

    Sauté en silence si l'IBAN n'est pas exploitable (gabarit à trous) ou si
    `segno` n'est pas installé : le PDF reste valable, il perd un raccourci.
    """
    try:
        texte = epc.payload(
            nom=r["titulaire"],
            iban=r["iban"],
            montant=ttc,
            bic=r["bic"],
            communication=f"Facture {f.d['numero']}",
        )
        png = epc.image(texte)
    except (ValueError, ImportError):
        return

    y = y_haut + 3 * mm - COTE_QR
    f.c.drawImage(ImageReader(png), f.x0, y, width=COTE_QR, height=COTE_QR,
                  mask="auto")
    caps(f.c, f.x0, y - 4 * mm, "Virement SEPA — à scanner", size=5.8,
         track=1.1, color=GRIS)
    f.bas = min(f.bas, y - 4 * mm)


# ---------------------------------------------------------------- rendu
def build(d, sortie):
    c = Canevas(sortie, pagesize=A4)
    c.setTitle(f"Facture {d['numero']} — {d['emetteur']['nom']}")
    c.setAuthor(d["emetteur"]["nom"])
    c.setSubject(d["objet"])

    f = Feuille(c, d)

    # ---- émetteur / client
    caps(c, f.x0, f.y, "Émetteur")
    caps(c, f.xc, f.y, "Facturé à")
    ya = partie(f, f.x0, f.y - 6.5 * mm, d["emetteur"])
    yb = partie(f, f.xc, f.y - 6.5 * mm, d["client"])

    f.y = min(ya, yb) - 6 * mm
    f.trait()
    f.y -= 9 * mm

    # ---- objet
    caps(c, f.x0, f.y, "Objet")
    f.y -= 6.5 * mm
    f.y = f.bloc(f.x0, f.y, d["objet"], size=9.6, leading=13,
                 maxw=f.x1 - f.x0) - 3 * mm

    # ---- tableau
    f.y -= 4 * mm
    col_qte, col_pu = entete_tableau(f)
    largeur_details = col_qte - f.x0 - 8 * mm

    for ligne in d["lignes"]:
        if not f.tient(hauteur_ligne(f, ligne, largeur_details)):
            f.page_suivante()
            col_qte, col_pu = entete_tableau(f)

        f.ecrire(f.x0, f.y, ligne["titre"], size=10)
        f.ecrire(col_qte, f.y, quantite(ligne), size=10)
        c.setFont(SERIF, 10)
        c.setFillColor(NOIR)
        c.drawRightString(col_pu, f.y, euros(ligne["pu"]))
        c.drawRightString(f.x1, f.y, euros(montant_ligne(ligne)))
        f.y -= 12.5
        for detail in ligne["details"]:
            f.y = f.bloc(f.x0 + 4 * mm, f.y, detail, font=SERIF_IT, size=8.6,
                         leading=11.5, maxw=largeur_details, color=GRIS)
        f.y -= 3 * mm

    f.y += 1 * mm
    f.trait()
    f.y -= 8 * mm

    # ---- totaux et règlement : jamais séparés du tableau par une coupure
    f.reserver(hauteur_cloture(f))

    ht = round(sum(montant_ligne(l) for l in d["lignes"]), 2)
    tva = round(ht * d["taux_tva"] / 100, 2)
    ttc = round(ht + tva, 2)
    xt = f.x1 - 62 * mm

    y_totaux = f.y
    f.ecrire(xt, f.y, "Total HT", size=9.5, color=GRIS)
    c.setFillColor(NOIR)
    c.drawRightString(f.x1, f.y, euros(ht))
    f.y -= 13
    taux = f"{d['taux_tva']:g}".replace(".", ",")
    f.ecrire(xt, f.y, f"TVA {taux} %", size=9.5, color=GRIS)
    c.setFillColor(NOIR)
    c.drawRightString(f.x1, f.y, euros(tva))
    f.y -= 9 * mm

    c.setFillColor(CREME)
    c.rect(xt - 6 * mm, f.y - 6.5 * mm, f.x1 - xt + 6 * mm, 12 * mm, stroke=0, fill=1)
    c.setStrokeColor(OR)
    c.setLineWidth(0.7)
    c.line(xt - 6 * mm, f.y + 5.5 * mm, f.x1, f.y + 5.5 * mm)
    c.line(xt - 6 * mm, f.y - 6.5 * mm, f.x1, f.y - 6.5 * mm)
    caps(c, xt, f.y - 1 * mm, "Net à payer TTC", size=7.6, color=NOIR)
    c.setFont(SERIF, 13)
    c.setFillColor(NOIR)
    c.drawRightString(f.x1, f.y - 1.5 * mm, euros(ttc))
    f.bas = min(f.bas, f.y - 6.5 * mm)

    qr_virement(f, d["reglement"], ttc, y_totaux)

    f.y -= 11 * mm
    # Le montant en lettres est calculé : recopié à la main, il finirait par
    # contredire le total chiffré sur une pièce comptable.
    lettres = d.get("montant_lettres") or montant_en_lettres(ttc)
    c.setFont(SERIF_IT, 8.8)
    c.setFillColor(GRIS)
    c.drawRightString(f.x1, f.y, f"Arrêtée à la somme de {lettres} toutes taxes comprises.")
    f.bas = min(f.bas, f.y)

    # ---- règlement
    f.y -= 7 * mm
    f.trait()
    f.y -= 7 * mm
    caps(c, f.x0, f.y, "Règlement")
    f.y -= 6.5 * mm

    r = d["reglement"]
    y = f.y
    f.ecrire(f.x0, y, f"{r['mode']} Titulaire : {r['titulaire']}.")
    y -= 12
    for l in (f"IBAN : {r['iban']}", f"BIC : {r['bic']}",
              f"Banque : {r['banque']}"):
        f.ecrire(f.x0, y, l)
        y -= 11.5

    # Colonne du milieu : l'échéance, calculée depuis la date et le délai.
    due = dates.echeance(d["date"], r["delai"])
    conditions = dates.DELAIS[r["delai"]]
    if r.get("reference"):
        conditions += f" ({r['reference']})"

    y = f.y
    for label, valeur in (("Date d'échéance", dates.en_toutes_lettres(due)),
                          ("Conditions de règlement", conditions)):
        caps(c, f.xc, y, label, size=6.8)
        y = f.bloc(f.xc, y - 5.5 * mm, valeur, size=9, leading=11,
                   maxw=f.x1 - f.xc - COTE_QR - 6 * mm) - 2 * mm

    # ---- mentions légales, sur le dernier feuillet seulement
    yl = 26 * mm
    c.setFont(SANS, 6.6)
    c.setFillColor(GRIS)
    for sub in reversed(f.mentions):
        c.drawString(f.x0, yl, sub)
        yl += 8.6
    rule(c, f.x0, yl - 2, f.x1)

    # Garde-fou : si une estimation de hauteur était trop optimiste, mieux vaut
    # refuser que livrer une facture dont le texte mord sur les mentions.
    debordement = yl - f.bas
    if debordement > 0:
        raise ValueError(
            f"le contenu déborde de {debordement / mm:.0f} mm sur les mentions "
            "légales — signalez-le, la réserve de bas de page est à corriger"
        )

    c.showPage()
    c.save()


def main(argv):
    if len(argv) < 2:
        return "usage : facture.py <donnees.json> [sortie.pdf]"

    source = argv[1]
    sortie = argv[2] if len(argv) > 2 else os.path.splitext(source)[0] + ".pdf"
    d = data(source)

    erreurs, avertissements = anomalies(d)
    for a in avertissements:
        print(f"⚠ {a}", file=sys.stderr)
    if erreurs:
        return "\n".join(f"✗ {e}" for e in erreurs)

    try:
        build(d, sortie)
    except ValueError as e:
        return f"✗ {e}"
    print(sortie)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
