import { useEffect, useRef, useState } from 'react'
import type {
  CaseData,
  MicroLesson,
  Mode,
  SoundType,
  TutorialResult,
} from '../types'
import { microLessons } from '../data/microLessons'
import { Badge, Button, Card, ChoiceCard, Modal, StepDots } from '../components/ui'
import { Icon } from '../components/Icon'
import { MicroLessonCard } from '../components/MicroLessonCard'
import { CheatSheet } from '../components/CheatSheet'
import { useGlossary } from '../components/GlossaryProvider'

const STEP_LABELS = ['Гипотеза', 'Анамнез', 'Звуки', 'Фонематика', 'Артикуляция', 'Заключение']
const TOTAL_STEPS = STEP_LABELS.length

const MENTOR: { goal: string; hint: string }[] = [
  {
    goal: 'Начни с жалоб. Что они объясняют, а что — нет?',
    hint: 'Жалобы только на звуки, а понимание и фраза сохранны. Это сужает круг до артикуляции.',
  },
  {
    goal: 'Сначала исключи то, что может имитировать нарушение.',
    hint: 'Слух, раннее развитие и неврология — три вопроса, без которых заключение стоит на песке.',
  },
  {
    goal: 'Слушай не только «что звучит», но и «как».',
    hint: 'Искажение — целевой звук с неправильной артикуляцией. Замена — другой звук вместо него.',
  },
  {
    goal: 'Сохранные компоненты — тоже данные.',
    hint: 'Именно они исключают альтернативы: фонематика — ФФНР, грамматика — ОНР.',
  },
  {
    goal: 'Дизартрия выдаёт себя микрознаками и истощаемостью.',
    hint: 'Синкинезии, тремор, девиация, саливация и монотонность — то, чего при дислалии не будет.',
  },
  {
    goal: 'Собери заключение из четырёх частей.',
    hint: 'Механизм + форма + уровень + рубрика. И один аргумент, почему альтернатива не подходит.',
  },
]

type Answers = {
  hypothesis?: string
  questions?: string[]
  soundTypes?: Record<string, SoundType>
  pairs?: Record<string, boolean>
  grammar?: boolean
  phonemicConclusion?: string
  findings?: Record<string, boolean>
  differential?: string
  mechanism?: string
  form?: string
  level?: string
  icd10?: string
  icd11?: string
  argsFor?: string[]
  argAgainst?: string
}

type CheckResult = { ok: boolean; lessonId?: string; message: string }

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ru-RU'
  utterance.rate = 0.82
  utterance.pitch = 1.15
  window.speechSynthesis.speak(utterance)
}

