/**
 * Maquette A4 pour l’export PDF (aperçu + capture `html-to-image` + jsPDF).
 */
import { useMemo, type ReactNode } from 'react'
import { publicAssetUrl } from './publicAssetUrl'
import type {
  CvDocument,
  Experience,
  FieldDecade,
  PersonalStackEntry,
} from './types/cv'

function resolveProfilePhoto(photoUrl: string | null): string | null {
  if (!photoUrl?.trim()) return null
  const t = photoUrl.trim()
  if (/^https?:\/\//i.test(t)) return t
  const path = t.startsWith('/') ? t : `/${t}`
  return publicAssetUrl(path)
}

function githubShort(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\/$/, '')
}

function phoneToTelHref(display: string): string {
  const digits = display.replace(/\D/g, '')
  if (!digits) return '#'
  if (digits.startsWith('33')) return `tel:+${digits}`
  if (digits.startsWith('0') && digits.length === 10)
    return `tel:+33${digits.slice(1)}`
  return `tel:+${digits}`
}

const pdfContactIconClass =
  'mt-0.5 h-3 w-3 shrink-0 text-zinc-400 [print-color-adjust:exact]'

/** Carte type « badge » : bordure légère, pas de fond de colonne derrière */
function PdfBadge({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-zinc-200 bg-white p-3 [print-color-adjust:exact] ${className}`}
    >
      {children}
    </div>
  )
}

function MainSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2.5 border-b border-zinc-300 pb-1.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
      {children}
    </h2>
  )
}

function BadgeSectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
      {children}
    </p>
  )
}

/** Une entrée de la frise (point sur le trait vertical, comme le site) */
function PdfTimelineItem({ children }: { children: ReactNode }) {
  return (
    <li className="relative space-y-1.5 pb-1">
      <span
        aria-hidden
        className="absolute -left-[17px] top-[0.35rem] h-2 w-2 rounded-full border-2 border-white bg-zinc-400 shadow-sm ring-1 ring-zinc-200"
      />
      {children}
    </li>
  )
}

function PdfPersonalStackBlock({ items }: { items: PersonalStackEntry[] }) {
  return (
    <div className="space-y-1.5 text-left text-[9px] leading-snug text-zinc-900">
      {items.map((entry, idx) => {
        if (entry.type === 'line') {
          return (
            <p className="font-semibold" key={`line-${idx}`}>
              {entry.label}
            </p>
          )
        }
        if (entry.type === 'culture') {
          return (
            <p className="font-semibold" key={`culture-${idx}`}>
              {entry.title}
            </p>
          )
        }
        if (entry.type === 'portfolio') {
          return (
            <p className="font-semibold" key={entry.id}>
              {entry.category}
            </p>
          )
        }
        return null
      })}
    </div>
  )
}

function renderJobTimelineBody(job: Experience) {
  if (job.timelinePortfolioEntry) {
    return (
      <>
        {job.periodLabel?.trim() ? (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            {job.periodLabel}
          </p>
        ) : null}
        <p className="text-[13px] font-semibold leading-snug text-zinc-900">
          {job.role}
        </p>
        <p className="text-[11px] text-zinc-500">Portfolio — voir version web</p>
      </>
    )
  }
  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        {job.periodLabel}
        {job.company?.trim() ? ` · ${job.company.trim()}` : ''}
        {job.country?.trim() ? ` · ${job.country.trim()}` : ''}
      </p>
      <p className="text-[13px] font-semibold leading-snug text-zinc-900">
        {job.role}
      </p>
      {job.summary.trim() ? (
        <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-700">
          {job.summary}
        </p>
      ) : null}
    </>
  )
}

function renderFieldDecadeTimeline(fd: FieldDecade) {
  const bulletItems = fd.sections.flatMap((sec) => sec.items)
  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        {fd.periodLabel}
        {fd.metaSubtitle?.trim() ? ` · ${fd.metaSubtitle.trim()}` : ''}
      </p>
      <p className="text-[13px] font-semibold leading-snug text-zinc-900">
        {fd.title}
      </p>
      <p className="text-[11px] leading-relaxed text-zinc-700">{fd.summary}</p>
      {bulletItems.length > 0 ? (
        <ul className="mt-1.5 list-disc space-y-1 pl-3.5 text-[10.5px] leading-snug text-zinc-700">
          {bulletItems.map((item, i) => (
            <li key={`${fd.id}-pdf-${i}`}>{item}</li>
          ))}
        </ul>
      ) : null}
    </>
  )
}

type CvPdfPreviewProps = {
  cv: CvDocument
  sortedExperience: Experience[]
}

/**
 * A4 : colonne gauche (badges) + droite (à propos, projet, frise parcours).
 */
export function CvPdfPreview({ cv, sortedExperience }: CvPdfPreviewProps) {
  const {
    profile,
    navContact,
    featuredProject,
    fieldDecade,
    education,
    skills,
    personalStack,
  } = cv
  const photoSrc = resolveProfilePhoto(profile.photoUrl)

  const timelineJobs = useMemo(
    () => sortedExperience.filter((job) => !job.timelinePortfolioEntry),
    [sortedExperience],
  )

  const educForPdf = [...education]
    .sort(
      (a, b) =>
        new Date(b.endDate ?? b.startDate).getTime() -
        new Date(a.endDate ?? a.startDate).getTime(),
    )
    .slice(0, 4)

  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const mapsQuery = encodeURIComponent(navContact.address)

  return (
    <div
      className="font-corporate box-border flex h-[297mm] w-[210mm] max-h-[297mm] overflow-hidden bg-white text-[11px] leading-normal text-zinc-800 [print-color-adjust:exact]"
      style={{ pageBreakAfter: 'avoid' }}
    >
      <aside className="flex w-[58mm] shrink-0 flex-col gap-4 overflow-hidden py-[4mm] pl-[4mm] pr-2">
        <PdfBadge className="shrink-0 overflow-hidden p-0">
          {photoSrc ? (
            <div className="flex aspect-[4/3] w-full items-start justify-center overflow-hidden rounded-t-xl bg-white">
              <img
                alt=""
                className="h-full w-full object-contain object-top [image-rendering:auto]"
                src={photoSrc}
              />
            </div>
          ) : (
            <div
              aria-hidden
              className="flex aspect-[4/3] w-full items-center justify-center rounded-t-xl bg-white text-2xl font-semibold text-zinc-500"
            >
              {initials}
            </div>
          )}
          <div className="px-3 pb-3 pt-2.5 text-center">
            <p className="text-[14px] font-bold leading-tight tracking-tight text-zinc-900">
              {profile.name}
            </p>
            {(profile.birthDateLabel?.trim() ||
              profile.familyStatus?.trim() ||
              profile.driverLicense?.trim()) ? (
              <div className="mt-2 space-y-1 text-[10px] leading-snug text-zinc-600">
                {profile.birthDateLabel?.trim() ? (
                  <p className="flex items-center justify-center gap-1.5">
                    <svg
                      aria-hidden
                      className="h-3 w-3 shrink-0 text-zinc-400 [print-color-adjust:exact]"
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
          </div>
          <hr className="mx-3 border-zinc-200" />
          <ul className="space-y-1.5 px-3 pb-3 pt-2 text-left text-[10px] leading-snug text-zinc-600">
            <li className="flex items-start gap-2">
              <svg
                aria-hidden
                className={pdfContactIconClass}
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
              <a
                className="min-w-0 break-words text-zinc-700 underline-offset-2 hover:underline"
                href={phoneToTelHref(navContact.phone)}
              >
                {navContact.phone}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <svg
                aria-hidden
                className={pdfContactIconClass}
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
              <a
                className="min-w-0 break-all leading-tight text-zinc-700 underline-offset-2 hover:underline"
                href={`mailto:${navContact.email}`}
              >
                {navContact.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <svg
                aria-hidden
                className={pdfContactIconClass}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
                  fillRule="evenodd"
                />
              </svg>
              <a
                className="min-w-0 break-all leading-tight text-zinc-700 underline-offset-2 hover:underline"
                href={navContact.github}
                rel="noreferrer"
                target="_blank"
              >
                github.com/{githubShort(navContact.github)}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <svg
                aria-hidden
                className={pdfContactIconClass}
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
              <a
                className="min-w-0 leading-tight text-zinc-700 underline-offset-2 hover:underline"
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                rel="noreferrer"
                target="_blank"
              >
                {navContact.address}
              </a>
            </li>
          </ul>
        </PdfBadge>

        <PdfBadge className="w-full shrink-0">
          <BadgeSectionTitle>Compétences</BadgeSectionTitle>
          <div className="space-y-1.5 text-[10px] leading-snug text-zinc-700">
            <p>
              <span className="font-semibold text-zinc-800">Tech</span>
              <br />
              {skills.tech.map((t) => t.name).join(' · ')}
            </p>
            <p>
              <span className="font-semibold text-zinc-800">Outils</span>
              <br />
              {skills.tools.map((t) => t.name).join(' · ')}
            </p>
            <p>
              <span className="font-semibold text-zinc-800">Langues</span>
              <br />
              {skills.languages.map((l) => `${l.name} (${l.level})`).join(' · ')}
            </p>
          </div>
        </PdfBadge>

        <PdfBadge className="shrink-0">
          <BadgeSectionTitle>Formation</BadgeSectionTitle>
          <ul className="space-y-1.5 text-left">
            {educForPdf.map((ed) => (
              <li key={ed.id}>
                <p className="text-[11px] font-semibold leading-snug text-zinc-900">
                  {ed.degree}
                </p>
                <p className="text-[10px] text-zinc-500">{ed.institution}</p>
                <p className="text-[9px] tabular-nums text-zinc-400">
                  {ed.periodLabel}
                </p>
              </li>
            ))}
          </ul>
        </PdfBadge>

        <PdfBadge className="min-h-0 flex-1 overflow-hidden">
          <BadgeSectionTitle>{personalStack.title}</BadgeSectionTitle>
          <div className="min-h-0 overflow-hidden">
            <PdfPersonalStackBlock items={personalStack.items} />
          </div>
        </PdfBadge>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-l border-zinc-200 px-[5mm] pb-[6mm] pt-[14.85mm]">
        <div className="flex min-h-0 flex-1 flex-col gap-10 overflow-hidden">
          {/* Hauteur = contenu uniquement (plus de flex-1 qui agrandissait la zone) */}
          <header className="shrink-0 space-y-1.5">
            <h1 className="text-[14px] font-semibold uppercase leading-snug tracking-[0.06em] text-zinc-900">
              {profile.headline}
            </h1>
            {profile.subheadline.trim() ? (
              <p className="text-[11px] font-medium leading-snug text-zinc-600">
                {profile.subheadline}
              </p>
            ) : null}
            {profile.pitch.trim() ? (
              <p className="text-justify text-[11px] leading-relaxed text-zinc-700 line-clamp-[8]">
                {profile.pitch}
              </p>
            ) : null}
          </header>

          <section className="shrink-0 pt-1">
            <MainSectionTitle>Projet principal</MainSectionTitle>
            <p className="mt-1.5 text-[13px] font-semibold text-zinc-900">
              {featuredProject.title}
            </p>
            <p className="text-[11px] text-zinc-500">{featuredProject.subtitle}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-700 line-clamp-3">
              {featuredProject.shortPitch}
            </p>
          </section>

          <section className="min-h-0 flex-1 overflow-hidden pt-1">
            <MainSectionTitle>Parcours professionnel</MainSectionTitle>
            <ol className="relative mt-3 ml-0.5 space-y-5 border-l border-zinc-200 pl-4">
              {timelineJobs.map((job) => (
                <PdfTimelineItem key={job.id}>
                  {renderJobTimelineBody(job)}
                </PdfTimelineItem>
              ))}
              <PdfTimelineItem>{renderFieldDecadeTimeline(fieldDecade)}</PdfTimelineItem>
            </ol>
          </section>
        </div>

        <p className="mt-auto shrink-0 border-t border-zinc-100 pt-3 text-center text-[9px] text-zinc-400">
          CV — {profile.name} — mis à jour le {cv.meta.lastUpdated}
        </p>
      </main>
    </div>
  )
}
