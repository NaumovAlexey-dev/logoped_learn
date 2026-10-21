import type { CaseData, Progress } from '../types'
import { getCaseProgress } from '../lib/storage'
import { dueReview, nextReviewDate } from '../lib/skills'
import { SkillMap } from '../components/SkillMap'
import { Badge, Button, Card, ProgressBar } from '../components/ui'
import { Icon } from '../components/Icon'

export function Home({
  progress,
  activeCase,
  onTutorial,
  onExam,
  onCases,
  onTheory,
  onProgress,
  onReview,
  onAbout,
}: {
  progress: Progress
  activeCase: CaseData
  onTutorial: () => void
  onExam: () => void
  onCases: () => void
  onTheory: () => void
  onProgress: () => void
  onReview: () => void
  onAbout: () => void
}) {
  const caseProgress = getCaseProgress(progress, activeCase.id)
  const hasTutorial = caseProgress.tutorialCompleted
  const hasExam = caseProgress.examPassed
  const due = dueReview(progress)
  const nextReview = nextReviewDate(progress.review)
  const hasSkills = Object.values(progress.skills).some((skill) => skill.attempts > 0)

  return (
    <div className="screen home">
      <section className="hero">
        <div className="hero__eyebrow">
          <span className="pulse-dot" />
          Учебный приём · 12–15 минут
        </div>
        <h1>
          Сначала человек.
          <br />
          Потом — заключение.
        </h1>
        <p className="hero__lead">
          «Приём» — симулятор логопедического обследования. {activeCase.name}, {activeCase.age}:
          приём проходит в режиме наставника, а каждая ошибка превращается в короткий разбор.
        </p>
        <div className="hero__actions">
          <Button onClick={hasTutorial ? onExam : onTutorial} full>
            <Icon name={hasTutorial ? 'check' : 'play'} size={18} />
            {hasExam ? 'Пройти зачёт ещё раз' : hasTutorial ? 'Пройти зачёт' : 'Начать обучение'}
          </Button>
          <Button variant="secondary" onClick={hasTutorial ? onTutorial : onAbout} full>
            {hasTutorial ? 'Повторить обучение' : 'Как устроена игра'}
          </Button>
        </div>
        <div className="hero__meta">
          <span>
            <Icon name="user" size={16} /> {activeCase.name}, {activeCase.age}
          </span>
          <span>
            <Icon name="clock" size={16} /> без таймера
          </span>
          <span>
            <Icon name="shield" size={16} /> учебный кейс
          </span>
        </div>
      </section>

      {hasTutorial && (
        <Card tone="soft" className="progress-card">
          <div className="progress-card__head">
            <div>
              <Badge tone={hasExam ? 'success' : 'info'}>
                {hasExam ? 'Зачёт пройден' : 'Обучение завершено'}
              </Badge>
              <h2>{hasExam ? `${caseProgress.bestExamScore} / 100` : `${activeCase.name}: обучение завершено`}</h2>
            </div>
            <Icon name={hasExam ? 'check' : 'spark'} size={28} />
          </div>
          <ProgressBar
            value={hasExam ? caseProgress.bestExamScore : (caseProgress.tutorialFirstTry / 6) * 100}
            label={hasExam ? 'Лучший зачёт' : 'Проверки с первой попытки'}
          />
          <p className="muted">
            {hasExam
              ? 'Следующий шаг — открыть библиотеку и выбрать следующий кейс.'
              : `Проверки с первой попытки: ${caseProgress.tutorialFirstTry} из 6. Зачёт откроется после обучения.`}
          </p>
        </Card>
      )}

      {(due.length > 0 || nextReview) && (
        <Card className={`review-card ${due.length > 0 ? 'is-due' : ''}`}>
          <div className="review-card__head">
            <div>
              <Badge tone={due.length > 0 ? 'warning' : 'success'}>
                {due.length > 0 ? 'повторение' : 'повторение закрыто'}
              </Badge>
              <h2>
                {due.length > 0
                  ? `${due.length} ${due.length === 1 ? 'тема' : 'темы'} к повторению`
                  : 'На сегодня всё повторено'}
              </h2>
            </div>
            <Icon name={due.length > 0 ? 'spark' : 'check'} size={26} />
          </div>
          <p>
            {due.length > 0
              ? '3–5 минут: вопросы из микро-уроков, которые стоит закрепить.'
              : nextReview
                ? `Следующее повторение: ${new Date(nextReview).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}.`
                : 'Ошибки появятся здесь после первого приёма.'}
          </p>
          {due.length > 0 && (
            <Button onClick={onReview} full>
              Повторить <Icon name="arrow" size={18} />
            </Button>
          )}
        </Card>
      )}

      {hasSkills && (
        <Card className="skill-card">
          <div className="skill-card__head">
            <div>
              <Badge tone="info">карта навыков</Badge>
              <h2>Что уже получается</h2>
            </div>
            <Button variant="ghost" onClick={onProgress}>
              Все навыки
            </Button>
          </div>
          <SkillMap skills={progress.skills} compact />
        </Card>
      )}

      <section className="section">
        <div className="section__head">
          <h2>Что внутри</h2>
          <span className="section__hint">не викторина</span>
        </div>
        <div className="feature-grid">
          <Card className="feature">
            <span className="feature__icon"><Icon name="sound" size={22} /></span>
            <h3>6 блоков обследования</h3>
            <p>Звуки, фонематика, слоговая структура, лексика и грамматика, связная речь, артикуляция и просодика.</p>
          </Card>
          <Card className="feature">
            <span className="feature__icon"><Icon name="book" size={22} /></span>
            <h3>11 микро-уроков</h3>
            <p>Ошибка открывает 60–120-секундный разбор: что произошло, почему важно, пример и проверка.</p>
          </Card>
          <Card className="feature">
            <span className="feature__icon"><Icon name="shield" size={22} /></span>
            <h3>Без стигмы</h3>
            <p>Сначала человек, потом нарушение. Игра не ставит клинический диагноз и не заменяет супервизию.</p>
          </Card>
        </div>
      </section>

      <Card className="next-card">
        <div className="next-card__text">
          <Badge tone="neutral">Библиотека</Badge>
          <h2>Пять кейсов, два уже в прототипе</h2>
          <p>Дислалия и дизартрия доступны; ОНР, ФФНР и заикание — в разработке. Внутри — не «угадай диагноз», а маршрут приёма.</p>
        </div>
        <Button variant="secondary" onClick={onCases}>
          Открыть кейсы <Icon name="arrow" size={18} />
        </Button>
      </Card>

      <Card className="next-card next-card--theory">
        <div className="next-card__text">
          <Badge tone="info">Теория</Badge>
          <h2>Шпаргалка на приём</h2>
          <p>6 блоков, критические вопросы, формула заключения и 11 микро-уроков — можно открыть до приёма.</p>
        </div>
        <Button variant="secondary" onClick={onTheory}>
          Открыть теорию <Icon name="arrow" size={18} />
        </Button>
      </Card>

      <p className="fineprint">
        Все дети, имена и высказывания вымышлены. Это учебный тренажёр алгоритма, а не медицинское изделие.
      </p>
    </div>
  )
}
