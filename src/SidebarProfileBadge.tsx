/**
 * Bloc profil dans la barre latérale : photo, identité, liens de contact.
 * L’id `nav-contact` sert d’ancre pour le bloc coordonnées.
 */
import { publicAssetUrl } from './publicAssetUrl'
import type { NavContact, Profile } from './types/cv'

/** Construit un lien `tel:` à partir d’un numéro affiché (France / international). */
function phoneToTelHref(display: string): string {
  const digits = display.replace(/\D/g, '')
  if (!digits) return '#'
  if (digits.startsWith('33')) return `tel:+${digits}`
  if (digits.startsWith('0') && digits.length === 10)
    return `tel:+33${digits.slice(1)}`
  return `tel:+${digits}`
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function resolveProfilePhoto(photoUrl: string | null): string | null {
  if (!photoUrl?.trim()) return null
  const t = photoUrl.trim()
  if (/^https?:\/\//i.test(t)) return t
  const path = t.startsWith('/') ? t : `/${t}`
  return publicAssetUrl(path)
}

const linkRowClass =
  'flex items-start gap-1.5 rounded-lg px-1.5 py-1 text-[11px] leading-snug text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 md:gap-2.5 md:px-2 md:py-1.5 md:text-xs'
const iconClass =
  'mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400 md:h-4 md:w-4'

export function SidebarProfileBadge({
  profile,
  contact,
  onNavigate,
}: {
  profile: Profile
  contact: NavContact
  onNavigate?: () => void
}) {
  const photoSrc = resolveProfilePhoto(profile.photoUrl)
  const mapsQuery = encodeURIComponent(contact.address)
  const githubHandle = contact.github.replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\/$/, '')

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200/90 bg-gradient-to-b from-white to-zinc-50/80 shadow-sm ring-1 ring-zinc-100/80 md:rounded-2xl">
      <div className="relative flex h-[4.25rem] w-full shrink-0 items-center justify-center bg-white px-1 py-0.5 md:aspect-[4/3] md:h-auto md:px-2.5 md:py-0 md:pb-1 md:pt-2.5">
        {photoSrc ? (
          <img
            alt={`Portrait — ${profile.name}`}
            className="max-h-full max-w-full rounded-xl object-contain object-center shadow-sm ring-1 ring-zinc-200/80 [image-rendering:auto]"
            decoding="async"
            src={photoSrc}
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 text-2xl font-bold tracking-tight text-zinc-600 md:text-3xl"
          >
            {initialsFromName(profile.name)}
          </div>
        )}
      </div>

      <div className="px-2 pb-2 pt-0.5 md:px-4 md:pb-4 md:pt-1">
        <a
          className="block text-center text-sm font-semibold leading-snug tracking-tight text-zinc-900 transition-colors hover:text-zinc-600 md:text-base"
          href="#apropos"
          onClick={onNavigate}
        >
          {profile.name}
        </a>

        {(profile.birthDateLabel?.trim() ||
          profile.familyStatus?.trim() ||
          profile.driverLicense?.trim()) ? (
          <div className="mt-1.5 space-y-0.5 text-center text-[10px] leading-snug text-zinc-600 md:mt-2 md:space-y-1 md:text-xs">
            {profile.birthDateLabel?.trim() ? (
              <p className="flex items-center justify-center gap-2">
                <svg
                  aria-hidden
                  className="h-3 w-3 shrink-0 text-zinc-400 md:h-3.5 md:w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{profile.birthDateLabel.trim()}</span>
              </p>
            ) : null}
            {profile.familyStatus?.trim() ? (
              <p>{profile.familyStatus.trim()}</p>
            ) : null}
            {profile.driverLicense?.trim() ? (
              <p>{profile.driverLicense.trim()}</p>
            ) : null}
          </div>
        ) : null}

        <ul
          className="mt-2 space-y-0 border-t border-zinc-200/70 pt-2 md:mt-3 md:space-y-0.5 md:pt-3"
          id="nav-contact"
        >
        <li>
          <a
            className={linkRowClass}
            href={phoneToTelHref(contact.phone)}
            onClick={onNavigate}
          >
            <svg
              aria-hidden
              className={iconClass}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              viewBox="0 0 24 24"
            >
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-medium text-zinc-700">{contact.phone}</span>
          </a>
        </li>
        <li>
          <a
            className={linkRowClass}
            href={`mailto:${contact.email}`}
            onClick={onNavigate}
          >
            <svg
              aria-hidden
              className={iconClass}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              viewBox="0 0 24 24"
            >
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="m22 6-10 7L2 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="break-all">{contact.email}</span>
          </a>
        </li>
        <li>
          <a
            className={linkRowClass}
            href={contact.github}
            onClick={onNavigate}
            rel="noreferrer"
            target="_blank"
          >
            <svg aria-hidden className={iconClass} fill="currentColor" viewBox="0 0 24 24">
              <path
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
                fillRule="evenodd"
              />
            </svg>
            <span className="truncate" title={contact.github}>
              GitHub
              {githubHandle ? (
                <span className="text-zinc-400"> · {githubHandle}</span>
              ) : null}
            </span>
          </a>
        </li>
        <li>
          <a
            className={linkRowClass}
            href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
            onClick={onNavigate}
            rel="noreferrer"
            target="_blank"
          >
            <svg
              aria-hidden
              className={iconClass}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              viewBox="0 0 24 24"
            >
              <path
                d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{contact.address}</span>
          </a>
        </li>
      </ul>
      </div>
    </div>
  )
}
