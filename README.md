# Fahd Abd El All — Site CV

Site CV personnel en ligne sur **https://y0lnut.github.io/fahd-abdelall/**, trilingue français / anglais / arabe (avec mise en page de droite à gauche), statique (HTML + CSS + JavaScript, sans build), hébergé gratuitement sur **GitHub Pages**.

## Aperçu

| Page | Contenu |
|---|---|
| `index.html` | Accueil : nom qui se décode, rôles qui défilent, portrait révélé, « Ce que j'apporte » |
| `parcours.html` | Chronologie des expériences (ligne qui se remplit au défilement) et formation |
| `projets.html` | Démos jouables de Mail Scrapper V4.2 (avec cache) et de l'app d'emailing |
| `competences.html` | Compétences, langues, centres d'intérêt |
| `contact.html` | Email uniquement (adresse reconstruite en JavaScript pour limiter les robots) |
| `404.html` | Page d'erreur façon terminal |

Le positionnement reste volontairement ouvert : gestion de projet, conseil, key account management, business development.

### Easter eggs
- **`/`** (ou Ctrl/Cmd + K) ouvre un terminal : `help`, `parcours`, `projets`, `cv`, `email`, `recette`, `theme`, `lang`, `whoami`, `ls`… et `sudo hire fahd`.
- **Code Konami** (↑ ↑ ↓ ↓ ← → ← → B A) : pluie de confettis.
- **5 clics rapides sur le logo** : mode « plan » qui affiche la structure de la page.
- **Console du navigateur** : un message pour les curieux qui inspectent le code.

## Structure

```
fahd-cv-site/
├── index.html, parcours.html, projets.html,
│   competences.html, contact.html, 404.html
├── content/
│   ├── fr.json                # ✏️ Tout le texte en français
│   ├── en.json                # ✏️ Tout le texte en anglais
│   └── ar.json                # ✏️ Tout le texte en arabe
├── assets/
│   ├── css/style.css          # Design (couleurs dans :root)
│   ├── js/main.js             # Rendu des pages, effets, terminal, easter eggs
│   ├── fonts/                 # Bricolage Grotesque, JetBrains Mono, Readex Pro pour l'arabe
│   ├── img/                   # photo.jpg, photo-square.jpg, favicon.svg
│   └── docs/                  # CV PDF téléchargeables (FR + EN)
├── tools/build_cv.py          # Génère les CV PDF FR/EN
├── docs/ROADMAP.md            # Étapes et idées pour la suite
└── .github/workflows/deploy.yml  # Déploiement automatique sur GitHub Pages
```

**Pour modifier le contenu, il suffit d'éditer `content/fr.json`, `content/en.json` et `content/ar.json`** — pas besoin de toucher au HTML.

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
