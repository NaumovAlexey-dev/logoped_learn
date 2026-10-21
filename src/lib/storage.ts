import { useEffect, useState } from 'react'
import type { CaseProgress, Progress } from '../types'

const KEY = 'priem.progress.v1'

export const emptyCaseProgress: CaseProgress = {
  tutorialCompleted: false,
  tutorialFirstTry: 0,
  tutorialErrors: [],
  examPassed: false,
  bestExamScore: 0,
  updatedAt: null,
}

export const defaultProgress: Progress = {
  cases: {},
  lastCaseId: 'dislalia-01',
  lastMode: null,
  updatedAt: null,
}

export function getCaseProgress(progress: Progress, caseId: string): CaseProgress {
  return progress.cases[caseId] ?? emptyCaseProgress
}

export function loadProgress(): Progress {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return defaultProgress
    const parsed = JSON.parse(raw) as Record<string, unknown>

    if (parsed.cases && typeof parsed.cases === 'object') {
      return {
        ...defaultProgress,
        ...(parsed as unknown as Progress),
      }
    }

    // Migration from the first flat progress format (case 1 only).
    if ('tutorialCompleted' in parsed) {
      const legacy: CaseProgress = {
        ...emptyCaseProgress,
        tutorialCompleted: Boolean(parsed.tutorialCompleted),
        tutorialFirstTry: Number(parsed.tutorialFirstTry ?? 0),
        tutorialErrors: Array.isArray(parsed.tutorialErrors) ? (parsed.tutorialErrors as string[]) : [],
        examPassed: Boolean(parsed.examPassed),
        bestExamScore: Number(parsed.bestExamScore ?? 0),
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
      }
      return {
        cases: { 'dislalia-01': legacy },
        lastCaseId: 'dislalia-01',
        lastMode: (parsed.lastMode as Progress['lastMode']) ?? null,
        updatedAt: legacy.updatedAt,
      }
    }

    return defaultProgress
  } catch {
    return defaultProgress
  }
}

export function saveProgress(progress: Progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress))
  } catch {
    // localStorage may be unavailable in private mode — the app still works in memory.
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress())

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  return [progress, setProgress] as const
}

export function resetProgress() {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
