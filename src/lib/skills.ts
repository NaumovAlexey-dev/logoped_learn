import type {
  Progress,
  ReviewItem,
  SkillId,
  SkillProgress,
  StepResult,
} from '../types'

export const SKILLS: { id: SkillId; label: string; short: string; description: string }[] = [
  {
    id: 'anamnesis',
    label: 'Анамнез и алгоритм',
    short: 'Анамнез',
    description: 'Критические вопросы, шум, маршрут приёма, фиксация',
  },
  {
    id: 'sounds',
    label: 'Звукопроизношение',
    short: 'Звуки',
    description: 'Искажение, замена, пропуск и норма',
  },
  {
    id: 'phonemics',
    label: 'Фонематический слух',
    short: 'Фонематика',
    description: 'Различение оппозиций, звуковой анализ',
  },
  {
    id: 'grammar',
    label: 'Лексико-грамматический строй',
    short: 'Грамматика',
    description: 'Словарь, согласование, падежи, словообразование',
  },
  {
    id: 'articulation',
    label: 'Артикуляция и просодика',
    short: 'Артикуляция',
    description: 'Микрознаки, позы, темп, голос, истощаемость',
  },
  {
    id: 'conclusion',
    label: 'Заключение и аргументация',
    short: 'Заключение',
    description: 'Формула, альтернатива, аргументы «за» и «против»',
  },
  {
    id: 'ethics',
    label: 'Этика и коммуникация',
    short: 'Этика',
    description: 'Язык, ставящий человека в центр; границы компетенции',
  },
]

export const LESSON_SKILL: Record<string, SkillId> = {
  M1: 'anamnesis',
  M2: 'anamnesis',
  M3: 'anamnesis',
  M4: 'sounds',
  M5: 'phonemics',
  M6: 'articulation',
  M7: 'grammar',
  M8: 'conclusion',
  M9: 'conclusion',
  M10: 'ethics',
  M11: 'anamnesis',
}

export const STEP_SKILLS: Record<number, SkillId[]> = {
  0: ['anamnesis'],
  1: ['anamnesis'],
  2: ['sounds'],
  3: ['phonemics', 'grammar'],
  4: ['articulation'],
  5: ['conclusion'],
}

export function emptySkill(): SkillProgress {
  return { mastery: 50, attempts: 0, correct: 0, lastPracticed: null }
}

export function emptySkills(): Record<SkillId, SkillProgress> {
  return SKILLS.reduce(
    (acc, skill) => {
      acc[skill.id] = emptySkill()
      return acc
    },
    {} as Record<SkillId, SkillProgress>,
  )
}

export function applySkillOutcome(
  skill: SkillProgress,
  correct: boolean,
  weight = 1,
): SkillProgress {
  const target = correct ? 100 : 0
  const alpha = Math.min(0.5, (correct ? 0.25 : 0.2) * weight)
  const mastery = Math.max(0, Math.min(100, skill.mastery + alpha * (target - skill.mastery)))
  return {
    mastery,
    attempts: skill.attempts + 1,
    correct: skill.correct + (correct ? 1 : 0),
    lastPracticed: new Date().toISOString(),
  }
}

export function applyStepResults(
  skills: Record<SkillId, SkillProgress>,
  stepResults: StepResult[],
  weight = 1,
): Record<SkillId, SkillProgress> {
  const next = { ...skills }
  for (const result of stepResults) {
    for (const skillId of STEP_SKILLS[result.step] ?? []) {
      next[skillId] = applySkillOutcome(next[skillId] ?? emptySkill(), result.firstTry, weight)
    }
  }
  return next
}

export function displayedMastery(skill: SkillProgress): number {
  return skill.attempts === 0 ? 0 : Math.round(skill.mastery)
}

export function masteryTone(skill: SkillProgress): 'neutral' | 'warning' | 'success' {
  if (skill.attempts === 0) return 'neutral'
  const value = displayedMastery(skill)
  if (value >= 75) return 'success'
  if (value < 50) return 'warning'
  return 'neutral'
}

export function weakestSkills(
  skills: Record<SkillId, SkillProgress>,
  limit = 4,
): { id: SkillId; skill: SkillProgress }[] {
  return SKILLS.map((definition) => ({ id: definition.id, skill: skills[definition.id] ?? emptySkill() }))
    .filter((item) => item.skill.attempts > 0)
    .sort((a, b) => displayedMastery(a.skill) - displayedMastery(b.skill))
    .slice(0, limit)
}

export function nextReviewInterval(current: number): number {
  if (current <= 0) return 1
  if (current === 1) return 3
  if (current === 3) return 7
  if (current === 7) return 14
  return 30
}

export function scheduleReview(
  existing: ReviewItem | undefined,
  lessonId: string,
  skillId: SkillId,
  correct: boolean,
): ReviewItem {
  const now = new Date()
  const intervalDays = correct
    ? nextReviewInterval(existing?.intervalDays ?? 0)
    : 0
  const due = new Date(now)
  if (intervalDays > 0) due.setDate(due.getDate() + intervalDays)
  return {
    lessonId,
    skillId,
    dueAt: due.toISOString(),
    intervalDays,
    lastReviewedAt: now.toISOString(),
    lastResult: correct ? 'correct' : 'wrong',
  }
}

export function addReviewForLessons(
  review: ReviewItem[],
  lessonIds: string[],
): ReviewItem[] {
  const next = [...review]
  for (const lessonId of lessonIds) {
    const skillId = LESSON_SKILL[lessonId] ?? 'anamnesis'
    const index = next.findIndex((item) => item.lessonId === lessonId)
    const scheduled = scheduleReview(index >= 0 ? next[index] : undefined, lessonId, skillId, false)
    if (index >= 0) next[index] = scheduled
    else next.push(scheduled)
  }
  return next
}

export function dueReview(progress: Progress, now = Date.now()): ReviewItem[] {
  return progress.review
    .filter((item) => new Date(item.dueAt).getTime() <= now)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
}

export function nextReviewDate(review: ReviewItem[]): string | null {
  if (review.length === 0) return null
  return review
    .map((item) => item.dueAt)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]
}
