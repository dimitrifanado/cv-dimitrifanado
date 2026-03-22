/**
 * Sections du CV (À propos, projet, parcours, compétences, formation, personal stack).
 * Composants repliables, galeries et liens — données issues de `CvDocument`.
 */
import { useEffect, useState, type ReactNode } from 'react'
import { publicAssetUrl } from './publicAssetUrl'
import type {
  CultureMediaCard,
  CvDocument,
  Experience,
  PersonalStackCultureItem,
  PersonalStackPortfolioItem,
} from './types/cv'

export function ContactLink({
  href,
  label,
}: {
  href: string
  label: string
}) {
  if (!href.trim()) return null
  return (
    <a
      className="text-sm text-blue-700 underline decoration-blue-700/30 underline-offset-2 hover:decoration-blue-700"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {label}
    </a>
  )
}

const SCROLL_SECTION = 'scroll-mt-28 md:scroll-mt-8'

/** Grille 0fr→1fr : hauteur animée, le contenu du dessous remonte en douceur */
const COLLAPSIBLE_GRID_BASE =
  'grid overflow-hidden transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none motion-reduce:duration-0'

function AnimatedHeightPanel({
  id,
  open,
  innerClassName,
  children,
}: {
  id: string
  open: boolean
  innerClassName?: string
  children: ReactNode
}) {
  return (
    <div
      className={`${COLLAPSIBLE_GRID_BASE} ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      id={id}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={innerClassName?.trim() ?? ''}
          inert={open ? undefined : true}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

/** Bouton discret : chevron bas → haut quand ouvert */
const CHEVRON_TOGGLE_BTN_CLASS =
  'shrink-0 rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100/80 hover:text-zinc-600'

function ChevronToggleIcon({
  expanded,
  className = 'h-5 w-5',
}: {
  expanded: boolean
  className?: string
}) {
  return (
    <svg
      aria-hidden
      className={`${className} transition-transform duration-200 ease-out ${expanded ? '-rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

/** Chevron en bas du panneau pour replier sans remonter */
function CollapseChevronFooter({
  ariaLabel,
  onCollapse,
}: {
  ariaLabel: string
  onCollapse: () => void
}) {
  return (
    <div className="mt-2 flex justify-start pt-1">
      <button
        aria-label={ariaLabel}
        className={CHEVRON_TOGGLE_BTN_CLASS}
        onClick={onCollapse}
        type="button"
      >
        <ChevronToggleIcon expanded />
      </button>
    </div>
  )
}

function CollapsibleSection({
  sectionId,
  headingId,
  title,
  defaultOpen = true,
  sectionClassName = '',
  panelClassName = '',
  headingClassName = 'text-lg font-medium tracking-tight text-zinc-900',
  children,
}: {
  sectionId: string
  headingId: string
  title: string
  defaultOpen?: boolean
  sectionClassName?: string
  panelClassName?: string
  headingClassName?: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = `${sectionId}-panel`

  return (
    <section
      aria-labelledby={headingId}
      className={`${SCROLL_SECTION} ${sectionClassName}`.trim()}
      id={sectionId}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 pb-3">
        <h2 className={headingClassName} id={headingId}>
          {title}
        </h2>
        <button
          aria-controls={panelId}
          aria-expanded={open}
          aria-label={open ? `Replier la section ${title}` : `Déplier la section ${title}`}
          className={CHEVRON_TOGGLE_BTN_CLASS}
          onClick={() => setOpen((o) => !o)}
          type="button"
        >
          <ChevronToggleIcon expanded={open} />
        </button>
      </div>
      <AnimatedHeightPanel
        id={panelId}
        innerClassName={open ? `pt-4 ${panelClassName}` : ''}
        open={open}
      >
        {children}
        <CollapseChevronFooter
          ariaLabel={`Replier la section ${title}`}
          onCollapse={() => setOpen(false)}
        />
      </AnimatedHeightPanel>
    </section>
  )
}

export function SectionApropos({ cv }: { cv: CvDocument }) {
  return (
    <CollapsibleSection
      headingId="titre-section-apropos"
      sectionId="apropos"
      title="À propos"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Profil
      </p>
      <h1
        className="mt-2 text-balance text-3xl font-medium tracking-tight text-zinc-900 sm:text-4xl"
        id="titre-principal"
      >
        {cv.profile.headline}
      </h1>
      <p className="mt-3 text-pretty text-base text-zinc-600 sm:text-lg">
        {cv.profile.subheadline}
      </p>
      <p className="mt-4 text-pretty text-zinc-700">{cv.profile.pitch}</p>
      {cv.profile.badges.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {cv.profile.badges.map((b) => (
            <li key={b.id}>
              <span className="inline-flex rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
                {b.label}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </CollapsibleSection>
  )
}

export function SectionProjet({
  cv,
  projectOpen,
  setProjectOpen,
}: {
  cv: CvDocument
  projectOpen: boolean
  setProjectOpen: (v: boolean | ((b: boolean) => boolean)) => void
}) {
  return (
    <CollapsibleSection
      headingId="projet-phare"
      sectionId="projet"
      title="Projet phare"
    >
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200/80 pb-3">
          <div>
            <h3 className="text-xl font-medium text-zinc-900">
              {cv.featuredProject.title}
            </h3>
            <p className="mt-1 text-sm text-zinc-600">
              {cv.featuredProject.subtitle}
            </p>
          </div>
          <button
            aria-controls="projet-details-panel"
            aria-expanded={projectOpen}
            aria-label={
              projectOpen
                ? `Masquer les détails — ${cv.featuredProject.title}`
                : `Afficher les détails — ${cv.featuredProject.title}`
            }
            className={CHEVRON_TOGGLE_BTN_CLASS}
            onClick={() => setProjectOpen((v) => !v)}
            type="button"
          >
            <ChevronToggleIcon expanded={projectOpen} />
          </button>
        </div>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-zinc-700">
          {cv.featuredProject.shortPitch}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {cv.featuredProject.tags.map((t) => (
            <li key={t}>
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                {t}
              </span>
            </li>
          ))}
        </ul>
        <AnimatedHeightPanel
          innerClassName={projectOpen ? 'mt-5 pt-5' : ''}
          id="projet-details-panel"
          open={projectOpen}
        >
          <ul className="space-y-4">
            {cv.featuredProject.highlights.map((h) => (
              <li key={h.title}>
                <p className="text-sm font-medium text-zinc-900">{h.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                  {h.description}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-zinc-600">
            {cv.featuredProject.stackNote}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <ContactLink href={cv.featuredProject.links.demo} label="Démo" />
            <ContactLink href={cv.featuredProject.links.repo} label="Code" />
            <ContactLink
              href={cv.featuredProject.links.article}
              label="Article"
            />
          </div>
          <CollapseChevronFooter
            ariaLabel={`Masquer les détails — ${cv.featuredProject.title}`}
            onCollapse={() => setProjectOpen(false)}
          />
        </AnimatedHeightPanel>
      </div>
    </CollapsibleSection>
  )
}

/** Liste à puces d’une expérience : panneau type portefeuille, fermé par défaut */
function ParcoursExperienceBullets({
  jobId,
  jobLabel,
  bullets,
  borderClassName,
}: {
  jobId: string
  /** Pour aria-label (ex. rôle + entreprise) */
  jobLabel: string
  bullets: string[]
  borderClassName: string
}) {
  const [open, setOpen] = useState(false)
  const panelId = `parcours-${jobId}-bullets`
  const count = bullets.length
  if (count === 0) return null

  return (
    <div className="mt-3">
      <div
        className={`flex flex-wrap items-start justify-between gap-2 border-b pb-3 ${borderClassName}`}
      >
        <h4 className="text-sm font-semibold tracking-tight text-zinc-800">
          Points clés
          {!open ? (
            <span className="ml-1.5 font-normal text-zinc-500">
              ({count})
            </span>
          ) : null}
        </h4>
        <button
          aria-controls={panelId}
          aria-expanded={open}
          aria-label={
            open
              ? `Replier les points clés — ${jobLabel}`
              : `Déplier les points clés — ${jobLabel}`
          }
          className={CHEVRON_TOGGLE_BTN_CLASS}
          onClick={() => setOpen((o) => !o)}
          type="button"
        >
          <ChevronToggleIcon className="h-4 w-4" expanded={open} />
        </button>
      </div>
      <AnimatedHeightPanel
        id={panelId}
        innerClassName={open ? 'mt-3 pt-3' : ''}
        open={open}
      >
        <ul className="list-disc space-y-1.5 pl-4 text-sm text-zinc-700">
          {bullets.map((b, i) => (
            <li key={`${jobId}-b-${i}`}>{b}</li>
          ))}
        </ul>
        <CollapseChevronFooter
          ariaLabel={`Replier les points clés — ${jobLabel}`}
          onCollapse={() => setOpen(false)}
        />
      </AnimatedHeightPanel>
    </div>
  )
}

/** Galerie optionnelle (miniatures) : même pattern chevron que les points clés */
function ParcoursExperiencePortfolio({
  jobId,
  jobLabel,
  gallery,
  borderClassName,
  displayTitle,
  headingLevel = 'secondary',
}: {
  jobId: string
  jobLabel: string
  gallery: NonNullable<Experience['portfolioGallery']>
  borderClassName: string
  /** Titre à côté du chevron (ex. « Aperçu de portfolio » ou libellé de galerie) */
  displayTitle: string
  /** `primary` = même poids visuel que le titre de poste (h3) */
  headingLevel?: 'primary' | 'secondary'
}) {
  const [open, setOpen] = useState(false)
  const [enlargedIndex, setEnlargedIndex] = useState<number | null>(null)
  const panelId = `parcours-${jobId}-portfolio`
  const images = gallery.images ?? []
  const count = images.length
  const folderHint =
    gallery.publicSubfolder?.replace(/\/$/, '').trim() || 'portfolio/…'
  const isPrimary = headingLevel === 'primary'
  const TitleTag = isPrimary ? 'h3' : 'h4'
  const titleClass = isPrimary
    ? 'text-base font-semibold text-zinc-900'
    : 'text-sm font-semibold tracking-tight text-zinc-800'

  useEffect(() => {
    if (enlargedIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEnlargedIndex(null)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [enlargedIndex])

  const enlarged =
    enlargedIndex !== null ? images[enlargedIndex] : null
  const enlargedSrc = enlarged ? publicAssetUrl(enlarged.src) : ''

  return (
    <div className={isPrimary ? 'mt-1' : 'mt-3'}>
      <div
        className={`flex flex-wrap items-start justify-between gap-2 border-b pb-3 ${borderClassName}`}
      >
        <TitleTag className={titleClass}>
          {displayTitle}
          {!open && count > 0 ? (
            <span className="ml-1.5 font-normal text-zinc-500">({count})</span>
          ) : null}
        </TitleTag>
        <button
          aria-controls={panelId}
          aria-expanded={open}
          aria-label={
            open
              ? `Replier le portefeuille — ${jobLabel}`
              : `Déplier le portefeuille — ${jobLabel}`
          }
          className={CHEVRON_TOGGLE_BTN_CLASS}
          onClick={() => setOpen((o) => !o)}
          type="button"
        >
          <ChevronToggleIcon className="h-4 w-4" expanded={open} />
        </button>
      </div>
      <AnimatedHeightPanel
        id={panelId}
        innerClassName={open ? 'mt-3 pt-3' : ''}
        open={open}
      >
        {count > 0 ? (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {images.map((img, i) => (
              <li key={`${jobId}-p-${i}`}>
                <button
                  aria-label={`Agrandir : ${img.alt}`}
                  className="group flex aspect-square w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-lg border border-zinc-200/80 bg-white p-1.5 outline-none transition hover:border-zinc-300 hover:bg-white focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
                  onClick={() => setEnlargedIndex(i)}
                  type="button"
                >
                  <img
                    alt=""
                    className="max-h-full max-w-full object-contain [image-rendering:auto]"
                    decoding="async"
                    draggable={false}
                    loading="lazy"
                    role="presentation"
                    src={publicAssetUrl(img.src)}
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic text-zinc-500">
            Ajoute tes images dans{' '}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs text-zinc-700">
              public/{folderHint}/
            </code>{' '}
            puis déclare-les dans{' '}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs text-zinc-700">
              cv.json
            </code>{' '}
            sous{' '}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs text-zinc-700">
              portfolioGallery.images
            </code>{' '}
            (URL du site :{' '}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs text-zinc-700">
              /{folderHint}/nom-fichier.webp
            </code>
            ).
          </p>
        )}
        <CollapseChevronFooter
          ariaLabel={`Replier le portefeuille — ${jobLabel}`}
          onCollapse={() => setOpen(false)}
        />
      </AnimatedHeightPanel>

      {enlarged ? (
        <div
          aria-label={`Aperçu photo — ${enlarged.alt}`}
          aria-modal="true"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
          onClick={() => setEnlargedIndex(null)}
          role="dialog"
        >
          <div
            className="relative inline-flex max-h-[min(90vh,calc(100vh-2rem))] max-w-[min(96vw,calc(100vw-2rem))] items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Fermer l’aperçu"
              className="absolute -right-2 -top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-600 bg-zinc-900 text-zinc-100 shadow-lg transition hover:bg-zinc-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 sm:-right-3 sm:-top-3"
              onClick={() => setEnlargedIndex(null)}
              type="button"
            >
              <span aria-hidden className="text-xl leading-none">
                ×
              </span>
            </button>
            <img
              alt={enlarged.alt}
              className="max-h-[min(90vh,calc(100vh-2rem))] max-w-[min(96vw,calc(100vw-2rem))] rounded-lg object-contain shadow-2xl ring-1 ring-white/10 [image-rendering:auto]"
              decoding="async"
              src={enlargedSrc}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function SectionParcours({
  cv,
  sortedExperience,
}: {
  cv: CvDocument
  sortedExperience: Experience[]
}) {
  return (
    <CollapsibleSection
      headingId="parcours-pro"
      panelClassName="pl-4 sm:pl-5"
      sectionId="parcours"
      title="Parcours professionnel"
    >
      <ol className="relative space-y-8 border-l border-zinc-200 pl-6">
        {sortedExperience.map((job) => {
          const isCorporateRole = job.id === 'coopairs'
          const isTimelinePortfolio = job.timelinePortfolioEntry === true
          const jobLabel = isTimelinePortfolio
            ? job.role
            : `${job.role} — ${job.company}`.replace(/ — $/, '')
          const bulletBorder = isCorporateRole
            ? 'border-slate-200/90'
            : 'border-zinc-200/80'
          const showMetaLine =
            !isTimelinePortfolio &&
            Boolean(
              job.periodLabel?.trim() ||
                job.company?.trim() ||
                job.country?.trim(),
            )
          const galleryTitle =
            job.portfolioGallery?.label?.trim() ||
            (isTimelinePortfolio ? job.role : 'Portfolio')
          return (
            <li
              className={`relative ${isCorporateRole ? 'font-corporate' : ''}`}
              key={job.id}
            >
              <span
                aria-hidden
                className={`absolute -left-[29px] top-1.5 h-3 w-3 rounded-full border-2 border-white shadow ${
                  isCorporateRole
                    ? 'bg-slate-500 ring-2 ring-slate-200'
                    : 'bg-zinc-400'
                }`}
              />
              {showMetaLine ? (
                <p
                  className={`text-xs font-medium uppercase tracking-wide text-zinc-500 ${isCorporateRole ? 'tracking-wider' : ''}`}
                >
                  {job.periodLabel}
                  {job.company?.trim() ? ` · ${job.company.trim()}` : ''}
                  {job.country?.trim() ? ` · ${job.country.trim()}` : ''}
                </p>
              ) : null}
              {!isTimelinePortfolio ? (
                <h3 className="mt-1 text-base font-semibold text-zinc-900">
                  {job.role}
                </h3>
              ) : null}
              {!isTimelinePortfolio && job.summary.trim() ? (
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {job.summary}
                </p>
              ) : null}
              <ParcoursExperienceBullets
                borderClassName={bulletBorder}
                bullets={job.bullets}
                jobId={job.id}
                jobLabel={jobLabel}
              />
              {job.portfolioGallery ? (
                <ParcoursExperiencePortfolio
                  borderClassName={bulletBorder}
                  displayTitle={isTimelinePortfolio ? job.role : galleryTitle}
                  gallery={job.portfolioGallery}
                  headingLevel={isTimelinePortfolio ? 'primary' : 'secondary'}
                  jobId={job.id}
                  jobLabel={jobLabel}
                />
              ) : null}
              {job.tags.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {job.tags.map((t) => (
                    <li key={t}>
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs ${
                          isCorporateRole
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {t}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          )
        })}
        <li className="relative" key={cv.fieldDecade.id}>
          <span
            aria-hidden
            className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-zinc-400 shadow"
          />
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {cv.fieldDecade.periodLabel}
            {cv.fieldDecade.metaSubtitle?.trim()
              ? ` · ${cv.fieldDecade.metaSubtitle.trim()}`
              : ''}
          </p>
          <h3 className="mt-1 text-base font-semibold text-zinc-900">
            {cv.fieldDecade.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            {cv.fieldDecade.summary}
          </p>
          <ParcoursExperienceBullets
            borderClassName="border-zinc-200/80"
            bullets={cv.fieldDecade.sections.flatMap((sec) => sec.items)}
            jobId={cv.fieldDecade.id}
            jobLabel={`${cv.fieldDecade.title} — ${cv.fieldDecade.periodLabel}`}
          />
          <ul className="mt-3 flex flex-wrap gap-2">
            {cv.fieldDecade.tags.map((t) => (
              <li key={t}>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </li>
      </ol>
    </CollapsibleSection>
  )
}

export function SectionCompetences({ cv }: { cv: CvDocument }) {
  return (
    <CollapsibleSection
      headingClassName="text-lg font-semibold tracking-tight text-zinc-900"
      headingId="competences-titre"
      sectionClassName="font-mono text-[0.95em]"
      sectionId="competences"
      title="Compétences"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-900">Tech Stack</h3>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600">
            {cv.skills.tech.map((s) => (
              <li key={s.name}>{s.name}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-900">Outils</h3>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600">
            {cv.skills.tools.map((s) => (
              <li key={s.name}>{s.name}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-900">Langues</h3>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600">
            {cv.skills.languages.map((s) => (
              <li key={s.name}>
                {s.name}
                {s.level ? ` — ${s.level}` : ''}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CollapsibleSection>
  )
}

export function SectionFormation({ cv }: { cv: CvDocument }) {
  return (
    <CollapsibleSection
      headingClassName="text-lg font-semibold tracking-tight text-zinc-900"
      headingId="formation-titre"
      sectionClassName="font-mono text-[0.95em]"
      sectionId="formation"
      title="Formations"
    >
      <div className="space-y-4">
        {cv.education.map((ed) => (
          <div
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            key={ed.id}
          >
            <p className="text-xs text-zinc-500">{ed.periodLabel}</p>
            <p className="mt-1 font-medium text-zinc-900">{ed.degree}</p>
            <p className="text-sm text-zinc-600">{ed.institution}</p>
            {ed.details ? (
              <p className="mt-2 text-sm text-zinc-700">{ed.details}</p>
            ) : null}
          </div>
        ))}
      </div>
    </CollapsibleSection>
  )
}

/** Sous-section repliable (ex. Culture, Physique quantique) dans Personal Stack */
function CollapsibleInnerBlock({
  blockId,
  defaultOpen = true,
  titleSlot,
  collapsedExtra,
  toggleAriaName,
  children,
}: {
  blockId: string
  defaultOpen?: boolean
  titleSlot: ReactNode
  collapsedExtra?: ReactNode
  /** Libellé pour aria-label (ex. « Culture », « Physique quantique ») */
  toggleAriaName: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = `${blockId}-inner-panel`

  return (
    <div className="pb-8 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200/80 pb-3">
        <div className="min-w-0 flex-1">
          {titleSlot}
          {!open && collapsedExtra ? (
            <div className="mt-2">{collapsedExtra}</div>
          ) : null}
        </div>
        <button
          aria-controls={panelId}
          aria-expanded={open}
          aria-label={
            open ? `Replier — ${toggleAriaName}` : `Déplier — ${toggleAriaName}`
          }
          className={CHEVRON_TOGGLE_BTN_CLASS}
          onClick={() => setOpen((o) => !o)}
          type="button"
        >
          <ChevronToggleIcon expanded={open} />
        </button>
      </div>
      <AnimatedHeightPanel
        id={panelId}
        innerClassName={open ? 'mt-3 pt-3' : ''}
        open={open}
      >
        {children}
        <CollapseChevronFooter
          ariaLabel={`Replier — ${toggleAriaName}`}
          onCollapse={() => setOpen(false)}
        />
      </AnimatedHeightPanel>
    </div>
  )
}

function culturePanelSlug(label: string): string {
  return label.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()
}

function cultureMediaCountWord(label: string): string {
  const l = label.toLowerCase()
  if (l.includes('série')) return 'séries'
  if (l.includes('film')) return 'films'
  return 'fiches'
}

/** Entrée texte (ex. livre) — sous-niveau de Culture, fermé par défaut */
function CultureTextExpandable({ label, value }: { label: string; value: string }) {
  const [open, setOpen] = useState(false)
  const panelId = `culture-text-${culturePanelSlug(label)}`

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-zinc-200/80 pb-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold tracking-tight text-zinc-800">
            {label}
          </h4>
        </div>
        <button
          aria-controls={panelId}
          aria-expanded={open}
          aria-label={open ? `Replier — ${label}` : `Déplier — ${label}`}
          className={CHEVRON_TOGGLE_BTN_CLASS}
          onClick={() => setOpen((o) => !o)}
          type="button"
        >
          <ChevronToggleIcon className="h-4 w-4" expanded={open} />
        </button>
      </div>
      <AnimatedHeightPanel
        id={panelId}
        innerClassName={open ? 'mt-3 pt-3' : ''}
        open={open}
      >
        <p className="text-sm leading-relaxed text-zinc-700">{value}</p>
        <CollapseChevronFooter
          ariaLabel={`Replier — ${label}`}
          onCollapse={() => setOpen(false)}
        />
      </AnimatedHeightPanel>
    </div>
  )
}

function CultureMediaExpandable({
  label,
  items,
}: {
  label: string
  items: CultureMediaCard[]
}) {
  const [open, setOpen] = useState(false)
  const panelId = `culture-media-${culturePanelSlug(label)}`
  const countWord = cultureMediaCountWord(label)

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-zinc-200/80 pb-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold tracking-tight text-zinc-800">
            {label}
          </h4>
          {!open ? (
            <p className="mt-1 text-xs text-zinc-500">
              {items.length} {countWord}
            </p>
          ) : null}
        </div>
        <button
          aria-controls={panelId}
          aria-expanded={open}
          aria-label={open ? `Replier — ${label}` : `Déplier — ${label}`}
          className={CHEVRON_TOGGLE_BTN_CLASS}
          onClick={() => setOpen((o) => !o)}
          type="button"
        >
          <ChevronToggleIcon className="h-4 w-4" expanded={open} />
        </button>
      </div>
      <AnimatedHeightPanel
        id={panelId}
        innerClassName={open ? 'mt-3 pt-3' : ''}
        open={open}
      >
        <ul className="space-y-10">
          {items.map((item, idx) => {
            const posterLeft = idx % 2 === 0
            return (
              <li key={item.title}>
                <article
                  className={`flex flex-col gap-4 sm:flex-row sm:items-center ${posterLeft ? '' : 'sm:flex-row-reverse'}`}
                >
                  <div className="mx-auto w-[9.5rem] shrink-0 sm:mx-0">
                    <img
                      alt={`Visuel : ${item.title}`}
                      className="aspect-[2/3] w-full rounded-lg border border-zinc-200 bg-zinc-100 object-cover shadow-sm"
                      height="216"
                      loading="lazy"
                      src={item.posterUrl}
                      width="144"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5 text-center sm:px-3 sm:text-left">
                    <h5 className="text-base font-semibold text-zinc-900">
                      {item.title}
                    </h5>
                    <p className="text-sm text-zinc-600">
                      <span className="font-medium text-zinc-800">
                        {item.creditLabel}
                      </span>{' '}
                      — {item.credit}
                    </p>
                    <p className="text-sm text-zinc-600">
                      <span className="font-medium text-zinc-800">Année</span>{' '}
                      — {item.year}
                    </p>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
        <CollapseChevronFooter
          ariaLabel={`Replier — ${label}`}
          onCollapse={() => setOpen(false)}
        />
      </AnimatedHeightPanel>
    </div>
  )
}

function CultureBlock({ item }: { item: PersonalStackCultureItem }) {
  return (
    <CollapsibleInnerBlock
      blockId="personal-culture"
      defaultOpen
      titleSlot={
        <h3 className="text-base font-semibold tracking-tight text-zinc-900 sm:text-lg">
          {item.title}
        </h3>
      }
      toggleAriaName={item.title}
    >
      <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/80 p-3 shadow-sm ring-1 ring-zinc-100/80 sm:p-4">
        <div className="flex flex-col gap-8">
          {item.entries.map((row) => {
            if (row.media && row.media.length > 0) {
              return (
                <div key={row.label}>
                  <CultureMediaExpandable items={row.media} label={row.label} />
                </div>
              )
            }
            if (row.value?.trim()) {
              return (
                <div key={row.label}>
                  <CultureTextExpandable label={row.label} value={row.value} />
                </div>
              )
            }
            return null
          })}
        </div>
      </div>
    </CollapsibleInnerBlock>
  )
}

/** Segments repliables : intro = subtitleOpen, puis chaque block.heading */
function buildQuantumSegments(item: PersonalStackPortfolioItem): {
  title: string
  text: string
}[] {
  return item.blocks.map((b, i) => {
    const isIntro = i === 0 && !b.heading?.trim()
    const title = isIntro
      ? item.subtitleOpen.trim() || 'Lecture'
      : (b.heading?.trim() || `Partie ${i + 1}`)
    return { title, text: b.text }
  })
}

/** Sous-bloc Physique quantique (titre + texte multi-paragraphes), fermé par défaut */
function QuantumSegmentExpandable({
  portfolioId,
  segmentIndex,
  title,
  text,
}: {
  portfolioId: string
  segmentIndex: number
  title: string
  text: string
}) {
  const [open, setOpen] = useState(false)
  const panelId = `${portfolioId}-seg-${segmentIndex}-${culturePanelSlug(title)}`

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-violet-200/60 pb-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold tracking-tight text-zinc-800">
            {title}
          </h4>
        </div>
        <button
          aria-controls={panelId}
          aria-expanded={open}
          aria-label={open ? `Replier — ${title}` : `Déplier — ${title}`}
          className={CHEVRON_TOGGLE_BTN_CLASS}
          onClick={() => setOpen((o) => !o)}
          type="button"
        >
          <ChevronToggleIcon className="h-4 w-4" expanded={open} />
        </button>
      </div>
      <AnimatedHeightPanel
        id={panelId}
        innerClassName={open ? 'mt-3 pt-3' : ''}
        open={open}
      >
        <div className="space-y-3 text-sm leading-relaxed text-zinc-700">
          {text.split(/\n\n+/).map((para, j) => (
            <p key={j}>{para}</p>
          ))}
        </div>
        <CollapseChevronFooter
          ariaLabel={`Replier — ${title}`}
          onCollapse={() => setOpen(false)}
        />
      </AnimatedHeightPanel>
    </div>
  )
}

function QuantumPortfolioCard({ item }: { item: PersonalStackPortfolioItem }) {
  const segments = buildQuantumSegments(item)

  return (
    <CollapsibleInnerBlock
      blockId={item.id}
      collapsedExtra={
        item.teaserClosed?.trim() ? (
          <p className="text-sm text-zinc-600">{item.teaserClosed}</p>
        ) : undefined
      }
      defaultOpen={false}
      titleSlot={
        <>
          {item.badge?.trim() ? (
            <p className="text-[0.65rem] font-medium uppercase tracking-wider text-zinc-400">
              {item.badge}
            </p>
          ) : null}
          <h3
            className={`text-base font-semibold tracking-tight text-zinc-900 sm:text-lg ${item.badge?.trim() ? 'mt-1' : ''}`}
          >
            {item.category}
          </h3>
        </>
      }
      toggleAriaName={item.category}
    >
      <div className="rounded-xl border border-violet-200/80 bg-violet-50/50 p-3 shadow-sm ring-1 ring-violet-100/70 sm:p-4">
        <div className="flex flex-col gap-8">
          {segments.map((seg, idx) => (
            <QuantumSegmentExpandable
              key={`${seg.title}-${idx}`}
              portfolioId={item.id}
              segmentIndex={idx}
              text={seg.text}
              title={seg.title}
            />
          ))}
        </div>
      </div>
    </CollapsibleInnerBlock>
  )
}

export function SectionPersonalStack({ cv }: { cv: CvDocument }) {
  return (
    <CollapsibleSection
      headingId="titre-personal-stack"
      panelClassName="font-mono text-[0.95em]"
      sectionId="personal-stack"
      title={cv.personalStack.title}
    >
      <div className="text-sm text-zinc-600">
        {cv.personalStack.items.map((entry, idx) => {
          if (entry.type === 'line') {
            const isMajorTier = entry.tier === 'major'
            return (
              <CollapsibleInnerBlock
                blockId={`personal-line-${idx}`}
                defaultOpen={entry.defaultOpen !== false}
                key={`${entry.label}-${idx}`}
                titleSlot={
                  <h3
                    className={
                      isMajorTier
                        ? 'text-base font-semibold tracking-tight text-zinc-900 sm:text-lg'
                        : 'text-sm font-medium tracking-tight text-zinc-900'
                    }
                  >
                    {entry.label}
                  </h3>
                }
                toggleAriaName={entry.label}
              >
                {isMajorTier ? (
                  <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/80 p-3 shadow-sm ring-1 ring-zinc-100/80 sm:p-4">
                    <div
                      className={
                        entry.illustrationUrl?.trim()
                          ? 'flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6'
                          : ''
                      }
                    >
                      <p className="min-w-0 flex-1 text-sm leading-relaxed text-zinc-700">
                        {entry.value}
                      </p>
                      {entry.illustrationUrl?.trim() ? (
                        <div className="mx-auto flex shrink-0 justify-center sm:mx-0">
                          <img
                            alt="Coupe"
                            className="h-28 w-auto max-w-[7.5rem] object-contain drop-shadow-sm sm:h-32"
                            height="128"
                            loading="lazy"
                            src={publicAssetUrl(entry.illustrationUrl.trim())}
                            width="96"
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <p>{entry.value}</p>
                )}
              </CollapsibleInnerBlock>
            )
          }
          if (entry.type === 'culture') {
            return <CultureBlock item={entry} key="culture" />
          }
          return (
            <QuantumPortfolioCard item={entry} key={entry.id} />
          )
        })}
      </div>
    </CollapsibleSection>
  )
}