export function Tutorial({
  mode,
  data,
  onExit,
  onComplete,
}: {
  mode: Mode
  data: CaseData
  onExit: () => void
  onComplete: (result: TutorialResult) => void
}) {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [passed, setPassed] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [stepError, setStepError] = useState<string | null>(null)
  const [microLessonId, setMicroLessonId] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showCheatSheet, setShowCheatSheet] = useState(false)
  const [firstTryChecks, setFirstTryChecks] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [finished, setFinished] = useState(false)
  const startedAt = useRef(new Date())
  const { open: openGlossary } = useGlossary()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [stepIndex])

  const update = (patch: Partial<Answers>) => {
    setAnswers((prev) => ({ ...prev, ...patch }))
    setStepError(null)
  }

  const ready = isReady(stepIndex, answers)
  const mentor = data.mentor[stepIndex] ?? MENTOR[stepIndex]

  const check = (): CheckResult => checkStep(stepIndex, answers, data)

  const handleCheck = () => {
    if (!ready || passed) return
    const result = check()
    if (!result.ok) {
      setAttempted(true)
      setStepError(result.message)
      if (result.lessonId) {
        setErrors((prev) => (prev.includes(result.lessonId!) ? prev : [...prev, result.lessonId!]))
        if (mode === 'tutorial') setMicroLessonId(result.lessonId)
      }
      return
    }

    if (!attempted) setFirstTryChecks((value) => value + 1)
    setPassed(true)
    setStepError(null)
  }

  const handleNext = () => {
    if (!passed) return
    if (stepIndex === TOTAL_STEPS - 1) {
      if (finished) return
      setFinished(true)
      onComplete({
        caseId: data.id,
        mode,
        firstTryChecks,
        totalChecks: TOTAL_STEPS,
        errors,
        startedAt: startedAt.current.toISOString(),
        completedAt: new Date().toISOString(),
        durationSec: Math.max(1, Math.round((Date.now() - startedAt.current.getTime()) / 1000)),
      })
      return
    }

    setStepIndex((index) => index + 1)
    setPassed(false)
    setAttempted(false)
    setStepError(null)
    setShowHint(false)
  }

  const lesson: MicroLesson | null = microLessonId ? microLessons[microLessonId] : null

  return (
    <div className="screen session">
      <div className="session-top">
        <button className="icon-btn" onClick={onExit} aria-label="Выйти из приёма">
          <Icon name="back" />
        </button>
        <div className="session-top__title">
          <span>{data.name}, {data.age} · {mode === 'tutorial' ? 'обучение' : 'зачёт'}</span>
          <strong>
            {stepIndex + 1}. {STEP_LABELS[stepIndex]}
          </strong>
        </div>
        <StepDots total={TOTAL_STEPS} current={stepIndex} />
      </div>

      {mode === 'tutorial' && (
        <div className={`mentor ${showHint ? 'is-open' : ''}`}>
          <div className="mentor__avatar" aria-hidden="true">М</div>
          <div className="mentor__body">
            <div className="mentor__head">
              <strong>Наставник</strong>
              <div className="mentor__actions">
                <button className="mentor__why" onClick={openGlossary}>
                  Словарь
                </button>
                <button className="mentor__why" onClick={() => setShowCheatSheet(true)}>
                  Шпаргалка
                </button>
                <button className="mentor__why" onClick={() => setShowHint((value) => !value)}>
                  {showHint ? 'Скрыть' : 'Почему?'}
                </button>
              </div>
            </div>
            <p>{mentor.goal}</p>
            {showHint && <p className="mentor__hint">{mentor.hint}</p>}
          </div>
        </div>
      )}

      <div className="session-body">
        {stepIndex === 0 && <HypothesesStep data={data} answers={answers} update={update} passed={passed} />}
        {stepIndex === 1 && <AnamnesisStep data={data} answers={answers} update={update} passed={passed} />}
        {stepIndex === 2 && <SoundsStep data={data} answers={answers} update={update} passed={passed} />}
        {stepIndex === 3 && <PhonemicsStep data={data} answers={answers} update={update} passed={passed} />}
        {stepIndex === 4 && <ArticulationStep data={data} answers={answers} update={update} passed={passed} />}
        {stepIndex === 5 && <ConclusionStep data={data} answers={answers} update={update} passed={passed} />}
      </div>

      <div className="action-dock">
        {stepError && !passed && (
          <div className="feedback feedback--warn" role="status">
            <Icon name="info" size={20} />
            <p>{stepError}</p>
          </div>
        )}

        {passed && (
          <div className="feedback feedback--ok" role="status">
            <Icon name="check" size={20} />
            <p>
              {stepIndex === TOTAL_STEPS - 1
                ? 'Заключение собрано. Осталось посмотреть разбор.'
                : 'Шаг пройден. Можно двигаться дальше.'}
            </p>
          </div>
        )}

        <div className="action-bar">
          <div className="action-bar__hint">
            {passed ? 'Шаг завершён' : ready ? 'Проверь себя' : 'Заполни ответ'}
          </div>
          {!passed ? (
            <Button onClick={handleCheck} disabled={!ready} full>
              Проверить
            </Button>
          ) : (
            <Button onClick={handleNext} full>
              {stepIndex === TOTAL_STEPS - 1 ? 'Завершить приём' : 'Дальше'}
              <Icon name="arrow" size={18} />
            </Button>
          )}
        </div>
      </div>

      <Modal
        open={Boolean(lesson)}
        onClose={() => setMicroLessonId(null)}
        title={lesson ? lesson.title : 'Разбор'}
        wide
      >
        {lesson && <MicroLessonCard lesson={lesson} onDone={() => setMicroLessonId(null)} />}
      </Modal>

      <Modal
        open={showCheatSheet}
        onClose={() => setShowCheatSheet(false)}
        title="Шпаргалка"
        wide
      >
        <CheatSheet />
      </Modal>
    </div>
  )
}

