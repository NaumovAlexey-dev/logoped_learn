import type { CaseData, TutorialResult } from '../types'
import { Badge, Button, Card, ProgressBar } from '../components/ui'
import { Icon } from '../components/Icon'

const TOPICS = [
  { title: 'Гипотеза', lessons: ['M1'], note: 'Чтение карточки и первый круг гипотез' },
  { title: 'Анамнез', lessons: ['M2', 'M3'], note: 'Критические вопросы и шум' },
  { title: 'Звуки', lessons: ['M4'], note: 'Искажение, замена, пропуск' },
  { title: 'Фонематика и грамматика', lessons: ['M5', 'M7'], note: 'Что сохранено, что нарушено' },
  { title: 'Артикуляция', lessons: ['M6'], note: 'Микрознаки дизартрии' },
  { title: 'Заключение', lessons: ['M8', 'M9'], note: 'Формула и аргументы' },
]

export function Debrief({
  result,
  data,
  onTutorial,
  onExam,
  onHome,
  onCases,
}: {
  result: TutorialResult
  data: CaseData
  onTutorial: () => void
  onExam: () => void
  onHome: () => void
  onCases: () => void
}) {
  const isExam = result.mode === 'exam'
  const score = Math.round((result.firstTryChecks / result.totalChecks) * 100)
  const passed = score >= 75
  const minutes = Math.max(1, Math.round(result.durationSec / 60))
  const uniqueErrors = Array.from(new Set(result.errors))
  const accuracy = Math.round((result.firstTryChecks / result.totalChecks) * 100)
  const confidence = result.confidence ?? 60
  const gap = confidence - accuracy
  const calibrationLabel = Math.abs(gap) <= 25 ? 'Калибровка в норме' : gap > 0 ? 'Переоценка' : 'Недооценка'
  const calibrationMessage =
    Math.abs(gap) <= 25
      ? 'Ты примерно понимаешь, где твёрд, а где сомневаешься. Это рабочая калибровка.'
      : gap > 0
        ? 'Уверенность выше точности. Проверяй альтернативу и аргументы «против», а не только «за».'
        : 'Ты знаешь больше, чем думаешь. Опирайся на пробы и фиксируй их в карте.'

  const conclusionStep = result.stepResults.find((step) => step.step === 5)
  const diagnosisScore = isExam ? (passed ? 35 : 0) : conclusionStep?.firstTry ? 35 : 30
  const completenessScore = Math.round((result.firstTryChecks / result.totalChecks) * 30)
  const justificationScore = conclusionStep
    ? conclusionStep.firstTry
      ? 25
      : 18
    : Math.round((result.firstTryChecks / result.totalChecks) * 25)
  const efficiencyScore = Math.max(0, 10 - uniqueErrors.length * 2)
  const rubricTotal = diagnosisScore + completenessScore + justificationScore + efficiencyScore

  return (
    <div className="screen debrief">
      <section className={`debrief-hero ${isExam ? (passed ? 'is-pass' : 'is-fail') : ''}`}>
        <div className="debrief-hero__badge">
          {isExam ? (
            <Badge tone={passed ? 'success' : 'warning'}>{passed ? 'Зачёт пройден' : 'Зачёт не пройден'}</Badge>
          ) : (
            <Badge tone="info">Обучение завершено</Badge>
          )}
        </div>
        <div className="debrief-score">
          <strong>{isExam ? score : result.firstTryChecks}</strong>
          <span>{isExam ? '/ 100' : `/ ${result.totalChecks}`}</span>
        </div>
        <h1>
          {isExam
            ? passed
              ? `Кейс «${data.name}» закрыт`
              : 'Пока не хватает точности'
            : `Кейс «${data.name}» разобран`}
        </h1>
        <p>
          {isExam
            ? passed
              ? 'Ты собрал заключение без наставника. Следующий кейс откроется в библиотеке.'
              : 'Порог зачёта — 75. Вернись к обучению или повтори шаги, где были ошибки.'
            : 'Ты прошёл алгоритм с наставником. Теперь тот же кейс можно пройти без подсказок.'}
        </p>
        <div className="debrief-meta">
          <span><Icon name="clock" size={16} /> {minutes} мин</span>
          <span><Icon name="spark" size={16} /> {result.firstTryChecks} с первой попытки</span>
          <span><Icon name="book" size={16} /> {uniqueErrors.length} разбор(а)</span>
        </div>
      </section>

      <Card className="score-card">
        <div className="score-card__head">
          <div>
            <h2>Профиль приёма</h2>
            <p className="muted">Не оценка личности, а карта того, что уже получается.</p>
          </div>
          <span className="score-ring" style={{ ['--score' as string]: `${isExam ? score : (result.firstTryChecks / result.totalChecks) * 100}%` }}>
            <strong>{isExam ? score : result.firstTryChecks}</strong>
            <span>{isExam ? 'из 100' : `из ${result.totalChecks}`}</span>
          </span>
        </div>
        <ProgressBar
          value={isExam ? score : (result.firstTryChecks / result.totalChecks) * 100}
          label={isExam ? 'Итог зачёта' : 'Шаги с первой попытки'}
        />
      </Card>

      <Card className="calibration-card">
        <div className="calibration-card__head">
          <div>
            <Badge tone={Math.abs(gap) <= 25 ? 'success' : 'warning'}>{calibrationLabel}</Badge>
            <h2>
              {confidence}% уверенности · {accuracy}% точности
            </h2>
          </div>
          <span className="calibration-gap">
            {gap > 0 ? '+' : ''}
            {gap}%
          </span>
        </div>
        <div className="calibration-row">
          <span>Уверенность</span>
          <div className="calibration-track">
            <i style={{ width: `${confidence}%` }} />
          </div>
          <strong>{confidence}%</strong>
        </div>
        <div className="calibration-row">
          <span>Точность</span>
          <div className="calibration-track calibration-track--accuracy">
            <i style={{ width: `${accuracy}%` }} />
          </div>
          <strong>{accuracy}%</strong>
        </div>
        <p>{calibrationMessage}</p>
      </Card>

      <section className="section">
        <div className="section__head">
          <h2>Рубрика</h2>
          <span className="section__hint">профиль по критериям</span>
        </div>
        <Card className="rubric-card">
          <RubricRow label="Точность заключения" value={diagnosisScore} max={35} />
          <RubricRow label="Полнота обследования" value={completenessScore} max={30} />
          <RubricRow label="Корректность обоснования" value={justificationScore} max={25} />
          <RubricRow label="Эффективность" value={efficiencyScore} max={10} />
          <div className="rubric-total">
            <strong>{rubricTotal}</strong>
            <span>из 100</span>
          </div>
          <p className="rubric-note">
            Это профиль по данным прототипа. Итоговый балл зачёта считается отдельно — по первому
            прохождению и порогу 75.
          </p>
        </Card>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Карта симптомов</h2>
          <span className="section__hint">что зафиксировано</span>
        </div>
        <Card className="symptom-map">
          {data.symptomSummary.map((item) => (
            <div className="symptom-row" key={item.label}>
              <span className={`symptom-dot is-${item.status}`} aria-hidden="true" />
              <div className="symptom-row__text">
                <span>{item.block}</span>
                <strong>{item.label}</strong>
                <em>{item.note}</em>
              </div>
              <Badge tone={item.status === 'confirmed' ? 'success' : item.status === 'preserved' ? 'info' : 'neutral'}>
                {item.status === 'confirmed' ? 'подтверждено' : item.status === 'preserved' ? 'сохранено' : 'исключено'}
              </Badge>
            </div>
          ))}
        </Card>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Карта обучения</h2>
          <span className="section__hint">что уже освоено</span>
        </div>
        <div className="topic-list">
          {TOPICS.map((topic) => {
            const hadLesson = topic.lessons.some((id) => uniqueErrors.includes(id))
            return (
              <div className="topic" key={topic.title}>
                <span className={`topic__dot ${hadLesson ? 'is-warn' : 'is-ok'}`}>
                  <Icon name={hadLesson ? 'book' : 'check'} size={15} />
                </span>
                <div className="topic__text">
                  <strong>{topic.title}</strong>
                  <span>{topic.note}</span>
                </div>
                <Badge tone={hadLesson ? 'warning' : 'success'}>
                  {hadLesson ? 'был разбор' : 'с первой попытки'}
                </Badge>
              </div>
            )
          })}
        </div>
      </section>

      {uniqueErrors.length > 0 && (
        <Card tone="soft" className="note">
          <strong>Что повторить</strong>
          <p>
            Разборы сработали: {uniqueErrors.join(', ')}. Это не штраф, а список тем, к которым стоит
            вернуться перед зачётом.
          </p>
        </Card>
      )}

      <Card className="sources-card">
        <div className="card-title-row">
          <h2>Источники</h2>
          <Icon name="book" size={20} />
        </div>
        <ul className="source-list">
          {data.sources.map((source) => (
            <li key={source}>{source}</li>
          ))}
        </ul>
      </Card>

      <div className="debrief-actions">
        {!isExam ? (
          <>
            <Button onClick={onExam} full>
              Пройти зачёт <Icon name="arrow" size={18} />
            </Button>
            <Button variant="secondary" onClick={onCases} full>
              В библиотеку кейсов
            </Button>
          </>
        ) : passed ? (
          <>
            <Button onClick={onCases} full>
              Открыть библиотеку <Icon name="arrow" size={18} />
            </Button>
            <Button variant="secondary" onClick={onHome} full>
              На главную
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onTutorial} full>
              Вернуться к обучению
            </Button>
            <Button variant="secondary" onClick={onHome} full>
              На главную
            </Button>
          </>
        )}
      </div>

      <p className="fineprint">
        Это учебное заключение. Оно не заменяет клиническую диагностику и супервизию.
      </p>
    </div>
  )
}


function RubricRow({ label, value, max }: { label: string; value: number; max: number }) {
  const percent = Math.round((value / max) * 100)
  return (
    <div className="rubric-row">
      <div className="rubric-row__head">
        <span>{label}</span>
        <strong>
          {value} / {max}
        </strong>
      </div>
      <div className="rubric-row__track">
        <i style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
