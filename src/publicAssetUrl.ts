/**
 * Préfixe les chemins vers `public/` avec `import.meta.env.BASE_URL`
 * (ex. GitHub Pages : `/cv-dimitrifanado/`).
 * Laisser inchangé les URLs `http(s):` et `data:`.
 */
export function publicAssetUrl(href: string): string {
  const t = href.trim()
  if (
    !t.startsWith('/') ||
    t.startsWith('//') ||
    /^https?:\/\//i.test(t)
  ) {
    return href
  }
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}${t}`
}
