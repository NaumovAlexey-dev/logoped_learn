import type { Mode, Progress } from '../types'
import { getCaseProgress } from '../lib/storage'
import { Badge, Button, Card } from '../components/ui'
import { Icon } from '../components/Icon'

const CASES = [
  {
    caseId: 'dislalia-01',
    name: 'Федя',
    age: '6 лет',
    diagnosis: 'Дислалия, функциональная, ФНР',
    icd: 'F80.0 · 6A01.0',
    difficulty: 'Лёгкий',
    description: 'Изолированные искажения [с], [з], [ц], [р] при сохранной фонематике и грамматике. Главная ловушка — принять дефект за стёртую дизартрию.',
    available: true,
    reason: '',
  },
  {
    caseId: 'dysarthria-02',
    name: 'Настя',
    age: '6 лет',
    diagnosis: 'Дизартрия, стёртая форма, ФФНР',
    icd: 'R47.1 · MA80.2',
    difficulty: 'Сложный',
    description: 'Смазанность, просодика, микрознаки и истощаемость. Ключ — отличить от дислалии и не спутать уровень с механизмом.',
    available: true,
    reason: 'Откроется после зачёта по дислалии.',
  },
  {
    caseId: 'onr-03',
    name: 'Тимур',
    age: '5 лет 8 мес.',
    diagnosis: 'ОНР III уровня',
    icd: 'F80.1 · 6A01.21',
    difficulty: 'Сложный',
    description: 'Системное недоразвитие, аграмматизмы и телеграфная речь. Ключ — отличить от ФФНР и ЗРР.',
    available: false,
    reason: 'В разработке.',
  },
  {
    caseId: 'ffnr-04',
    name: 'Соня',
    age: '5 лет 6 мес.',
    diagnosis: 'ФФНР',
    icd: 'F80.0 · 6A01.0',
    difficulty: 'Средний',
    description: 'Замены и фонематические ошибки при сохранной грамматике. Ключ — отличить от ОНР.',
    available: false,
    reason: 'В разработке.',
  },
  {
    caseId: 'stuttering-05',
    name: 'Миша',
    age: '5 лет',
    diagnosis: 'Заикание, невротическая форма',
    icd: 'F98.5 · 6A01.1',
    difficulty: 'Средний',
    description: 'Судороги, логофобия и ситуативность при сохранном речевом развитии. Ключ — отличить от полтерна.',
    available: false,
    reason: 'В разработке.',
  },
]

export function Cases({
  progress,
  onStart,
}: {
  progress: Progress
  onStart: (mode: Mode, caseId: string) => void
}) {
  const dislaliaPassed = getCaseProgress(progress, 'dislalia-01').examPassed
  const availableCount = 1 + (dislaliaPassed ? 1 : 0)

  return (
    <div className="screen cases">
      <div className="page-head">
        <div>
          <span className="eyebrow">Библиотека</span>
          <h1>Пять приёмов</h1>
        </div>
        <Badge tone="neutral">{availableCount} из 5 открыто</Badge>
      </div>
      <p className="page-lead">
        Кейсы открываются по прогрессии: сначала дислалия, затем дизартрия, потом ОНР, ФФНР и
        заикание. Внутри — не «угадай диагноз», а полный маршрут приёма. Незнакомые сокращения —
        в Словаре (кнопка с книгой в шапке).
      </p>

      <div className="case-list">
        {CASES.map((item, index) => {
          const caseProgress = getCaseProgress(progress, item.caseId)
          const unlocked = item.caseId === 'dislalia-01' || (item.caseId === 'dysarthria-02' && dislaliaPassed)
          const isFeatured = index === 0
          const status = !unlocked
            ? item.caseId === 'dysarthria-02'
              ? 'после зачёта'
              : 'в разработке'
            : caseProgress.examPassed
              ? 'зачёт пройден'
              : caseProgress.tutorialCompleted
                ? 'обучение пройдено'
                : 'доступен'

          return (
            <Card
              key={item.caseId}
              className={`case-card ${isFeatured && unlocked ? 'case-card--featured' : ''} ${!unlocked ? 'case-card--locked' : ''}`}
            >
              <div className="case-card__top">
                <div className={`avatar avatar--small ${!unlocked ? 'avatar--muted' : ''}`} aria-hidden="true">
                  {item.name.slice(0, 1)}
                </div>
                <div className="case-card__title">
                  <div className="case-card__name">
                    {item.name}, {item.age}
                  </div>
                  <div className="muted">{item.diagnosis}</div>
                </div>
                <Badge tone={!unlocked ? 'neutral' : caseProgress.examPassed ? 'success' : 'info'}>
                  {!unlocked && <Icon name="lock" size={12} />}
                  {status}
                </Badge>
              </div>
              <div className="case-card__meta">
                <span>{item.icd}</span>
                <span>{item.difficulty}</span>
              </div>
              <p className="case-card__desc">{item.description}</p>

              {unlocked ? (
                <div className="case-card__actions">
                  <Button
                    onClick={() =>
                      onStart(caseProgress.tutorialCompleted ? 'exam' : 'tutorial', item.caseId)
                    }
                    full
                  >
                    {caseProgress.tutorialCompleted
                      ? caseProgress.examPassed
                        ? 'Пройти зачёт ещё раз'
                        : 'Пройти зачёт'
                      : 'Начать обучение'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => onStart('tutorial', item.caseId)}
                    disabled={!caseProgress.tutorialCompleted}
                    full
                  >
                    {caseProgress.tutorialCompleted ? 'Повторить обучение' : 'Зачёт после обучения'}
                  </Button>
                </div>
              ) : (
                <p className="case-card__hint">{item.reason}</p>
              )}
            </Card>
          )
        })}
      </div>

      <Card tone="soft" className="note">
        <strong>Почему не все сразу</strong>
        <p>
          Библиотека расширяется после пилота: сейчас важно отладить два первых приёма и обучение,
          а не добавить пять кнопок. Следующий кейс — ОНР III уровня.
        </p>
      </Card>
    </div>
  )
}
