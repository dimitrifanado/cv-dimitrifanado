import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import cvRaw from '../data/cv.json'
import {
  SectionApropos,
  SectionFormation,
  SectionParcours,
  SectionPersonalStack,
  SectionProjet,
} from './CvSections'
import type { CvDocument, Experience, NavContact } from './types/cv'

const cv = cvRaw as CvDocument

function phoneToTelHref(display: string): string {
  const digits = display.replace(/\D/g, '')
  if (!digits) return '#'
  if (digits.startsWith('33')) return `tel:+${digits}`
  if (digits.startsWith('0') && digits.length === 10)
    return `tel:+33${digits.slice(1)}`
  return `tel:+${digits}`
}

function NavContactBlock({
  contact,
  onNavigate,
}: {
  contact: NavContact
  onNavigate?: () => void
}) {
  const mapsQuery = encodeURIComponent(contact.address)
  const linkClass =
    'flex items-start gap-2.5 rounded-md px-1 py-1 text-xs leading-snug text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900'
  const iconClass = 'mt-0.5 h-4 w-4 shrink-0 text-zinc-400'

  return (
    <div className="space-y-1 px-4 pb-4 pt-1">
      <a
        className={linkClass}
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
        <span>{contact.phone}</span>
      </a>
      <a
        className={linkClass}
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
      <a
        className={linkClass}
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
        <span className="break-all">{contact.github}</span>
      </a>
      <a
        className={linkClass}
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
    </div>
  )
}

export type CvSectionKey =
  | 'apropos'
  | 'projet'
  | 'parcours'
  | 'formation'
  | 'personal'

const DEFAULT_SECTION_ORDER: CvSectionKey[] = [
  'apropos',
  'projet',
  'parcours',
  'formation',
  'personal',
]

const navItems = [
  { id: 'apropos', label: 'À propos' },
  { id: 'projet', label: 'CRC Copilot' },
  { id: 'parcours', label: 'Parcours' },
  { id: 'formation', label: 'Formation' },
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
    <ul className={className}>
      {navItems.map((item) => (
        <li key={item.id}>
          <a
            className="block rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
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
  const [sectionOrder, setSectionOrder] = useState<CvSectionKey[]>(() => [
    ...DEFAULT_SECTION_ORDER,
  ])
  const [orderAnnouncement, setOrderAnnouncement] = useState('')

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
          <div className="flex items-center justify-between gap-2 px-4 py-4">
            <a
              className="text-sm font-semibold tracking-tight text-zinc-900 hover:text-zinc-600"
              href="#apropos"
              onClick={closeMobileNav}
            >
              {cv.profile.name}
            </a>
            <button
              aria-label="Fermer le menu"
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 md:hidden"
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
          <NavContactBlock contact={cv.navContact} onNavigate={closeMobileNav} />
        </div>
        <nav
          aria-label="Navigation principale"
          className="flex-1 overflow-y-auto px-2 py-4"
        >
          <NavLinks
            className="space-y-0.5"
            onNavigate={closeMobileNav}
          />
        </nav>
        <p className="border-t border-zinc-100 px-4 py-3 text-xs text-zinc-400">
          {cv.meta.lastUpdated}
        </p>
      </aside>

      <div className="md:pl-56">
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

        <main className="mx-auto flex max-w-3xl flex-col gap-14 px-4 pb-20 pt-8 md:pt-10">
          {sectionOrder.map((key) => (
            <Fragment key={key}>{renderSection(key)}</Fragment>
          ))}
        </main>

        <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500">
          Mis à jour le {cv.meta.lastUpdated}
        </footer>
      </div>
    </div>
  )
}
