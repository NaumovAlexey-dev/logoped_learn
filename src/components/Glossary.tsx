import { useMemo, useState } from 'react'
import { glossary } from '../data/glossary'
import { Badge } from './ui'

export function Glossary() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Все')

  const categories = useMemo(
    () => ['Все', ...Array.from(new Set(glossary.map((entry) => entry.category)))],
    [],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('ru')
    return glossary.filter((entry) => {
      const inCategory = category === 'Все' || entry.category === category
      if (!inCategory) return false
      if (!q) return true
      return [entry.abbr, entry.term, entry.definition, entry.note]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('ru')
        .includes(q)
    })
  }, [query, category])

  return (
    <div className="glossary">
      <div className="glossary-search">
        <span className="glossary-search__icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Найти термин или сокращение"
          aria-label="Поиск по словарю терминов"
        />
      </div>

      <div className="filter-row" aria-label="Категории словаря">
        {categories.map((item) => (
          <button
            key={item}
            className={`filter-chip ${category === item ? 'is-active' : ''}`}
            onClick={() => setCategory(item)}
            aria-pressed={category === item}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="glossary-count">
        {filtered.length} {filtered.length === 1 ? 'термин' : 'терминов'}
      </div>

      {filtered.length === 0 ? (
        <div className="glossary-empty">
          <strong>Ничего не найдено</strong>
          <p>Попробуй другое слово: например, «ОНР», «МКБ» или «дизартрия».</p>
        </div>
      ) : (
        <div className="glossary-list">
          {filtered.map((entry) => (
            <div className="glossary-card" key={entry.id}>
              <div className="glossary-card__top">
                {entry.abbr && <span className="glossary-abbr">{entry.abbr}</span>}
                <Badge tone="neutral">{entry.category}</Badge>
              </div>
              <strong>{entry.term}</strong>
              <p>{entry.definition}</p>
              {entry.note && <em>{entry.note}</em>}
            </div>
          ))}
        </div>
      )}

      <p className="glossary-hint">
        Словарь расшифровывает сокращения и термины, которые встречаются в кейсах. Если увидел
        незнакомое — вернись сюда.
      </p>
    </div>
  )
}
