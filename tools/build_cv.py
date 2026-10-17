"""Génère les CV PDF (FR et EN) à partir de content/fr.json et content/en.json.

Usage (depuis la racine du dépôt) :
    pip install playwright && playwright install chromium
    python tools/build_cv.py

Les PDF sont écrits dans assets/docs/. Le seul moyen de contact affiché est l'email.
"""
import html
import json
import pathlib

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "y0lnut.github.io/fahd-abdelall"

EXTRA = {
    "fr": {
        "headline": "Master TEMA, Digital Management",
        "school": "NEOMA Business School, Paris",
        "profile": "Étudiant en Master Digital Management à NEOMA Business School, avec une double expérience en développement commercial B2B chez Samsic Facility et en gestion de projets bancaires chez BNP Paribas. Formé en France, aux États-Unis et au Qatar, je combine rigueur analytique, autonomie et sens du résultat pour mener des projets à forte valeur ajoutée.",
        "labels": {"contact": "Contact", "email": "Email", "site": "Site", "loc": "Localisation", "mob": "Mobilité", "langs": "Langues",
                    "skills": "Compétences", "soft": "Savoir-être", "interests": "Centres d'intérêt",
                    "exp": "Expérience professionnelle", "edu": "Formation", "proj": "Projets"},
        "location": "Paris, Doha, Le Caire",
        "mobility": "Ouvert aux offres en France et à l'international",
        "file": "CV_Fahd_Abd_El_All_FR.pdf",
    },
    "en": {
        "headline": "Master's in TEMA, Digital Management",
        "school": "NEOMA Business School, Paris",
        "profile": "Master's student in Digital Management at NEOMA Business School, with dual experience in B2B business development at Samsic Facility and banking project management at BNP Paribas. Educated in France, the United States and Qatar. Autonomous, analytical and results-driven, with strong skills in prospecting, automation and project coordination.",
        "labels": {"contact": "Contact", "email": "Email", "site": "Website", "loc": "Location", "mob": "Mobility", "langs": "Languages",
                    "skills": "Skills", "soft": "Soft skills", "interests": "Interests",
                    "exp": "Professional experience", "edu": "Education", "proj": "Projects"},
        "location": "Paris, Doha, Cairo",
        "mobility": "Open to roles in France and abroad",
        "file": "CV_Fahd_Abd_El_All_EN.pdf",
    },
}

e = html.escape


