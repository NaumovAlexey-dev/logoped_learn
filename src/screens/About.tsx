import { Badge, Card } from '../components/ui'
import { APP_VERSION } from '../version'
import { Icon } from '../components/Icon'

export function About() {
  return (
    <div className="screen about">
      <div className="page-head">
        <div>
          <span className="eyebrow">О игре</span>
          <h1>Тренажёр, не диагноз</h1>
        </div>
        <Badge tone="info">v{APP_VERSION}</Badge>
      </div>
      <p className="page-lead">
        «Приём» — учебный симулятор для студентов-дефектологов и начинающих логопедов. Он тренирует
        алгоритм обследования и дифференциальную логику, а не ставит клинический диагноз.
      </p>

      <Card className="about-card">
        <div className="about-card__icon"><Icon name="book" size={22} /></div>
        <h2>На чём основано</h2>
        <p>
          Российская логопедическая школа: клинико-педагогическая классификация (дислалия, дизартрия,
          ринолалия, алалия, заикание) и психолого-педагогическая (ФНР, ФФНР, ОНР по Левиной и
          Филичевой). Международная рамка — МКБ-10/МКБ-11 и практики ASHA.
        </p>
      </Card>

      <Card className="about-card">
        <div className="about-card__icon"><Icon name="shield" size={22} /></div>
        <h2>Чего здесь нет</h2>
        <ul className="check-list">
          <li>Клинического диагноза и назначений.</li>
          <li>Замены супервизии и живой практики.</li>
          <li>Стигматизирующих формулировок и «страшилок».</li>
          <li>Реальных данных детей: все кейсы синтетические.</li>
        </ul>
      </Card>

      <Card className="about-card">
        <div className="about-card__icon"><Icon name="spark" size={22} /></div>
        <h2>Как устроено обучение</h2>
        <p>
          Первый кейс — учебный приём с наставником: 6 шагов, 11 микро-уроков, возврат на тот же
          шаг после ошибки. Затем — зачёт без подсказок. Порог — 75 из 100. Второй кейс закрепляет
          перенос: дислалия → дизартрия.
        </p>
      </Card>

      <Card className="about-card">
        <div className="about-card__icon"><Icon name="heart" size={22} /></div>
        <h2>Этика</h2>
        <p>
          Сначала человек, потом нарушение. Ребёнок — не «объект» и не «диагноз». Ошибка в игре — это
          материал для разбора, а не повод для стыда.
        </p>
      </Card>

      <Card tone="soft" className="about-card about-card--sources">
        <h2>Источники</h2>
        <ul className="source-list">
          <li>Левина Р. Е. Основы теории и практики логопедии.</li>
          <li>Волкова Л. С. (ред.). Логопедия.</li>
          <li>Филичева Т. Б., Чиркина Г. В. Устранение ОНР у детей дошкольного возраста.</li>
          <li>МКБ-10 F80.0; МКБ-11 6A01.0.</li>
        </ul>
      </Card>

      <p className="fineprint">
        «Приём» не является медицинским изделием. Не используйте его для скрининга реальных детей.
      </p>
    </div>
  )
}
