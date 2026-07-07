// src/pages/games/narutodle/types.ts

export type NarutodleMode = 'classic' | 'jutsu' | 'quote' | 'eye'

export type NarutodleFeedbackStatus = 'correct' | 'near' | 'wrong'

export type NarutodleAttributeKey =
  | 'gender'
  | 'affiliations'
  | 'jutsusTypes'
  | 'kekkeiGenkaiTypes'
  | 'natureTypes'
  | 'classifications'
  | 'debut'

export interface NarutodleCharacter {
  id: string
  name: string
  gender: 'Male' | 'Female' | 'Other'
  affiliations: string[]
  jutsusTypes: string[]
  kekkeiGenkaiTypes: string[]
  natureTypes: string[]
  classifications: string[]
  debut: string
  status: 'Alive' | 'Deceased' | 'Unknown'
  jutsuClues: string[]
  quoteClues: string[]
  eyeHint: string
}

export type NarutodleFeedback = Record<NarutodleAttributeKey, NarutodleFeedbackStatus>

export interface NarutodleGuess {
  characterId: string
  characterName: string
  feedback: NarutodleFeedback
}

export interface NarutodleState {
  targetId: string
  guesses: NarutodleGuess[]
  currentGuess: string
  currentRow: number
  maxAttempts: number
  isGameOver: boolean
  isWin: boolean
  dateKey: string
  dayNumber: number
  history: string[]
  mode: NarutodleMode
}

export interface NarutodleProcessResult {
  newState: NarutodleState
  error?: string
}

export const MAX_NARUTODLE_ATTEMPTS = 8

export const NARUTODLE_ATTRIBUTES: NarutodleAttributeKey[] = [
  'gender',
  'affiliations',
  'jutsusTypes',
  'kekkeiGenkaiTypes',
  'natureTypes',
  'classifications',
  'debut',
]

export const ATTRIBUTE_LABELS: Record<NarutodleAttributeKey, string> = {
  gender: 'Gender',
  affiliations: 'Affiliations',
  jutsusTypes: 'Jutsu Types',
  kekkeiGenkaiTypes: 'Kekkei Genkai',
  natureTypes: 'Nature Types',
  classifications: 'Attributes',
  debut: 'Debut Arc',
}

export const DEBUT_ARCS = [
  'Prologue',
  'Chunin Exams',
  'Konoha Crush',
  'Search for Tsunade',
  'Sasuke Recovery Mission',
  'Kakashi Gaiden',
  'Kazekage Rescue Mission',
  'Tenchi Bridge Reconnaissance Mission',
  'Akatsuki Suppression Mission',
  'Itachi Pursuit Mission',
  'Tale of Jiraiya the Gallant',
  'Fated Battle Between Brothers',
  "Pain's Assault",
  'Five Kage Summit',
  'Fourth Shinobi World War: Countdown',
  'Fourth Shinobi World War: Confrontation',
  'Fourth Shinobi World War: Climax',
  "Birth of the Ten-Tails' Jinchuriki",
  'Kaguya Otsutsuki Strikes',
]
