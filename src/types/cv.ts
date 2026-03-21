export type Badge = {
  id: string
  label: string
}

export type Profile = {
  /** Nom affiché dans la barre de navigation */
  name: string
  headline: string
  subheadline: string
  pitch: string
  badges: Badge[]
  photoUrl: string | null
}

export type ProjectHighlight = {
  title: string
  description: string
}

export type FeaturedProject = {
  id: string
  title: string
  subtitle: string
  shortPitch: string
  tags: string[]
  highlights: ProjectHighlight[]
  stackNote: string
  links: {
    demo: string
    repo: string
    article: string
  }
}

export type Experience = {
  id: string
  company: string
  /** Pays (affiché à la place de l’ancien lieu) */
  country: string | null
  role: string
  startDate: string
  endDate: string | null
  periodLabel: string
  summary: string
  bullets: string[]
  tags: string[]
}

export type FieldSection = {
  /** Sous-titre optionnel ; si absent, seule la liste est affichée */
  title?: string | null
  items: string[]
}

export type FieldDecade = {
  id: string
  title: string
  periodLabel: string
  startDate: string
  endDate: string
  summary: string
  sections: FieldSection[]
  tags: string[]
}

export type Education = {
  id: string
  institution: string
  degree: string
  startDate: string
  /** `null` si formation en cours */
  endDate: string | null
  periodLabel: string
  details: string | null
}

export type SkillItem = {
  name: string
  level: string | null
}

export type Skills = {
  tech: SkillItem[]
  tools: SkillItem[]
  languages: SkillItem[]
}

export type PersonalStackLineItem = {
  type: 'line'
  label: string
  value: string
  /** Par défaut `true` si absent */
  defaultOpen?: boolean
  /**
   * `major` = même niveau que Culture / Physique quantique (titre large + bloc encadré).
   * Par défaut `minor` (ligne simple du stack).
   */
  tier?: 'major' | 'minor'
  /** Illustration à côté du texte (ex. `/icons/….svg`) */
  illustrationUrl?: string | null
}

/** Fiche film ou série (affiche + crédit + année) */
export type CultureMediaCard = {
  title: string
  /** Ex. « Réalisateur », « Créateur » */
  creditLabel: string
  credit: string
  year: number
  /** Chemin public (ex. /posters/….svg) ou URL absolue */
  posterUrl: string
}

export type PersonalStackCultureEntry = {
  label: string
  /** Lignes texte simples (livre, …) */
  value?: string
  /** Bloc dépliable : une carte par entrée (films, séries, …) */
  media?: CultureMediaCard[]
}

export type PersonalStackCultureItem = {
  type: 'culture'
  title: string
  /** Sous-titre sous le titre (ex. thématiques couvertes) */
  subtitle?: string | null
  entries: PersonalStackCultureEntry[]
}

export type PersonalStackPortfolioBlock = {
  heading: string | null
  text: string
}

export type PersonalStackPortfolioItem = {
  type: 'portfolio'
  id: string
  /** Sous-titre optionnel au-dessus du titre (ex. « Partie hors portfolio ») */
  badge?: string | null
  category: string
  /** Texte sous le titre quand la carte est repliée (optionnel) */
  teaserClosed?: string | null
  subtitleOpen: string
  blocks: PersonalStackPortfolioBlock[]
  /** Phrase avant les boutons « Générer ma Réalité » */
  practicePrompt: string
}

export type PersonalStackEntry =
  | PersonalStackLineItem
  | PersonalStackCultureItem
  | PersonalStackPortfolioItem

export type PersonalStack = {
  title: string
  items: PersonalStackEntry[]
}

/** Coordonnées affichées sous le nom dans la barre de navigation */
export type NavContact = {
  /** Affichage (ex. « 07 82 72 89 48 ») */
  phone: string
  email: string
  /** URL complète du profil GitHub */
  github: string
  /** Adresse sur une ligne */
  address: string
}

export type CvDocument = {
  meta: {
    schemaVersion: string
    locale: string
    lastUpdated: string
  }
  profile: Profile
  navContact: NavContact
  featuredProject: FeaturedProject
  experience: Experience[]
  fieldDecade: FieldDecade
  education: Education[]
  skills: Skills
  personalStack: PersonalStack
}
