/**
 * Application CV : sidebar (profil, navigation, export PDF) + contenu scrollable.
 * Sur mobile, l’en-tête ouvre la barre latérale (contact, navigation, PDF).
 */
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
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

function NavLinks({
  onNavigate,
  className = '',
  id,
}: {
  onNavigate?: () => void
  className?: string
  id?: string
}) {
  return (
    <ul
      className={`relative ml-1 space-y-0.5 border-l border-zinc-200 pl-5 md:pl-6 ${className}`.trim()}
      id={id}
    >
      {navItems.map((item) => (
        <li className="relative" key={item.id}>
          <span
            aria-hidden
            className="absolute -left-[29px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-zinc-400 shadow"
          />
          <a
            className="block rounded-lg py-1.5 pl-1 pr-2 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 md:py-2 md:text-sm"
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
  const sortedExperience = useMemo(() => sortExperience(cv.experience), [])

  const closeMobileNav = () => setMobileNavOpen(false)

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
        return <SectionPersonalStack cv={cv} />
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
        className={`fixed left-0 top-0 z-50 flex h-[100dvh] max-h-[100dvh] w-[min(16rem,85vw)] flex-col overflow-hidden border-r border-zinc-200 bg-white shadow-sm transition-transform duration-200 ease-out md:h-svh md:max-h-none md:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        id="sidebar-nav"
      >
        {/* Pas de zone scroll : contenu compact mobile pour tout voir + PDF en bas. */}
        <div className="flex shrink-0 justify-end px-2 pt-1.5 md:hidden">
          <button
            aria-label="Fermer le menu"
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
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
        <div className="shrink-0 px-2 pb-1 pt-0 md:px-4 md:pb-3 md:pt-4">
          <SidebarProfileBadge
            contact={cv.navContact}
            onNavigate={closeMobileNav}
            profile={cv.profile}
          />
        </div>
        <nav
          aria-label="Navigation principale"
          className="shrink-0 px-2 pb-1 md:px-3 md:pb-2"
        >
          <div className="mx-auto w-full max-w-[13rem] py-0 md:py-1">
            <NavLinks id="sidebar-nav-links" onNavigate={closeMobileNav} />
          </div>
        </nav>
        {/* Mobile : pousse le PDF vers le bas sans scroll dans la colonne */}
        <div aria-hidden className="min-h-0 flex-1 md:hidden" />
        <div className="shrink-0 border-t border-zinc-100 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:px-4 md:py-3">
          <button
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2 text-xs font-medium text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-white hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 md:gap-2 md:rounded-xl md:px-3 md:py-2.5 md:text-sm"
            onClick={() => {
              setPdfModalOpen(true)
              setPdfError(null)
            }}
            type="button"
          >
            <svg
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 text-zinc-500 md:h-4 md:w-4"
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
        <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-zinc-50/95 px-3 py-2 backdrop-blur-md md:hidden">
          <button
            aria-controls="sidebar-nav"
            aria-expanded={mobileNavOpen}
            aria-label="Ouvrir le menu : contact, navigation et export PDF"
            className="flex w-full min-w-0 items-center gap-2.5 rounded-lg py-1 text-left transition hover:bg-zinc-100/80"
            onClick={() => setMobileNavOpen(true)}
            type="button"
          >
            <span className="shrink-0 rounded-lg border border-zinc-200 bg-white p-2 text-zinc-700 shadow-sm">
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
            </span>
            <span className="min-w-0 truncate text-xs font-semibold tracking-tight text-zinc-800">
              Contact | Nav | PDF
            </span>
          </button>
        </header>

        <main className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-9 px-4 pb-8 pt-6 md:gap-10 md:pb-16 md:pt-8">
          {DEFAULT_SECTION_ORDER.map((key) => (
            <Fragment key={key}>{renderSection(key)}</Fragment>
          ))}
        </main>

        <footer className="border-t border-zinc-200 px-4 py-6 pb-8 text-center text-xs text-zinc-500 md:pb-6">
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
    </div>
  )
}
