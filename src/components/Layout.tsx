import type { ReactNode } from 'react'
import type { Screen } from '../types'
import { Icon } from './Icon'
import { useGlossary } from './GlossaryProvider'

const navItems: { id: Screen; label: string; icon: 'home' | 'cases' | 'book' | 'progress' | 'info' }[] = [
  { id: 'home', label: 'Приём', icon: 'home' },
  { id: 'cases', label: 'Кейсы', icon: 'cases' },
  { id: 'theory', label: 'Теория', icon: 'book' },
  { id: 'progress', label: 'Прогресс', icon: 'progress' },
  { id: 'about', label: 'О игре', icon: 'info' },
]

export function Layout({
  screen,
  onNavigate,
  children,
  hideNav = false,
  hideTopbar = false,
}: {
  screen: Screen
  onNavigate: (screen: Screen) => void
  children: ReactNode
  hideNav?: boolean
  hideTopbar?: boolean
}) {
  const { open: openGlossary } = useGlossary()

  return (
    <div className="app">
      {!hideTopbar && (
        <header className="topbar">
          <button className="brand" onClick={() => onNavigate('home')} aria-label="На главную">
            <span className="brand__mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="brand__text">
              <strong>ПРИЁМ</strong>
              <small>симулятор логопеда</small>
            </span>
          </button>
          <nav className="desktop-nav" aria-label="Разделы">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`desktop-nav__item ${screen === item.id ? 'is-active' : ''}`}
                onClick={() => onNavigate(item.id)}
                aria-current={screen === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <button className="topbar__glossary" onClick={openGlossary} aria-label="Словарь терминов">
            <Icon name="book" size={17} />
            <span>Словарь</span>
          </button>
          <span className="topbar__tag">4–7 лет</span>
        </header>
      )}

      <main className="main">{children}</main>

      {!hideNav && (
        <nav className="bottom-nav" aria-label="Основная навигация">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${screen === item.id ? 'is-active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-current={screen === item.id ? 'page' : undefined}
            >
              <Icon name={item.icon} size={21} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
