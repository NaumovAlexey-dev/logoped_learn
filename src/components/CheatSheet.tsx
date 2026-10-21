import { Icon } from './Icon'

const BLOCKS = [
  {
    n: '1',
    title: 'Звукопроизношение',
    probes: 'Изолированно → слог → слово → фраза → спонтанно',
    key: 'Искажение, замена, пропуск или норма',
  },
  {
    n: '2',
    title: 'Фонематический слух',
    probes: 'Пары квазиомонимов, звуковой анализ',
    key: 'Различает ли оппозиции; сохранна ли фонематика',
  },
  {
    n: '3',
    title: 'Слоговая структура',
    probes: 'Слова 2–5 слогов, стечения согласных',
    key: 'Элизия, перестановка, упрощение',
  },
  {
    n: '4',
    title: 'Лексика и грамматика',
    probes: 'Обобщения, антонимы, падежи, предлоги, словообразование',
    key: 'Системное или изолированное нарушение',
  },
  {
    n: '5',
    title: 'Связная речь',
    probes: 'Пересказ, рассказ по серии картинок',
    key: 'Последовательность, полнота, связность',
  },
  {
    n: '6',
    title: 'Артикуляция и просодика',
    probes: 'Позы, переключаемость, тремор, синкинезии, голос, темп',
    key: 'Неврологические микрознаки и истощаемость',
  },
]

const CRITICAL = [
  'Слух',
  'Раннее речевое развитие',
  'Неврология и регресс',
  'Понимание речи',
  'Речевая среда',
  'История помощи',
]

const FORMULA = [
  'Механизм: дислалия / дизартрия / ОНР / ФФНР / заикание',
  'Форма: функциональная / механическая / стёртая',
  'Уровень: ФНР / ФФНР / ОНР I–IV',
  'Рубрика: МКБ-10 и МКБ-11',
]

export function CheatSheet() {
  return (
    <div className="cheatsheet">
      <div className="cheatsheet__intro">
        <span className="cheatsheet__icon"><Icon name="book" size={20} /></span>
        <div>
          <h3>Шпаргалка на приём</h3>
          <p>Не заменяет мышление, но держит рамку: что проверить и что не забыть.</p>
        </div>
      </div>

      <section className="cheatsheet__section">
        <h4>6 блоков обследования</h4>
        <div className="cheatsheet__blocks">
          {BLOCKS.map((block) => (
            <div className="cheatsheet__block" key={block.n}>
              <span className="cheatsheet__num">{block.n}</span>
              <div>
                <strong>{block.title}</strong>
                <span>{block.probes}</span>
                <em>{block.key}</em>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cheatsheet__section">
        <h4>Критические вопросы</h4>
        <div className="cheatsheet__chips">
          {CRITICAL.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <p className="cheatsheet__note">
          Пропуск любого из них — риск: заключение нельзя считать проверенным.
        </p>
      </section>

      <section className="cheatsheet__section">
        <h4>Формула заключения</h4>
        <ol className="cheatsheet__formula">
          {FORMULA.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <p className="cheatsheet__note">
          Плюс 2 аргумента «за» и 1 «против» альтернативы — со ссылкой на пробу, а не на название диагноза.
        </p>
      </section>

      <section className="cheatsheet__section cheatsheet__section--warn">
        <h4>Красные флаги</h4>
        <ul className="cheatsheet__list">
          <li>Регресс речи или навыков</li>
          <li>Судороги, потери сознания, травма головы</li>
          <li>Снижение слуха, частые отиты</li>
          <li>Дисфагия, поперхивание</li>
          <li>Подозрение на РАС или насилие</li>
        </ul>
        <p className="cheatsheet__note">Это не диагноз в игре, а повод направить к врачу.</p>
      </section>
    </div>
  )
}
