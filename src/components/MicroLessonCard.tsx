import { useState } from 'react'
import type { MicroLesson } from '../types'
import { Badge, Button } from './ui'
import { Icon } from './Icon'

export function MicroLessonCard({ lesson, onDone }: { lesson: MicroLesson; onDone: () => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const chosen = lesson.check.options.find((option) => option.id === selected)
  const correct = Boolean(chosen?.correct)

  return (
    <div className="lesson">
      <div className="lesson__tag">
        <Badge tone="info">{lesson.tag}</Badge>
        <span>60–120 секунд</span>
      </div>

      <div className="lesson__block">
        <span className="lesson__icon"><Icon name="spark" size={18} /></span>
        <div>
          <h3>Что произошло</h3>
          <p>{lesson.what}</p>
        </div>
      </div>
      <div className="lesson__block">
        <span className="lesson__icon"><Icon name="info" size={18} /></span>
        <div>
          <h3>Почему это важно</h3>
          <p>{lesson.why}</p>
        </div>
      </div>
      <div className="lesson__examples">
        <div className="lesson__example">
          <span>Пример</span>
          <p>{lesson.example}</p>
        </div>
        <div className="lesson__example lesson__example--counter">
          <span>Контрпример</span>
          <p>{lesson.counterexample}</p>
        </div>
      </div>

      <div className="lesson__check">
        <h3>Проверь себя</h3>
        <p>{lesson.check.question}</p>
        <div className="lesson__options">
          {lesson.check.options.map((option) => (
            <button
              key={option.id}
              className={`lesson__option ${selected === option.id ? 'is-selected' : ''} ${submitted && option.correct ? 'is-correct' : ''} ${submitted && selected === option.id && !option.correct ? 'is-wrong' : ''}`}
              onClick={() => {
                if (submitted) return
                setSelected(option.id)
              }}
              disabled={submitted}
            >
              {option.label}
            </button>
          ))}
        </div>

        {submitted && (
          <div className={`lesson__result ${correct ? 'ok' : 'warn'}`}>
            <strong>{correct ? 'Верно.' : 'Пока нет.'}</strong>
            <p>{lesson.check.explanation}</p>
          </div>
        )}

        <div className="lesson__actions">
          {!submitted ? (
            <Button onClick={() => setSubmitted(true)} disabled={!selected} full>
              Проверить
            </Button>
          ) : correct ? (
            <Button onClick={onDone} full>
              Вернуться к шагу <Icon name="arrow" size={18} />
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => {
                setSubmitted(false)
                setSelected(null)
              }}
              full
            >
              Попробовать ещё
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
