import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export function Button({
  children,
  variant = 'primary',
  full = false,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  full?: boolean
}) {
  return (
    <button
      className={`btn btn--${variant} ${full ? 'btn--full' : ''} ${className}`}
      type={props.type ?? 'button'}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({
  children,
  className = '',
  tone = 'default',
}: {
  children: ReactNode
  className?: string
  tone?: 'default' | 'soft' | 'accent'
}) {
  return <div className={`card card--${tone} ${className}`}>{children}</div>
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'info' | 'danger'
}) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const safe = Math.max(0, Math.min(100, value))
  return (
    <div className="progress">
      {label && <div className="progress__label">{label}</div>}
      <div
        className="progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(safe)}
        aria-label={label ?? 'Прогресс'}
      >
        <div className="progress__fill" style={{ width: `${safe}%` }} />
      </div>
    </div>
  )
}

export function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="step-dots" aria-label={`Шаг ${current + 1} из ${total}`}>
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={`step-dot ${index < current ? 'is-done' : ''} ${index === current ? 'is-current' : ''}`}
        />
      ))}
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className={`modal ${wide ? 'modal--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal__head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть">
            <Icon name="close" size={22} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export function ChoiceCard({
  selected,
  onClick,
  title,
  caption,
  icon,
  disabled = false,
  tone = 'default',
}: {
  selected: boolean
  onClick: () => void
  title: string
  caption?: string
  icon?: ReactNode
  disabled?: boolean
  tone?: 'default' | 'correct' | 'wrong'
}) {
  return (
    <button
      type="button"
      className={`choice ${selected ? 'is-selected' : ''} ${tone === 'correct' ? 'is-correct' : ''} ${tone === 'wrong' ? 'is-wrong' : ''}`}
      onClick={onClick}
      aria-pressed={selected}
      disabled={disabled}
    >
      {icon && <span className="choice__icon">{icon}</span>}
      <span className="choice__text">
        <strong>{title}</strong>
        {caption && <span>{caption}</span>}
      </span>
      <span className={`choice__mark ${selected ? 'is-on' : ''}`} aria-hidden="true">
        {selected ? <Icon name="check" size={14} /> : null}
      </span>
    </button>
  )
}
