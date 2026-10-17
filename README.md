# Fahd Abd El All — Site CV

Site CV personnel en ligne sur **https://y0lnut.github.io/fahd-abdelall/**, bilingue FR / EN, statique (HTML + CSS + JavaScript, sans build), hébergé gratuitement sur **GitHub Pages**.

## Aperçu

| Section | Contenu |
|---|---|
| Accueil | Nom, pitch et terminal animé qui « passe la recette » du profil, puis affiche la photo |
| Expérience | BNP Paribas, Samsic Facility, Falcon Samsic, Falcon Security |
| Projets | Démos interactives de Mail Scrapper V4.2 (avec cache) et de l'app d'emailing |
| Formation | NEOMA, John Carroll University, Epitech |
| Compétences | Outils, CRM, gestion de projet, soft skills, langues |
| Contact | Email uniquement (adresse reconstruite en JavaScript pour limiter les robots) |

Le bouton **FR / EN** bascule la langue ; `?lang=en` dans l'URL force l'anglais (pratique pour une candidature internationale).

## Structure

```
fahd-cv-site/
├── index.html                 # Squelette de la page
├── content/
│   ├── fr.json                # ✏️ Tout le texte en français
│   └── en.json                # ✏️ Tout le texte en anglais
├── assets/
│   ├── css/style.css          # Design (couleurs dans :root)
│   ├── js/main.js             # Affiche le contenu des JSON
│   ├── fonts/                 # Bricolage Grotesque + JetBrains Mono (auto-hébergées)
│   ├── img/                   # photo.jpg, photo-square.jpg, favicon.svg
│   └── docs/                  # CV PDF téléchargeables (FR + EN)
├── tools/build_cv.py          # Génère les CV PDF FR/EN
├── docs/ROADMAP.md            # Étapes et idées pour la suite
└── .github/workflows/deploy.yml  # Déploiement automatique sur GitHub Pages
```

**Pour modifier le contenu, il suffit d'éditer `content/fr.json` et `content/en.json`** — pas besoin de toucher au HTML.

## Lancer en local

Le site lit des fichiers JSON, il faut donc un petit serveur (ouvrir `index.html` en double-clic ne suffit pas) :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Ou avec VS Code : extension **Live Server** → clic droit sur `index.html` → *Open with Live Server*.

## Mettre en ligne sur GitHub

1. Créer un dépôt vide sur [github.com/new](https://github.com/new) — par exemple `cv` ou `fahd-abdelall` (public, sans README).
2. Dans ce dossier :
   ```bash
   git remote add origin https://github.com/<ton-pseudo>/<nom-du-repo>.git
   git push -u origin main
   ```
3. Sur GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
4. Après ~1 minute, le site est en ligne sur `https://<ton-pseudo>.github.io/<nom-du-repo>/`.

> Astuce : nommer le dépôt `<ton-pseudo>.github.io` donne l'URL plus courte `https://<ton-pseudo>.github.io/`.

## Personnaliser

- **Contact** : par choix de sécurité, le seul moyen de contact est l'email (aucun numéro de téléphone, ni sur le site ni dans les PDF).
- **Couleurs** : variables `--ink` et `--brass` en haut de `assets/css/style.css`.
- **CV PDF** : générés depuis les mêmes JSON avec `python tools/build_cv.py` (nécessite `pip install playwright` puis `playwright install chromium`).
- **Domaine perso** (ex. `fahdabdelall.com`) : voir `docs/ROADMAP.md`.
