import { useEffect, useState } from 'react'
import type { Mode, Screen, TutorialResult } from './types'
import { case01 } from './data/case01'
import { case02 } from './data/case02'
import { defaultProgress, emptyCaseProgress, resetProgress, useProgress } from './lib/storage'
import { addReviewForLessons, applySkillOutcome, applyStepResults, dueReview, emptySkill, scheduleReview } from './lib/skills'
import { Layout } from './components/Layout'
import { GlossaryProvider } from './components/GlossaryProvider'
import { ReviewSession, type ReviewOutcome } from './components/ReviewSession'
import { Home } from './screens/Home'
import { Tutorial } from './screens/Tutorial'
import { Debrief } from './screens/Debrief'
import { Cases } from './screens/Cases'
import { Theory } from './screens/Theory'
import { Progress } from './screens/Progress'
import { About } from './screens/About'

const CASES = [case01, case02]

export default function App() {
  const [progress, setProgress] = useProgress()
  const [screen, setScreen] = useState<Screen>('home')
  const [mode, setMode] = useState<Mode>('tutorial')
  const [activeCaseId, setActiveCaseId] = useState(() => progress.lastCaseId || case01.id)
  const [result, setResult] = useState<TutorialResult | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)

  const activeCase = CASES.find((item) => item.id === activeCaseId) ?? case01

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  const start = (nextMode: Mode, caseId = activeCase.id) => {
    setActiveCaseId(caseId)
    setMode(nextMode)
    setResult(null)
    setScreen('tutorial')
  }

  const complete = (nextResult: TutorialResult) => {
    setResult(nextResult)
    setActiveCaseId(nextResult.caseId)
    const now = new Date().toISOString()
    setProgress((prev) => {
      const prevCase = prev.cases[nextResult.caseId] ?? emptyCaseProgress
      const score = Math.round((nextResult.firstTryChecks / nextResult.totalChecks) * 100)
      const nextCase =
        nextResult.mode === 'tutorial'
          ? {
              ...prevCase,
              tutorialCompleted: true,
              tutorialFirstTry: Math.max(prevCase.tutorialFirstTry, nextResult.firstTryChecks),
              tutorialErrors: nextResult.errors,
              updatedAt: now,
            }
          : {
              ...prevCase,
              examPassed: prevCase.examPassed || score >= 75,
              bestExamScore: Math.max(prevCase.bestExamScore, score),
              updatedAt: now,
            }

      return {
        ...prev,
        cases: { ...prev.cases, [nextResult.caseId]: nextCase },
        skills: applyStepResults(
          prev.skills,
          nextResult.stepResults,
          nextResult.mode === 'exam' ? 1.2 : 1,
        ),
        review: addReviewForLessons(prev.review, nextResult.errors),
        lastCaseId: nextResult.caseId,
        lastMode: nextResult.mode,
        updatedAt: now,
      }
    })
    setScreen('debrief')
  }

  const reset = () => {
    resetProgress()
    setProgress(defaultProgress)
    setResult(null)
    setActiveCaseId(case01.id)
    setReviewOpen(false)
    setScreen('home')
  }

  const completeReview = (outcomes: ReviewOutcome[]) => {
    const now = new Date().toISOString()
    setProgress((prev) => {
      const review = [...prev.review]
      const skills = { ...prev.skills }
      for (const outcome of outcomes) {
        const index = review.findIndex((item) => item.lessonId === outcome.item.lessonId)
        const scheduled = scheduleReview(
          outcome.item,
          outcome.item.lessonId,
          outcome.item.skillId,
          outcome.correct,
        )
        if (index >= 0) review[index] = scheduled
        else review.push(scheduled)
        skills[outcome.item.skillId] = applySkillOutcome(
          skills[outcome.item.skillId] ?? emptySkill(),
          outcome.correct,
          0.8,
        )
      }
      return { ...prev, review, skills, updatedAt: now }
    })
    setReviewOpen(false)
  }

  const renderScreen = () => {
    if (screen === 'tutorial') {
      return (
        <Tutorial
          key={`${mode}-${activeCase.id}`}
          mode={mode}
          data={activeCase}
          onExit={() => setScreen('home')}
          onComplete={complete}
        />
      )
    }

    if (screen === 'debrief' && result) {
      return (
        <Debrief
          result={result}
          data={activeCase}
          onTutorial={() => start('tutorial', activeCase.id)}
          onExam={() => start('exam', activeCase.id)}
          onHome={() => setScreen('home')}
          onCases={() => setScreen('cases')}
        />
      )
    }

    if (screen === 'cases') {
      return <Cases progress={progress} onStart={start} />
    }

    if (screen === 'theory') {
      return <Theory />
    }

    if (screen === 'progress') {
      return <Progress progress={progress} activeCase={activeCase} onReview={() => setReviewOpen(true)} onReset={reset} />
    }

    if (screen === 'about') {
      return <About />
    }

    return (
      <Home
        progress={progress}
        activeCase={activeCase}
        onTutorial={() => start('tutorial', activeCase.id)}
        onExam={() => start('exam', activeCase.id)}
        onCases={() => setScreen('cases')}
        onTheory={() => setScreen('theory')}
        onProgress={() => setScreen('progress')}
        onReview={() => setReviewOpen(true)}
        onAbout={() => setScreen('about')}
      />
    )
  }

  return (
    <GlossaryProvider>
      <Layout screen={screen} onNavigate={setScreen} hideNav={screen === 'tutorial'} hideTopbar={screen === 'tutorial'}>
        {renderScreen()}
      </Layout>
      <ReviewSession
        open={reviewOpen}
        items={dueReview(progress)}
        onClose={() => setReviewOpen(false)}
        onComplete={completeReview}
      />
    </GlossaryProvider>
  )
}
