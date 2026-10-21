import type { SkillId, SkillProgress } from '../types'
import {
  SKILLS,
  displayedMastery,
  masteryTone,
  weakestSkills,
} from '../lib/skills'

export function SkillMap({
  skills,
  compact = false,
}: {
  skills: Record<SkillId, SkillProgress>
  compact?: boolean
}) {
  const entries = compact
    ? weakestSkills(skills, 4)
    : SKILLS.map((definition) => ({
        id: definition.id,
        skill: skills[definition.id] ?? { mastery: 50, attempts: 0, correct: 0, lastPracticed: null },
      }))

  if (compact && entries.length === 0) {
    return (
      <p className="skill-map__empty">
        Пока нет данных. Пройди первый приём — карта навыков появится здесь.
      </p>
    )
  }

  return (
    <div className={`skill-map ${compact ? 'skill-map--compact' : ''}`}>
      {entries.map(({ id, skill }) => {
        const definition = SKILLS.find((item) => item.id === id)
        if (!definition) return null
        const value = displayedMastery(skill)
        const started = skill.attempts > 0
        return (
          <div className="skill-row" key={id}>
            <div className="skill-row__head">
              <strong>{compact ? definition.short : definition.label}</strong>
              <span>{started ? `${value}%` : 'не начато'}</span>
            </div>
            <div
              className="skill-row__track"
              role="progressbar"
              aria-label={definition.label}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={started ? value : 0}
            >
              <span
                className={`skill-row__fill is-${started ? masteryTone(skill) : 'neutral'}`}
                style={{ width: `${started ? value : 0}%` }}
              />
            </div>
            {!compact && <p>{definition.description}</p>}
          </div>
        )
      })}
    </div>
  )
}
