/**
 * Application CV : sidebar (profil, navigation, export PDF) + contenu scrollable.
 * Sur mobile, une barre fixe en bas donne l’accès à Contact, Navigation et PDF.
 */
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cvRaw from '../data/cv.json'
import {
  SectionApropos,
  SectionCompetences,
  SectionFormation,
  SectionParcours,
  SectionPersonalStack,
  SectionProjet,
} from './CvSections'
import { CvPdfPreview } from './CvPdfPreview'
import { exportCvRefToPdfFile } from './exportCvPdf'
import { SidebarProfileBadge } from './SidebarProfileBadge'
import type { CvDocument, Experience } from './types/cv'

const cv = cvRaw as CvDocument

export type CvSectionKey =
  | 'apropos'
  | 'projet'
  | 'parcours'
  | 'competences'
  | 'formation'
  | 'personal'

const DEFAULT_SECTION_ORDER: CvSectionKey[] = [
  'apropos',
  'projet',
  'parcours',
  'competences',
  'formation',
  'personal',
]

const navItems = [
  { id: 'apropos', label: 'À propos' },
  { id: 'projet', label: 'CRC Copilot' },
  { id: 'parcours', label: 'Parcours' },
  { id: 'competences', label: 'Compétences' },
  { id: 'formation', label: 'Formations' },
  { id: 'personal-stack', label: 'Personal Stack' },
] as const

function sortExperience(items: Experience[]) {
  return [...items].sort(
    (a, b) =>
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  )
}

