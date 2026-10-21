import { useEffect, useState } from 'react'
import type { Mode, Screen, TutorialResult } from './types'
import { case01 } from './data/case01'
import { case02 } from './data/case02'
import { defaultProgress, emptyCaseProgress, resetProgress, useProgress } from './lib/storage'
import { Layout } from './components/Layout'
import { GlossaryProvider } from './components/GlossaryProvider'
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
    setScreen('home')
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
      return <Progress progress={progress} activeCase={activeCase} onReset={reset} />
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
        onAbout={() => setScreen('about')}
      />
    )
  }

  return (
    <GlossaryProvider>
      <Layout screen={screen} onNavigate={setScreen} hideNav={screen === 'tutorial'} hideTopbar={screen === 'tutorial'}>
        {renderScreen()}
      </Layout>
    </GlossaryProvider>
  )
}