def build_html(d, x):
    L = x["labels"]
    email = f'{d["contact"]["user"]}@{d["contact"]["host"]}'
    hard = [g for g in d["skills"] if g is not d["skills"][-1]]
    soft = d["skills"][-1]["items"]
    exp = "".join(
        f"""<div class="job"><div class="job-h"><h3>{e(j['role'])}</h3><span>{e(j['period'])}</span></div>
        <p class="co">{e(j['company'])}, {e(j['location'])}</p>
        <ul>{''.join(f'<li>{e(p)}</li>' for p in j['points'])}</ul></div>"""
        for j in d["experience"])
    edu = "".join(
        f"""<div class="edu"><div><strong>{e(s['school'])}</strong> <span>{e(s['degree'])}, {e(s['place'])}</span></div><em>{e(s['period'])}</em></div>"""
        for s in d["education"])
    proj = "".join(
        f"""<div class="proj"><h3>{e(p['name'])} <span>{e(p['stack'])}</span></h3><p>{e(p['description'])}</p></div>"""
        for p in (d["scrapper"], d["mailer"]))
    langs = "".join(f"<li><b>{e(l['name'])}</b> {e(l['level'])}</li>" for l in d["languages"])
    skills = "".join(f"<p class='sg'><b>{e(g['group'])}</b><br>{e(', '.join(g['items']))}</p>" for g in hard)
    fonts = (ROOT / "assets/fonts").as_uri()
    photo = (ROOT / "assets/img/photo.jpg").as_uri()
    return f"""<!doctype html><html lang="{d['lang']}"><head><meta charset="utf-8"><style>
@font-face{{font-family:B;src:url('{fonts}/BricolageGrotesque.woff2');font-weight:200 800;font-stretch:75% 100%}}
@page{{size:A4;margin:0}}
*{{box-sizing:border-box}}
body{{margin:0;font:400 9pt/1.37 B,sans-serif;color:#142033;width:210mm;height:297mm;display:grid;grid-template-columns:66mm 1fr}}
aside{{background:#101c2e;color:#d6deea;padding:11mm 8mm 9mm}}
aside img{{width:42mm;aspect-ratio:1/1;margin-left:auto;margin-right:auto;object-fit:cover;object-position:50% 25%;border-radius:4mm;margin-bottom:7mm}}
aside h2{{font-size:10.5pt;font-weight:700;color:#d9b66a;margin:0 0 2.5mm;padding-bottom:1.5mm;border-bottom:.3mm solid #2b3b55}}
aside section{{margin-bottom:5.5mm}}
aside p{{margin:0 0 2.2mm}} aside .k{{display:block;color:#8494ab;font-size:8pt}}
aside a{{color:#fff;text-decoration:none;word-break:break-all}}
aside ul{{list-style:none;margin:0;padding:0}} aside li{{margin-bottom:1.4mm}} aside li b{{color:#fff;font-weight:600}}
.sg b{{color:#fff;font-weight:600}}
main{{padding:11mm 12mm 9mm 11mm}}
h1{{font-size:32pt;line-height:.9;font-weight:800;font-stretch:75%;margin:0 0 2.5mm;color:#101c2e}}
.hl{{font-size:12pt;font-weight:600;color:#b98d35;margin:0}} .sch{{margin:0 0 4mm;color:#56647a}}
.pf{{color:#3c4a5e;margin:0 0 5mm;padding-left:3.5mm;border-left:.8mm solid #b98d35}}
main h2{{font-size:12pt;font-weight:800;font-stretch:75%;color:#101c2e;margin:0 0 2.5mm;padding-bottom:1.2mm;border-bottom:.3mm solid #cfd6df;letter-spacing:.01em}}
main section{{margin-bottom:4.5mm}}
.job{{margin-bottom:3mm}} .job-h{{display:flex;justify-content:space-between;align-items:baseline;gap:4mm}}
h3{{font-size:10.5pt;margin:0;font-weight:700}} .job-h span{{color:#56647a;font-size:8.8pt;white-space:nowrap}}
.co{{margin:.4mm 0 1.2mm;color:#b98d35;font-weight:600;font-size:9pt}}
ul{{margin:0;padding-left:4mm}} main li{{margin-bottom:.3mm}}
.edu{{display:flex;justify-content:space-between;gap:4mm;margin-bottom:1.4mm}} .edu span{{color:#56647a}} .edu em{{font-style:normal;white-space:nowrap;color:#b98d35;font-weight:600}}
.proj{{margin-bottom:2.6mm}} .proj h3 span{{font-weight:500;color:#b98d35;font-size:9pt;margin-left:2mm}} .proj p{{margin:.6mm 0 0;color:#3c4a5e}}
</style></head><body>
<aside>
  <img src="{photo}" alt="">
  <section><h2>{L['contact']}</h2>
    <p><span class="k">{L['email']}</span><a href="mailto:{email}">{email}</a></p>
    <p><span class="k">{L['site']}</span><a href="https://{SITE}/">{SITE}</a></p>
    <p><span class="k">{L['loc']}</span>{x['location']}</p>
    <p><span class="k">{L['mob']}</span>{e(x['mobility'])}</p></section>
  <section><h2>{L['langs']}</h2><ul>{langs}</ul></section>
  <section><h2>{L['skills']}</h2>{skills}</section>
  <section><h2>{L['soft']}</h2><p>{e(', '.join(soft))}</p></section>
  <section><h2>{L['interests']}</h2><p>{e(', '.join(d['interests']))}</p></section>
</aside>
<main>
  <h1>{e(d['hero']['first'])} {e(d['hero']['last'])}</h1>
  <p class="hl">{e(x['headline'])}</p><p class="sch">{e(x['school'])}</p>
  <p class="pf">{e(x['profile'])}</p>
  <section><h2>{L['exp']}</h2>{exp}</section>
  <section><h2>{L['edu']}</h2>{edu}</section>
  <section><h2>{L['proj']}</h2>{proj}</section>
</main></body></html>"""


def main():
    with sync_playwright() as p:
        b = p.chromium.launch()
        for lang, x in EXTRA.items():
            d = json.loads((ROOT / f"content/{lang}.json").read_text(encoding="utf-8"))
            tmp = ROOT / f"tools/.cv_{lang}.html"
            tmp.write_text(build_html(d, x), encoding="utf-8")
            pg = b.new_page()
            pg.goto(tmp.as_uri(), wait_until="networkidle")
            pg.pdf(path=str(ROOT / "assets/docs" / x["file"]), format="A4", print_background=True,
                   margin={"top": "0", "right": "0", "bottom": "0", "left": "0"})
            tmp.unlink()
            print("ok", x["file"])
        b.close()


if __name__ == "__main__":
    main()
