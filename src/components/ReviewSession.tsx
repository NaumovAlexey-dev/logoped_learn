import { useEffect, useState } from 'react'
import type { ReviewItem } from '../types'
import { microLessons } from '../data/microLessons'
import { SKILLS } from '../lib/skills'
import { Badge, Button, Modal } from './ui'
import { Icon } from './Icon'

export type ReviewOutcome = { item: ReviewItem; correct: boolean }

export function ReviewSession({
  open,
  items,
  onClose,
  onComplete,
}: {
  open: boolean
  items: ReviewItem[]
  onClose: () => void
  onComplete: (outcomes: ReviewOutcome[]) => void
}) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [outcomes, setOutcomes] = useState<ReviewOutcome[]>([])
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!open) return
    setIndex(0)
    setSelected(null)
    setSubmitted(false)
    setOutcomes([])
    setFinished(false)
  }, [open])

  const current = items[index]
  const lesson = current ? microLessons[current.lessonId] : null
  const skill = current
    ? SKILLS.find((item) => item.id === current.skillId)
    : null
  const chosen = lesson?.check.options.find((option) => option.id === selected)
  const isCorrect = Boolean(chosen?.correct)

  const submit = () => {
    if (!current || !chosen) return
    const outcome = { item: current, correct: isCorrect }
    setOutcomes((prev) => [...prev, outcome])
    setSubmitted(true)
  }

  const next = () => {
    if (index >= items.length - 1) {
      setFinished(true)
      return
    }
    setIndex((value) => value + 1)
    setSelected(null)
    setSubmitted(false)
  }

  const finish = () => {
    onComplete(outcomes)
  }

  if (finished) {
    const correctCount = outcomes.filter((outcome) => outcome.correct).length
    return (
      <Modal open={open} onClose={onClose} title="Повторение завершено" wide>
        <div className="review-summary">
          <div className="review-summary__score">
            <strong>{correctCount}</strong>
            <span>из {outcomes.length}</span>
          </div>
          <h3>{correctCount === outcomes.length ? 'Отлично, всё закрепилось' : 'Есть что повторить'}</h3>
          <p>
            {correctCount === outcomes.length
              ? 'Следующий повтор придёт позже — по интервалам 1 / 3 / 7 / 14 дней.'
              : 'Темы с ошибкой вернутся завтра. Это не штраф, а расписание повторения.'}
          </p>
          <Button onClick={finish} full>
            Готово <Icon name="check" size={18} />
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="Повторение" wide>
      {!current || !lesson ? (
        <div className="review-empty">
          <Icon name="check" size={28} />
          <h3>На сегодня всё</h3>
          <p>Очередь повторения пуста. Возвращайся после следующего приёма.</p>
          <Button onClick={onClose} full>
            Закрыть
          </Button>
        </div>
      ) : (
        <div className="review">
          <div className="review__top">
            <span>
              {index + 1} из {items.length}
            </span>
            {skill && <Badge tone="info">{skill.short}</Badge>}
          </div>
          <h3>{lesson.title}</h3>
          <p className="review__question">{lesson.check.question}</p>

          <div className="review__options">
            {lesson.check.options.map((option) => (
              <button
                key={option.id}
                className={`review__option ${selected === option.id ? 'is-selected' : ''} ${submitted && option.correct ? 'is-correct' : ''} ${submitted && selected === option.id && !option.correct ? 'is-wrong' : ''}`}
                onClick={() => !submitted && setSelected(option.id)}
                disabled={submitted}
              >
                {option.label}
              </button>
            ))}
          </div>

          {submitted && (
            <div className={`review__result ${isCorrect ? 'ok' : 'warn'}`}>
              <strong>{isCorrect ? 'Верно.' : 'Пока нет.'}</strong>
              <p>{lesson.check.explanation}</p>
            </div>
          )}

          <div className="review__actions">
            {!submitted ? (
              <Button onClick={submit} disabled={!selected} full>
                Проверить
              </Button>
            ) : (
              <Button onClick={next} full>
                {index >= items.length - 1 ? 'Завершить' : 'Дальше'}
                <Icon name="arrow" size={18} />
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