function isReady(step: number, answers: Answers): boolean {
  switch (step) {
    case 0:
      return Boolean(answers.hypothesis)
    case 1:
      return (answers.questions?.length ?? 0) === 3
    case 2:
      return Object.keys(answers.soundTypes ?? {}).length === 4
    case 3:
      return (
        Object.keys(answers.pairs ?? {}).length === 3 &&
        typeof answers.grammar === 'boolean' &&
        Boolean(answers.phonemicConclusion)
      )
    case 4:
      return (
        Object.keys(answers.findings ?? {}).length === 6 &&
        Boolean(answers.differential)
      )
    case 5:
      return Boolean(
        answers.mechanism &&
          answers.form &&
          answers.level &&
          answers.icd10 &&
          answers.icd11 &&
          answers.argsFor?.length === 2 &&
          answers.argAgainst,
      )
    default:
      return false
  }
}

function checkStep(step: number, answers: Answers, data: CaseData): CheckResult {
  switch (step) {
    case 0: {
      const correctOption = data.hypotheses.find((hypothesis) => hypothesis.correct)
      const correct = answers.hypothesis === correctOption?.id
      return {
        ok: correct,
        lessonId: correct ? undefined : 'M1',
        message: correct
          ? correctOption?.feedback ?? 'Верно: гипотеза объясняет жалобы.'
          : 'Гипотеза не объясняет жалобы целиком. Посмотри, что именно страдает: только звуки или ещё словарь и грамматика?',
      }
    }
    case 1: {
      const selected = answers.questions ?? []
      const hasNoise = selected.some((id) => data.anamnesisOptions.find((q) => q.id === id)?.noise)
      const missingCritical = data.anamnesisOptions
        .filter((q) => q.critical)
        .some((q) => !selected.includes(q.id))
      if (hasNoise) {
        return {
          ok: false,
          lessonId: 'M3',
          message: 'Один из вопросов — шум: он не меняет гипотезу, но тратит минуту приёма.',
        }
      }
      if (missingCritical) {
        return {
          ok: false,
          lessonId: 'M2',
          message: 'Не хватает критического вопроса: слух, раннее развитие или неврология. Без них заключение рискованно.',
        }
      }
      return {
        ok: true,
        message: 'Верно: три критических вопроса закрывают главные риски.',
      }
    }
    case 2: {
      const types = answers.soundTypes ?? {}
      const correct = data.soundClips.every((clip) => types[clip.id] === clip.correctType)
      return {
        ok: correct,
        lessonId: correct ? undefined : 'M4',
        message: correct
          ? 'Верно: искажения и замена различены.'
          : 'Один или несколько типов определены неверно. Сравни: звук тот же, но уклад другой — или вместо него другой звук?',
      }
    }
    case 3: {
      const pairs = answers.pairs ?? {}
      const pairsOk = data.phonemicPairs.every((pair) => pairs[pair.id] === pair.distinguishes)
      if (!pairsOk) {
        return {
          ok: false,
          lessonId: 'M5',
          message: 'Проверь фонематические пары: результат не совпадает с данными. Это важный компонент для различения ФФНР и дислалии.',
        }
      }
      if (answers.grammar !== data.grammarCorrect) {
        return {
          ok: false,
          lessonId: 'M7',
          message: 'Грамматическая проба интерпретирована неверно. Это ключ к различению ОНР и ФФНР.',
        }
      }
      if (answers.phonemicConclusion !== data.phonemicConclusionCorrect) {
        return {
          ok: false,
          lessonId: 'M5',
          message: 'Вывод не следует из данных. Сопоставь состояние фонематики и грамматики.',
        }
      }
      return {
        ok: true,
        message: 'Верно: вывод следует из состояния фонематики и грамматики.',
      }
    }
    case 4: {
      const findings = answers.findings ?? {}
      const findingsOk = data.articulationFindings.every(
        (finding) => findings[finding.id] === finding.present,
      )
      if (!findingsOk) {
        return {
          ok: false,
          lessonId: 'M6',
          message: 'Карта артикуляции заполнена неточно. Сверь каждую находку с результатом пробы.',
        }
      }
      const correctDifferential = data.differentials.find((option) => option.correct)?.id
      if (answers.differential !== correctDifferential) {
        return {
          ok: false,
          lessonId: 'M6',
          message: 'Заключение по механизму не совпадает с данными. Вернись к микрознакам и просодике.',
        }
      }
      return {
        ok: true,
        message: 'Верно: находки и механизм совпадают.',
      }
    }
    case 5: {
      const c = data.conclusion.correct
      const fieldsOk =
        answers.mechanism === c.mechanism &&
        answers.form === c.form &&
        answers.level === c.level &&
        answers.icd10 === c.icd10 &&
        answers.icd11 === c.icd11
      if (!fieldsOk) {
        return {
          ok: false,
          lessonId: 'M8',
          message: 'Заключение собрано не полностью или неверно. Проверь механизм, форму, уровень и обе рубрики.',
        }
      }
      const selectedFor = answers.argsFor ?? []
      const correctFor = data.argumentsFor.filter((arg) => arg.correct).map((arg) => arg.id)
      const forOk =
        selectedFor.length === 2 &&
        selectedFor.every((id) => correctFor.includes(id)) &&
        correctFor.every((id) => selectedFor.includes(id))
      const wrongFor = data.argumentsFor.find(
        (arg) => selectedFor.includes(arg.id) && !arg.correct,
      )
      if (!forOk) {
        return {
          ok: false,
          lessonId: wrongFor?.lessonId ?? 'M9',
          message:
            'Аргументы «за» должны опираться на конкретные пробы. Выбери два признака, которые действительно подтверждают дислалию.',
        }
      }
      const against = data.argumentsAgainst.find((arg) => arg.id === answers.argAgainst)
      if (!against?.correct) {
        return {
          ok: false,
          lessonId: against?.lessonId ?? 'M9',
          message:
            'Контраргумент должен называть признак, которого не хватает альтернативе. Общие слова не подходят.',
        }
      }
      return {
        ok: true,
        message: 'Верно: заключение собрано, аргументы опираются на пробы.',
      }
    }
    default:
      return { ok: false, message: 'Неизвестный шаг.' }
  }
}

