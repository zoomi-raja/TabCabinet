import { useEffect, useRef, useState } from 'react';
import { ArrowDownAZ, Check, ChevronDown, Clock, Globe } from 'lucide-react';
import type { SortMode } from '../types';
import styles from './FilterMenu.module.css';

const OPTIONS = [
  { id: 'name', label: 'Name', Icon: ArrowDownAZ },
  { id: 'site', label: 'Site', Icon: Globe },
  { id: 'date', label: 'Date modified', Icon: Clock },
] as const;

interface Props {
  value: SortMode;
  onChange: (value: SortMode) => void;
}

export function SortMenu({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = OPTIONS.find((o) => o.id === value) ?? OPTIONS[0];

  // Close on outside click or Escape, only while open.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.btn}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Sort by: ${current.label}`}
        title={`Sort by: ${current.label}`}
        onClick={() => setOpen((o) => !o)}
      >
        <current.Icon size={15} className={styles.icon} />
        <span>Sort by</span>
        <ChevronDown
          size={13}
          className={styles.chev}
          data-open={open ? '' : undefined}
        />
      </button>

      {open ? (
        <div className={styles.menu} role="listbox" aria-label="Sort by">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              role="option"
              aria-selected={o.id === value}
              className={styles.item}
              onClick={() => {
                onChange(o.id);
                setOpen(false);
              }}
            >
              <o.Icon size={15} className={styles.icon} />
              {o.label}
              {o.id === value ? (
                <Check size={14} className={styles.check} />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
