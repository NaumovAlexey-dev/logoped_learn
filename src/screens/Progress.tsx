import { useState } from 'react'
import type { CaseData, CaseProgress, Progress as ProgressType } from '../types'
import { getCaseProgress } from '../lib/storage'
import { dueReview, nextReviewDate } from '../lib/skills'
import { SkillMap } from '../components/SkillMap'
import { Badge, Button, Card, ProgressBar } from '../components/ui'
import { Icon } from '../components/Icon'

const BADGES = [
  { id: 'first', title: 'Кейс освоен', note: 'Обучение завершено', icon: 'user' as const, need: (p: CaseProgress) => p.tutorialCompleted },
  { id: 'exam', title: 'Зачёт 75+', note: 'Кейс закрыт', icon: 'shield' as const, need: (p: CaseProgress) => p.examPassed },
  { id: 'anamnesis', title: 'Чистый анамнез', note: 'Без шумовых вопросов', icon: 'book' as const, need: (p: CaseProgress) => p.tutorialCompleted && !p.tutorialErrors.some((id) => ['M2', 'M3'].includes(id)) },
  { id: 'articulation', title: 'Видит механизм', note: 'Без ошибок в артикуляции', icon: 'spark' as const, need: (p: CaseProgress) => p.tutorialCompleted && !p.tutorialErrors.includes('M6') },
  { id: 'conclusion', title: 'Точное заключение', note: 'Без ошибок в формуле', icon: 'check' as const, need: (p: CaseProgress) => p.tutorialCompleted && !p.tutorialErrors.some((id) => ['M8', 'M9'].includes(id)) },
]

export function Progress({
  progress,
  activeCase,
  onReview,
  onReset,
}: {
  progress: ProgressType
  activeCase: CaseData
  onReview: () => void
  onReset: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const caseProgress = getCaseProgress(progress, activeCase.id)
  const started = caseProgress.tutorialCompleted
  const due = dueReview(progress)
  const nextDate = nextReviewDate(progress.review)
  const percent = caseProgress.examPassed
    ? caseProgress.bestExamScore
    : started
      ? Math.round((caseProgress.tutorialFirstTry / 6) * 100)
      : 0

  return (
    <div className="screen progress-screen">
      <div className="page-head">
        <div>
          <span className="eyebrow">Твой маршрут</span>
          <h1>Прогресс</h1>
          <p className="muted" style={{ marginTop: 4 }}>
            {activeCase.name}, {activeCase.age}
          </p>
        </div>
        <Badge tone={caseProgress.examPassed ? 'success' : started ? 'info' : 'neutral'}>
          {caseProgress.examPassed ? 'зачёт пройден' : started ? 'в обучении' : 'не начато'}
        </Badge>
      </div>

      <Card className="progress-hero">
        <div className="progress-hero__top">
          <div>
            <span className="muted">Текущий уровень</span>
            <h2>{caseProgress.examPassed ? 'Самостоятельный приём' : started ? 'Кейс в работе' : 'Старт'}</h2>
          </div>
          <span
            className="score-ring score-ring--small"
            style={{ ['--score' as string]: `${percent}%` }}
            aria-label={`Прогресс: ${percent}%`}
          >
            <strong>{percent}%</strong>
          </span>
        </div>
        <ProgressBar value={percent} label={caseProgress.examPassed ? 'Лучший зачёт' : 'Проверки с первой попытки'} />
        <div className="stat-row">
          <div className="stat">
            <strong>{caseProgress.tutorialFirstTry}/6</strong>
            <span>с первой попытки</span>
          </div>
          <div className="stat">
            <strong>{caseProgress.bestExamScore || '—'}</strong>
            <span>лучший зачёт</span>
          </div>
          <div className="stat">
            <strong>{new Set(caseProgress.tutorialErrors).size}</strong>
            <span>разборов</span>
          </div>
        </div>
      </Card>

      <section className="section">
        <div className="section__head">
          <h2>Карта навыков</h2>
          <span className="section__hint">mastery по 7 навыкам</span>
        </div>
        <Card className="skill-map-card">
          <SkillMap skills={progress.skills} />
        </Card>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Повторение</h2>
          <span className="section__hint">1 / 3 / 7 / 14 дней</span>
        </div>
        <Card className="review-stat">
          <div className="review-stat__grid">
            <div>
              <strong>{due.length}</strong>
              <span>к повторению</span>
            </div>
            <div>
              <strong>{progress.review.length}</strong>
              <span>в очереди</span>
            </div>
            <div>
              <strong>{nextDate ? new Date(nextDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : '—'}</strong>
              <span>следующее</span>
            </div>
          </div>
          {due.length > 0 ? (
            <Button onClick={onReview} full>
              Повторить {due.length} {due.length === 1 ? 'тему' : 'темы'}
            </Button>
          ) : (
            <p className="muted">
              {nextDate
                ? 'На сегодня очередь пуста. Следующее повторение придёт по расписанию.'
                : 'Пока нет тем для повторения — они появятся после ошибок в приёме.'}
            </p>
          )}
        </Card>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Бейджи</h2>
          <span className="section__hint">не рейтинг, а вехи</span>
        </div>
        <div className="badge-grid">
          {BADGES.map((badge) => {
            const unlocked = badge.need(caseProgress)
            return (
              <Card key={badge.id} className={`badge-card ${unlocked ? 'is-unlocked' : ''}`}>
                <span className={`badge-card__icon ${unlocked ? 'is-on' : ''}`}>
                  <Icon name={badge.icon} size={20} />
                </span>
                <strong>{badge.title}</strong>
                <span>{badge.note}</span>
                {!unlocked && <Icon name="lock" size={14} className="badge-card__lock" />}
              </Card>
            )
          })}
        </div>
      </section>

      <Card tone="soft" className="history-card">
        <div className="card-title-row">
          <h2>История</h2>
          <Icon name="clock" size={18} />
        </div>
        <p>
          {caseProgress.updatedAt
            ? `Последнее обновление: ${new Date(caseProgress.updatedAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}`
            : 'Пока пусто. Начни с текущего пациента — история появится здесь.'}
        </p>
      </Card>

      <div className="reset-zone">
        {!confirming ? (
          <Button variant="ghost" onClick={() => setConfirming(true)}>
            Сбросить прогресс
          </Button>
        ) : (
          <Card tone="soft" className="confirm-card">
            <p>Сбросить обучение и зачёт по всем кейсам? Это действие нельзя отменить.</p>
            <div className="confirm-card__actions">
              <Button variant="secondary" onClick={() => setConfirming(false)}>Отмена</Button>
              <Button variant="danger" onClick={onReset}>Сбросить</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