function HypothesesStep({
  data,
  answers,
  update,
  passed,
}: {
  data: CaseData
  answers: Answers
  update: (patch: Partial<Answers>) => void
  passed: boolean
}) {
  return (
    <div className="stack">
      <Card className="patient-card">
        <div className="patient-card__head">
          <div className="avatar" aria-hidden="true">Ф</div>
          <div>
            <div className="patient-card__name">
              {data.name}, {data.age}
            </div>
            <div className="muted">{data.group} · запрос: {data.request}</div>
          </div>
          <Badge tone="info">первый приём</Badge>
        </div>
        <div className="complaints">
          {data.complaints.map((complaint) => (
            <div className="complaint" key={complaint}>
              <Icon name="sound" size={16} />
              <span>{complaint}</span>
            </div>
          ))}
        </div>
        <div className="anamnesis-grid">
          {data.anamnesis.map((item) => (
            <div className="anamnesis-item" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </Card>

      <div className="step-title">
        <h2>Какая гипотеза объясняет жалобы лучше всего?</h2>
        <p>Выбери одну. На этом шаге важно не угадать, а увидеть, что именно страдает.</p>
      </div>

      <div className="choice-list">
        {data.hypotheses.map((hypothesis) => (
          <ChoiceCard
            key={hypothesis.id}
            title={hypothesis.label}
            caption={hypothesis.caption}
            selected={answers.hypothesis === hypothesis.id}
            onClick={() => update({ hypothesis: hypothesis.id })}
            tone={passed && hypothesis.correct ? 'correct' : 'default'}
            disabled={passed}
            icon={<Icon name="spark" size={18} />}
          />
        ))}
      </div>

      {passed && (
        <Card tone="soft" className="note">
          <strong>Почему это работает.</strong>
          <p>{data.hypothesisNote}</p>
        </Card>
      )}
    </div>
  )
}

function AnamnesisStep({
  data,
  answers,
  update,
  passed,
}: {
  data: CaseData
  answers: Answers
  update: (patch: Partial<Answers>) => void
  passed: boolean
}) {
  const selected = answers.questions ?? []
  const toggle = (id: string) => {
    if (passed) return
    if (selected.includes(id)) {
      update({ questions: selected.filter((item) => item !== id) })
    } else if (selected.length < 3) {
      update({ questions: [...selected, id] })
    }
  }

  return (
    <div className="stack">
      <div className="step-title">
        <h2>Что спросить у родителя?</h2>
        <p>Выбери ровно три вопроса. Один из них может оказаться шумом — тогда минута потрачена зря.</p>
        <div className="counter">
          <span>Выбрано</span>
          <strong>{selected.length} / 3</strong>
        </div>
      </div>

      <div className="question-list">
        {data.anamnesisOptions.map((question) => {
          const isSelected = selected.includes(question.id)
          return (
            <button
              key={question.id}
              className={`question ${isSelected ? 'is-selected' : ''}`}
              onClick={() => toggle(question.id)}
              aria-pressed={isSelected}
              disabled={passed}
            >
              <span className="question__check" aria-hidden="true">
                {isSelected ? <Icon name="check" size={14} /> : null}
              </span>
              <span className="question__text">
                <strong>{question.text}</strong>
                <span>{question.category}</span>
              </span>
              {question.noise && <span className="question__tag">шум?</span>}
            </button>
          )
        })}
      </div>

      {passed && (
        <Card tone="soft" className="note">
          <strong>Что это дало.</strong>
          <p>
            Слух, раннее развитие и неврология закрывают главные риски. Остальные вопросы не меняют
            гипотезу и тратят время.
          </p>
        </Card>
      )}
    </div>
  )
}

function SoundsStep({
  data,
  answers,
  update,
  passed,
}: {
  data: CaseData
  answers: Answers
  update: (patch: Partial<Answers>) => void
  passed: boolean
}) {
  const types: { id: SoundType; label: string }[] = [
    { id: 'distortion', label: 'Искажение' },
    { id: 'substitution', label: 'Замена' },
    { id: 'omission', label: 'Пропуск' },
    { id: 'normal', label: 'Норма' },
  ]

  const setType = (clipId: string, type: SoundType) => {
    if (passed) return
    update({ soundTypes: { ...(answers.soundTypes ?? {}), [clipId]: type } })
  }

  return (
    <div className="stack">
      <div className="step-title">
        <h2>Послушай и определи тип</h2>
        <p>
          Для каждого фрагмента выбери, что происходит со звуком.
          {data.soundClips.some((clip) => clip.otherChild)
            ? ' Один фрагмент — учебный пример другого ребёнка.'
            : ' Все фрагменты — из речи ребёнка.'}
          {' '}В прототипе показана транскрипция, кнопка ▶ озвучивает фрагмент.
        </p>
      </div>

      <div className="clip-list">
        {data.soundClips.map((clip) => {
          const selected = answers.soundTypes?.[clip.id]
          const isCorrect = passed && selected === clip.correctType
          return (
            <Card key={clip.id} className={`clip ${isCorrect ? 'is-correct' : ''}`}>
              <div className="clip__head">
                <div>
                  <div className="clip__title">{clip.title}</div>
                  <div className="muted">{clip.child}</div>
                </div>
                <button className="play-btn" onClick={() => speak(clip.spoken)} aria-label={`Озвучить: ${clip.title}`}>
                  <Icon name="play" size={18} />
                </button>
              </div>
              <div className="clip__transcription">{clip.transcription}</div>
              {clip.otherChild && <Badge tone="warning">учебный пример, не Федя</Badge>}
              <div className="type-row" role="group" aria-label={`Тип для ${clip.title}`}>
                {types.map((type) => (
                  <button
                    key={type.id}
                    className={`type-chip ${selected === type.id ? 'is-selected' : ''}`}
                    onClick={() => setType(clip.id, type.id)}
                    aria-pressed={selected === type.id}
                    disabled={passed}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              {passed && (
                <p className={`clip__feedback ${isCorrect ? 'ok' : 'warn'}`}>
                  {isCorrect ? 'Верно. ' : 'Неверно. '}
                  {clip.explanation}
                </p>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function PhonemicsStep({
  data,
  answers,
  update,
  passed,
}: {
  data: CaseData
  answers: Answers
  update: (patch: Partial<Answers>) => void
  passed: boolean
}) {
  const pairs = answers.pairs ?? {}
  return (
    <div className="stack">
      <div className="step-title">
        <h2>Проверь сохранные компоненты</h2>
        <p>Различает ли Федя оппозиционные звуки? И есть ли аграмматизмы в пробах?</p>
      </div>

      <Card>
        <h3 className="card-title">Фонематический слух</h3>
        <div className="pair-list">
          {data.phonemicPairs.map((pair) => (
            <div className="pair" key={pair.id}>
              <div className="pair__words">{pair.words}</div>
              <div className="segmented">
                <button
                  className={pairs[pair.id] === true ? 'is-selected' : ''}
                  onClick={() => !passed && update({ pairs: { ...pairs, [pair.id]: true } })}
                  aria-pressed={pairs[pair.id] === true}
                  disabled={passed}
                >
                  Различает
                </button>
                <button
                  className={pairs[pair.id] === false ? 'is-selected' : ''}
                  onClick={() => !passed && update({ pairs: { ...pairs, [pair.id]: false } })}
                  aria-pressed={pairs[pair.id] === false}
                  disabled={passed}
                >
                  Не различает
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="card-title">Грамматические пробы</h3>
        <ul className="probe-list">
          {data.grammarProbes.map((probe) => (
            <li key={probe.id}>
              <Icon name="check" size={16} />
              <span>{probe.text}</span>
            </li>
          ))}
        </ul>
        <div className="segmented segmented--wide">
          <button
            className={answers.grammar === true ? 'is-selected' : ''}
            onClick={() => !passed && update({ grammar: true })}
            aria-pressed={answers.grammar === true}
            disabled={passed}
          >
            Аграмматизмов нет
          </button>
          <button
            className={answers.grammar === false ? 'is-selected' : ''}
            onClick={() => !passed && update({ grammar: false })}
            aria-pressed={answers.grammar === false}
            disabled={passed}
          >
            Есть аграмматизмы
          </button>
        </div>
      </Card>

      <div className="step-title">
        <h3>Какой вывод?</h3>
      </div>
      <div className="choice-list">
        {[
          { id: 'intact', label: 'Фонематика и грамматика сохранны', caption: 'Значит, это не ФФНР и не ОНР' },
          { id: 'ffnr', label: 'Фонематика нарушена', caption: 'Тогда нужно думать о ФФНР' },
          { id: 'onr', label: 'Страдает грамматика', caption: 'Тогда нужно думать об ОНР' },
        ].map((option) => (
          <ChoiceCard
            key={option.id}
            title={option.label}
            caption={option.caption}
            selected={answers.phonemicConclusion === option.id}
            onClick={() => !passed && update({ phonemicConclusion: option.id })}
            disabled={passed}
            tone={passed && option.id === 'intact' ? 'correct' : 'default'}
          />
        ))}
      </div>

      {passed && (
        <Card tone="soft" className="note">
          <strong>Почему это важно.</strong>
          <p>
            Фонематика и грамматика — те самые «сохранные компоненты», которые исключают ФФНР и ОНР.
            Без них дислалия остаётся догадкой.
          </p>
        </Card>
      )}
    </div>
  )
}

function ArticulationStep({
  data,
  answers,
  update,
  passed,
}: {
  data: CaseData
  answers: Answers
  update: (patch: Partial<Answers>) => void
  passed: boolean
}) {
  const findings = answers.findings ?? {}
  const toggle = (id: string, value: boolean) => {
    if (passed) return
    update({ findings: { ...findings, [id]: value } })
  }

  return (
    <div className="stack">
      <div className="step-title">
        <h2>Что ты видишь в артикуляции?</h2>
        <p>Отметь, есть ли каждая находка. Это ключ к различению дислалии и стёртой дизартрии.</p>
      </div>

      <div className="finding-list">
        {data.articulationFindings.map((finding) => (
          <Card key={finding.id} className="finding">
            <div className="finding__text">
              <strong>{finding.label}</strong>
              <span>{finding.detail}</span>
            </div>
            <div className="segmented segmented--compact">
              <button
                className={findings[finding.id] === true ? 'is-selected' : ''}
                onClick={() => toggle(finding.id, true)}
                aria-pressed={findings[finding.id] === true}
                disabled={passed}
              >
                Есть
              </button>
              <button
                className={findings[finding.id] === false ? 'is-selected' : ''}
                onClick={() => toggle(finding.id, false)}
                aria-pressed={findings[finding.id] === false}
                disabled={passed}
              >
                Нет
              </button>
            </div>
            {passed && <p className={`finding__feedback ${finding.present === findings[finding.id] ? 'ok' : 'warn'}`}>{finding.explanation}</p>}
          </Card>
        ))}
      </div>

      <div className="step-title">
        <h3>Какое заключение ближе?</h3>
      </div>
      <div className="choice-list">
        {data.differentials.map((option) => (
          <ChoiceCard
            key={option.id}
            title={option.label}
            caption={option.caption}
            selected={answers.differential === option.id}
            onClick={() => !passed && update({ differential: option.id })}
            disabled={passed}
            tone={passed && option.correct ? 'correct' : 'default'}
          />
        ))}
      </div>
    </div>
  )
}

function ConclusionStep({
  data,
  answers,
  update,
  passed,
}: {
  data: CaseData
  answers: Answers
  update: (patch: Partial<Answers>) => void
  passed: boolean
}) {
  const argsFor = answers.argsFor ?? []
  const toggleFor = (id: string) => {
    if (passed) return
    if (argsFor.includes(id)) {
      update({ argsFor: argsFor.filter((item) => item !== id) })
    } else if (argsFor.length < 2) {
      update({ argsFor: [...argsFor, id] })
    }
  }

  return (
    <div className="stack">
      <div className="step-title">
        <h2>Собери заключение</h2>
        <p>Четыре части: механизм, форма, уровень и рубрика. Затем — два аргумента «за» и один «против».</p>
      </div>

      <Card>
        <div className="form-grid">
          <label>
            <span>Механизм</span>
            <select value={answers.mechanism ?? ''} onChange={(event) => update({ mechanism: event.target.value })} disabled={passed}>
              <option value="">Выбрать</option>
              {data.conclusion.mechanisms.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Форма</span>
            <select value={answers.form ?? ''} onChange={(event) => update({ form: event.target.value })} disabled={passed}>
              <option value="">Выбрать</option>
              {data.conclusion.forms.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Уровень</span>
            <select value={answers.level ?? ''} onChange={(event) => update({ level: event.target.value })} disabled={passed}>
              <option value="">Выбрать</option>
              {data.conclusion.levels.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>МКБ-10</span>
            <select value={answers.icd10 ?? ''} onChange={(event) => update({ icd10: event.target.value })} disabled={passed}>
              <option value="">Выбрать</option>
              {data.conclusion.icd10.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>МКБ-11</span>
            <select value={answers.icd11 ?? ''} onChange={(event) => update({ icd11: event.target.value })} disabled={passed}>
              <option value="">Выбрать</option>
              {data.conclusion.icd11.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="draft">
          <span>Черновик</span>
          <p>
            {data.conclusion.mechanisms.find((option) => option.id === answers.mechanism)?.label ?? '…'}
            {', '}
            {data.conclusion.forms.find((option) => option.id === answers.form)?.label ?? '…'}
            {', '}
            {data.conclusion.levels.find((option) => option.id === answers.level)?.label ?? '…'}
            {' · '}
            {data.conclusion.icd10.find((option) => option.id === answers.icd10)?.label ?? '…'}
            {' / '}
            {data.conclusion.icd11.find((option) => option.id === answers.icd11)?.label ?? '…'}
          </p>
        </div>
      </Card>

      <Card>
        <h3 className="card-title">Аргументы «за» — выбери два</h3>
        <div className="argument-list">
          {data.argumentsFor.map((argument) => (
            <button
              key={argument.id}
              className={`argument ${argsFor.includes(argument.id) ? 'is-selected' : ''} ${passed && argument.correct ? 'is-correct' : ''}`}
              onClick={() => toggleFor(argument.id)}
              aria-pressed={argsFor.includes(argument.id)}
              disabled={passed}
            >
              <span className="argument__mark" aria-hidden="true">
                {argsFor.includes(argument.id) ? <Icon name="check" size={13} /> : null}
              </span>
              <span>{argument.text}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="card-title">Один аргумент «против» альтернативы</h3>
        <div className="argument-list">
          {data.argumentsAgainst.map((argument) => (
            <button
              key={argument.id}
              className={`argument ${answers.argAgainst === argument.id ? 'is-selected' : ''} ${passed && argument.correct ? 'is-correct' : ''}`}
              onClick={() => !passed && update({ argAgainst: argument.id })}
              aria-pressed={answers.argAgainst === argument.id}
              disabled={passed}
            >
              <span className="argument__mark" aria-hidden="true">
                {answers.argAgainst === argument.id ? <Icon name="check" size={13} /> : null}
              </span>
              <span>{argument.text}</span>
            </button>
          ))}
        </div>
      </Card>

      {passed && (
        <Card tone="soft" className="note">
          <strong>Заключение</strong>
          <p>{data.conclusionSummary}</p>
        </Card>
      )}
    </div>
  )
}
