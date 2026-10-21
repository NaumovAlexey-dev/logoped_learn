import { useMemo, useState } from 'react'
import { microLessons } from '../data/microLessons'
import { CheatSheet } from '../components/CheatSheet'
import { MicroLessonCard } from '../components/MicroLessonCard'
import { Glossary } from '../components/Glossary'
import { Badge, Modal } from '../components/ui'
import { Icon } from '../components/Icon'

type View = 'cheatsheet' | 'lessons' | 'glossary'

export function Theory() {
  const [view, setView] = useState<View>('cheatsheet')
  const [tag, setTag] = useState('Все')
  const [selected, setSelected] = useState<string | null>(null)

  const lessons = useMemo(
    () => Object.values(microLessons).sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1))),
    [],
  )
  const tags = useMemo(() => ['Все', ...Array.from(new Set(lessons.map((lesson) => lesson.tag)))], [lessons])
  const filtered = tag === 'Все' ? lessons : lessons.filter((lesson) => lesson.tag === tag)
  const active = selected ? microLessons[selected] : null

  return (
    <div className="screen theory">
      <div className="page-head">
        <div>
          <span className="eyebrow">Теория</span>
          <h1>Шпаргалка и разборы</h1>
        </div>
        <Badge tone="info">11 микро-уроков</Badge>
      </div>
      <p className="page-lead">
        Можно открыть до приёма, во время приёма и после. В обучении микро-урок приходит на ошибку,
        здесь — по запросу. Незнакомые сокращения — во вкладке «Словарь».
      </p>

      <div className="theory-tabs" role="tablist" aria-label="Разделы теории">
        <button
          role="tab"
          aria-selected={view === 'cheatsheet'}
          className={view === 'cheatsheet' ? 'is-active' : ''}
          onClick={() => setView('cheatsheet')}
        >
          Шпаргалка
        </button>
        <button
          role="tab"
          aria-selected={view === 'lessons'}
          className={view === 'lessons' ? 'is-active' : ''}
          onClick={() => setView('lessons')}
        >
          Микро-уроки
        </button>
        <button
          role="tab"
          aria-selected={view === 'glossary'}
          className={view === 'glossary' ? 'is-active' : ''}
          onClick={() => setView('glossary')}
        >
          Словарь
        </button>
      </div>

      {view === 'cheatsheet' ? (
        <CheatSheet />
      ) : view === 'glossary' ? (
        <Glossary />
      ) : (
        <>
          <div className="filter-row" aria-label="Фильтр по темам">
            {tags.map((item) => (
              <button
                key={item}
                className={`filter-chip ${tag === item ? 'is-active' : ''}`}
                onClick={() => setTag(item)}
                aria-pressed={tag === item}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="theory-list">
            {filtered.map((lesson) => (
              <button className="theory-card" key={lesson.id} onClick={() => setSelected(lesson.id)}>
                <div className="theory-card__top">
                  <span className="theory-card__id">{lesson.id}</span>
                  <Badge tone="neutral">{lesson.tag}</Badge>
                  <Icon name="arrow" size={17} />
                </div>
                <strong>{lesson.title}</strong>
                <p>{lesson.why}</p>
              </button>
            ))}
          </div>
        </>
      )}

      <Modal
        open={Boolean(active)}
        onClose={() => setSelected(null)}
        title={active ? active.title : 'Микро-урок'}
        wide
      >
        {active && <MicroLessonCard lesson={active} onDone={() => setSelected(null)} />}
      </Modal>
    </div>
  )
}
