# CV web (React + Vite + Tailwind)

Page CV épurée, données dans `data/cv.json`, typage dans `src/types/cv.ts`.

## Commandes

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # sortie dans dist/
npm run preview  # prévisualiser le build
```

## Modifier le contenu

Édite `data/cv.json` puis recharge la page (HMR en dev).

Renseigne la section `contact` (email, LinkedIn, etc.) et les liens du projet CRC Copilot quand tu les as.

## Stack

- [Vite](https://vite.dev/) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`)
