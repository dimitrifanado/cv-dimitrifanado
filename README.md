# CV — application web personnelle

Site **one-page** présentant mon CV : profil, parcours, compétences, formation, projet mis en avant et *personal stack*. Les contenus éditoriaux vivent dans un fichier JSON ; l’interface est responsive, avec une **barre latérale** sur grand écran et des **raccourcis** (Contact, Navigation, PDF) sur mobile.

## Stack technique

| Domaine        | Choix |
|----------------|--------|
| Build / dev    | [Vite](https://vite.dev/) 8 |
| UI             | [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/) |
| Styles         | [Tailwind CSS](https://tailwindcss.com/) v4 (`@tailwindcss/vite`) |
| Polices        | IBM Plex Sans & IBM Plex Mono (Google Fonts) |
| Export PDF     | [html-to-image](https://github.com/bubkoo/html-to-image) + [jsPDF](https://github.com/parallax/jsPDF) |
| Hébergement cible | [GitHub Pages](https://pages.github.com/) (`base` configuré dans `vite.config.ts`) |

## Prérequis

- [Node.js](https://nodejs.org/) (LTS recommandé, ex. 20+)

## Installation et commandes

```bash
npm install
npm run dev       # serveur local (voir l’URL affichée dans le terminal)
npm run build     # sortie dans dist/
npm run preview   # prévisualiser le build de production
npm run lint      # ESLint
```

## Modifier le contenu

1. Éditer **`data/cv.json`** (schéma décrit dans **`src/types/cv.ts`**).
2. Recharger la page ; en développement, le rechargement à chaud (HMR) met à jour la plupart des changements sans recharger tout le navigateur.

### Assets

- Fichiers statiques (photo, portfolio, favicon) : dossier **`public/`**.
- Les chemins du type `/profile.JPG` sont préfixés automatiquement par `import.meta.env.BASE_URL` (voir **`src/publicAssetUrl.ts`**) pour fonctionner sous un sous-chemin (GitHub Pages).

### Affiches Culture (films / séries)

Les jaquettes proviennent du CDN [The Movie Database (TMDB)](https://www.themoviedb.org/) ; l’attribution est rappelée en pied de page du site.

## Interface

- **Desktop / tablette (md+)** : sidebar fixe (photo, contact, liens de section, bouton PDF).
- **Mobile** : la sidebar est un tiroir (bouton menu dans l’en-tête) ; une **barre fixe en bas** propose **Contact** (ouvre le menu et fait défiler vers les coordonnées), **Navigation** (menu + ancres des sections) et **PDF** (aperçu + enregistrement).

## Licence & crédits

Contenu du CV et code : usage personnel. Les données TMDB sont soumises aux conditions d’utilisation de [TMDB](https://www.themoviedb.org/documentation/api/terms-of-use).
