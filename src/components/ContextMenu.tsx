import { useEffect, useLayoutEffect, useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'

export interface MenuItem {
  label: string
  icon: ReactNode
  onSelect: () => void
  danger?: boolean
  disabled?: boolean
}
export type MenuEntry = MenuItem | 'divider'

interface Props {
  x: number
  y: number
  title: string
  kind: string
  entries: MenuEntry[]
  onClose: () => void
}

export function ContextMenu({ x, y, title, kind, entries, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Keep the menu inside the viewport, and focus the first action for keyboard users.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const { offsetWidth: w, offsetHeight: h } = el
    el.style.left = `${Math.max(8, Math.min(x, window.innerWidth - w - 8))}px`
    el.style.top = `${Math.max(8, Math.min(y, window.innerHeight - h - 8))}px`
    el.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
  }, [x, y])

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    window.addEventListener('blur', onClose)
    window.addEventListener('resize', onClose, { passive: true })
    window.addEventListener('scroll', onClose, { passive: true, capture: true })
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('blur', onClose)
      window.removeEventListener('resize', onClose)
      window.removeEventListener('scroll', onClose, { capture: true })
    }
  }, [onClose])

  const onArrowKeys = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const buttons = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const next = e.key === 'ArrowDown' ? at + 1 : at - 1
    buttons[(next + buttons.length) % buttons.length]?.focus()
  }

  return (
    <div ref={ref} className="menu" role="menu" aria-label={title} style={{ left: x, top: y }} onKeyDown={onArrowKeys} onContextMenu={(e) => e.preventDefault()}>
      <div className="menu__head">
        <span className="menu__title">{title}</span>
        <span className="menu__kind">{kind}</span>
      </div>
      {entries.map((entry, i) =>
        entry === 'divider' ? (
          <div key={i} className="menu__divider" role="separator" />
        ) : (
          <button
            key={i}
            type="button"
            role="menuitem"
            className="menu__item"
            data-danger={entry.danger ? '' : undefined}
            disabled={entry.disabled}
            onClick={() => {
              onClose()
              entry.onSelect()
            }}
          >
            {entry.icon}
            {entry.label}
          </button>
        )
      )}
    </div>
  )
}
