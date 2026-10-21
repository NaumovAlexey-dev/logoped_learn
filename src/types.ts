export type Screen = 'home' | 'tutorial' | 'debrief' | 'cases' | 'theory' | 'progress' | 'about'

export type Mode = 'tutorial' | 'exam'

export type StepId =
  | 'hypotheses'
  | 'anamnesis'
  | 'sounds'
  | 'phonemics'
  | 'articulation'
  | 'conclusion'

export type SoundType = 'distortion' | 'substitution' | 'omission' | 'normal'

export interface HypothesisOption {
  id: string
  label: string
  caption: string
  correct: boolean
  feedback: string
}

export interface AnamnesisOption {
  id: string
  text: string
  category: string
  critical: boolean
  noise: boolean
  feedback: string
}

export interface SoundClip {
  id: string
  title: string
  child: string
  transcription: string
  spoken: string
  correctType: SoundType
  explanation: string
  otherChild?: boolean
}

export interface PhonemicPair {
  id: string
  words: string
  distinguishes: boolean
  explanation: string
}

export interface ArticulationFinding {
  id: string
  label: string
  detail: string
  present: boolean
  dysarthriaSign: boolean
  explanation: string
}

export interface DifferentialOption {
  id: string
  label: string
  caption: string
  correct: boolean
  feedback: string
}

export interface ConclusionOption {
  id: string
  label: string
}

export interface ArgumentOption {
  id: string
  text: string
  correct: boolean
  lessonId?: string
  feedback: string
}

export interface MicroLessonCheckOption {
  id: string
  label: string
  correct: boolean
}

export interface MicroLesson {
  id: string
  title: string
  tag: string
  what: string
  why: string
  example: string
  counterexample: string
  check: {
    question: string
    options: MicroLessonCheckOption[]
    explanation: string
  }
}

export interface SymptomSummaryItem {
  block: string
  label: string
  status: 'confirmed' | 'preserved' | 'ruled_out'
  note: string
}

export interface CaseData {
  id: string
  name: string
  age: string
  ageMonths: number
  group: string
  complaints: string[]
  anamnesis: { label: string; value: string }[]
  request: string
  hypotheses: HypothesisOption[]
  anamnesisOptions: AnamnesisOption[]
  soundClips: SoundClip[]
  phonemicPairs: PhonemicPair[]
  grammarProbes: { id: string; text: string; correct: boolean; note: string }[]
  articulationFindings: ArticulationFinding[]
  differentials: DifferentialOption[]
  conclusion: {
    mechanisms: ConclusionOption[]
    forms: ConclusionOption[]
    levels: ConclusionOption[]
    icd10: ConclusionOption[]
    icd11: ConclusionOption[]
    correct: {
      mechanism: string
      form: string
      level: string
      icd10: string
      icd11: string
    }
  }
  argumentsFor: ArgumentOption[]
  argumentsAgainst: ArgumentOption[]
  sources: string[]
  symptomSummary: SymptomSummaryItem[]
  mentor: { goal: string; hint: string }[]
  hypothesisNote: string
  phonemicConclusionCorrect: string
  grammarCorrect: boolean
  conclusionSummary: string
}

export interface TutorialResult {
  caseId: string
  mode: Mode
  firstTryChecks: number
  totalChecks: number
  errors: string[]
  startedAt: string
  completedAt: string
  durationSec: number
}

export interface CaseProgress {
  tutorialCompleted: boolean
  tutorialFirstTry: number
  tutorialErrors: string[]
  examPassed: boolean
  bestExamScore: number
  updatedAt: string | null
}

export interface Progress {
  cases: Record<string, CaseProgress>
  lastCaseId: string
  lastMode: Mode | null
  updatedAt: string | null
}