function shuffleSections<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function NavLinks({
  onNavigate,
  className = '',
}: {
  onNavigate?: () => void
  className?: string
}) {
  return (
    <ul
      className={`relative ml-1 space-y-0.5 border-l border-zinc-200 pl-6 ${className}`.trim()}
    >
      {navItems.map((item) => (
        <li className="relative" key={item.id}>
          <span
            aria-hidden
            className="absolute -left-[29px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-zinc-400 shadow"
          />
          <a
            className="block rounded-lg py-2 pl-1 pr-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            href={`#${item.id}`}
            onClick={onNavigate}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

export default function App() {
  const [projectOpen, setProjectOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [pdfSaving, setPdfSaving] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const savePdfToFile = useCallback(async () => {
    if (!printRef.current || pdfSaving) return
    setPdfSaving(true)
    setPdfError(null)
    const name = `CV_${cv.profile.name.replace(/\s+/g, '-')}.pdf`
    try {
      await exportCvRefToPdfFile(printRef, name)
    } catch (err) {
      console.error('Export PDF:', err)
      setPdfError(
        err instanceof Error
          ? err.message
          : 'Export impossible. Réessayez ou utilisez un autre navigateur.',
      )
    } finally {
      setPdfSaving(false)
    }
  }, [pdfSaving])
  const [sectionOrder, setSectionOrder] = useState<CvSectionKey[]>(() => [
    ...DEFAULT_SECTION_ORDER,
  ])
  const [orderAnnouncement, setOrderAnnouncement] = useState('')

  /**
   * Ordre réellement affiché : si `sectionOrder` est incomplet (ex. HMR après ajout d’une section),
   * on retombe sur l’ordre par défaut pour que toutes les sections restent visibles.
   */
  const displaySectionOrder = useMemo(() => {
    const allowed = new Set(DEFAULT_SECTION_ORDER)
    const filtered = [
      ...new Set(sectionOrder.filter((k) => allowed.has(k))),
    ] as CvSectionKey[]
    const complete =
      filtered.length === DEFAULT_SECTION_ORDER.length &&
      DEFAULT_SECTION_ORDER.every((k) => filtered.includes(k))
    return complete ? filtered : [...DEFAULT_SECTION_ORDER]
  }, [sectionOrder])

  const sortedExperience = useMemo(() => sortExperience(cv.experience), [])

  const shuffleReality = useCallback(() => {
    setSectionOrder(shuffleSections([...DEFAULT_SECTION_ORDER]))
    setOrderAnnouncement(
      'Ordre des sections mélangé. Multivers activé.',
    )
  }, [])

  const resetDeterminism = useCallback(() => {
    setSectionOrder([...DEFAULT_SECTION_ORDER])
    setOrderAnnouncement('Ordre des sections réinitialisé.')
  }, [])

  useEffect(() => {
    if (!orderAnnouncement) return
    const t = window.setTimeout(() => setOrderAnnouncement(''), 3500)
    return () => window.clearTimeout(t)
  }, [orderAnnouncement])

  const closeMobileNav = () => setMobileNavOpen(false)

  /** Ouvre la sidebar puis fait défiler vers une ancre (après l’animation du tiroir). */
  const openMobileNavAndScrollTo = useCallback((elementId: string) => {
    setMobileNavOpen(true)
    window.setTimeout(() => {
      document.getElementById(elementId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 280)
  }, [])

  useEffect(() => {
    if (!mobileNavOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false)
    }
    document.addEventListener('keydown', onEsc)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onEsc)
    }
  }, [mobileNavOpen])

  useEffect(() => {
    if (!pdfModalOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPdfModalOpen(false)
    }
    document.addEventListener('keydown', onEsc)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onEsc)
    }
  }, [pdfModalOpen])

  const renderSection = (key: CvSectionKey) => {
    switch (key) {
      case 'apropos':
        return <SectionApropos cv={cv} />
      case 'projet':
        return (
          <SectionProjet
            cv={cv}
            projectOpen={projectOpen}
            setProjectOpen={setProjectOpen}
          />
        )
      case 'parcours':
        return (
          <SectionParcours cv={cv} sortedExperience={sortedExperience} />
        )
      case 'competences':
        return <SectionCompetences cv={cv} />
      case 'formation':
        return <SectionFormation cv={cv} />
      case 'personal':
        return (
          <SectionPersonalStack
            cv={cv}
            onResetOrder={resetDeterminism}
            onShuffleReality={shuffleReality}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-svh">
      <div
        aria-hidden={!mobileNavOpen}
        className={`fixed inset-0 z-40 bg-zinc-900/30 backdrop-blur-[1px] transition-opacity md:hidden ${
          mobileNavOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={closeMobileNav}
        role="presentation"
      />

      <aside
        aria-label="Navigation"
        className={`fixed left-0 top-0 z-50 flex h-svh w-[min(16rem,85vw)] flex-col border-r border-zinc-200 bg-white shadow-sm transition-transform duration-200 ease-out md:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        id="sidebar-nav"
      >
        <div className="border-b border-zinc-100">
          <div className="flex justify-end px-3 pt-2 md:hidden">
            <button
              aria-label="Fermer le menu"
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
              onClick={closeMobileNav}
              type="button"
            >
              <svg
                aria-hidden
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                viewBox="0 0 24 24"
              >
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="px-3 pb-4 pt-1 md:px-4 md:pb-4 md:pt-4">
            <SidebarProfileBadge
              contact={cv.navContact}
              onNavigate={closeMobileNav}
              profile={cv.profile}
            />
          </div>
        </div>
        <nav
          aria-label="Navigation principale"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4"
        >
          <div className="mx-auto w-full max-w-[13rem] shrink-0 py-1 my-auto">
            <NavLinks onNavigate={closeMobileNav} />
          </div>
        </nav>
        <div className="border-t border-zinc-100 px-3 py-3 md:px-4">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-white hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
            onClick={() => {
              setPdfModalOpen(true)
              setPdfError(null)
            }}
            type="button"
          >
            <svg
              aria-hidden
              className="h-4 w-4 shrink-0 text-zinc-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              viewBox="0 0 24 24"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Générer un PDF
          </button>
        </div>
      </aside>

      {/* Décalage = largeur fixe de la sidebar sur md+ (16 rem). */}
      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-zinc-200/80 bg-zinc-50/95 px-4 py-3 backdrop-blur-md md:hidden">
          <button
            aria-controls="sidebar-nav"
            aria-expanded={mobileNavOpen}
            aria-label="Ouvrir le menu"
            className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-700 shadow-sm hover:bg-zinc-50"
            onClick={() => setMobileNavOpen(true)}
            type="button"
          >
            <svg
              aria-hidden
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <span className="truncate text-sm font-medium text-zinc-800">
            Navigation
          </span>
        </header>

        <div
          aria-live="polite"
          className="sr-only"
          role="status"
        >
          {orderAnnouncement}
        </div>

        <main className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-9 px-4 pb-24 pt-6 md:gap-10 md:pb-16 md:pt-8">
          {displaySectionOrder.map((key) => (
            <Fragment key={key}>{renderSection(key)}</Fragment>
          ))}
        </main>

        <footer className="border-t border-zinc-200 px-4 py-6 pb-24 text-center text-xs text-zinc-500 md:pb-6">
          <p>Mis à jour le {cv.meta.lastUpdated}</p>
          <p className="mt-2">
            Affiches de films &amp; séries :{' '}
            <a
              className="text-zinc-600 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-800"
              href="https://www.themoviedb.org/"
              rel="noreferrer"
              target="_blank"
            >
              The Movie Database (TMDB)
            </a>
          </p>
        </footer>
      </div>

      {pdfModalOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[260] flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm"
          onClick={() => setPdfModalOpen(false)}
          role="dialog"
        >
          <div
            aria-label="Fenêtre export PDF"
            className="relative flex max-h-[92vh] w-full max-w-[min(100vw-2rem,56rem)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Fermer"
              className="absolute right-2 top-2 z-10 rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
              onClick={() => setPdfModalOpen(false)}
              type="button"
            >
              <svg
                aria-hidden
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                viewBox="0 0 24 24"
              >
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex flex-col gap-2 border-b border-zinc-100 px-4 py-3 pr-11 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold text-zinc-900">
                Aperçu du CV (export PDF)
              </h2>
              <div className="flex flex-col items-stretch gap-1.5 sm:items-end">
                <button
                  className="rounded-lg border border-zinc-200 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={pdfSaving}
                  onClick={() => void savePdfToFile()}
                  type="button"
                >
                  {pdfSaving ? 'Génération du PDF…' : 'Enregistrer en PDF'}
                </button>
                {pdfError ? (
                  <p className="max-w-xs text-right text-[11px] text-red-600" role="alert">
                    {pdfError}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-zinc-100/90 p-4 md:p-6">
              <div
                ref={printRef}
                className="font-corporate mx-auto box-border h-[297mm] w-[210mm] shrink-0 overflow-hidden bg-white shadow-md print:shadow-none"
              >
                <CvPdfPreview
                  cv={cv}
                  sortedExperience={sortedExperience}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Raccourcis visibles uniquement sur mobile : la sidebar est masquée par défaut. */}
      <nav
        aria-label="Raccourcis : contact, menu de navigation, export PDF"
        className="fixed bottom-0 left-0 right-0 z-[55] flex gap-1 border-t border-zinc-200 bg-white/95 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden"
      >
        <button
          className="flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium text-zinc-700 transition hover:bg-zinc-100 active:bg-zinc-200"
          onClick={() => openMobileNavAndScrollTo('nav-contact')}
          type="button"
        >
          <svg
            aria-hidden
            className="h-5 w-5 text-zinc-500"
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
          Contact
        </button>
        <button
          className="flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium text-zinc-700 transition hover:bg-zinc-100 active:bg-zinc-200"
          onClick={() => openMobileNavAndScrollTo('sidebar-nav-links')}
          type="button"
        >
          <svg
            aria-hidden
            className="h-5 w-5 text-zinc-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            viewBox="0 0 24 24"
          >
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
          Navigation
        </button>
        <button
          className="flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium text-zinc-700 transition hover:bg-zinc-100 active:bg-zinc-200"
          onClick={() => {
            setPdfModalOpen(true)
            setPdfError(null)
          }}
          type="button"
        >
          <svg
            aria-hidden
            className="h-5 w-5 text-zinc-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            viewBox="0 0 24 24"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          PDF
        </button>
      </nav>
    </div>
  )
}
