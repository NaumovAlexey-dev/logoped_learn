import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { Modal } from './ui'
import { Glossary } from './Glossary'

type GlossaryContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
}

const GlossaryContext = createContext<GlossaryContextValue | null>(null)

export function GlossaryProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const value = useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [isOpen],
  )

  return (
    <GlossaryContext.Provider value={value}>
      {children}
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Словарь терминов"
        wide
      >
        <Glossary />
      </Modal>
    </GlossaryContext.Provider>
  )
}

export function useGlossary() {
  const context = useContext(GlossaryContext)
  if (!context) {
    throw new Error('useGlossary must be used inside GlossaryProvider')
  }
  return context
}
