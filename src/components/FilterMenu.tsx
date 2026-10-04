import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Folder, Globe, Layers } from 'lucide-react';
import type { FilterMode } from '../types';
import styles from './FilterMenu.module.css';

const OPTIONS = [
  { id: 'all', label: 'All items', short: 'All', Icon: Layers },
  { id: 'folders', label: 'Folders', short: 'Folders', Icon: Folder },
  { id: 'bookmarks', label: 'Bookmarks', short: 'Bookmarks', Icon: Globe },
] as const;

interface Props {
  value: FilterMode;
  onChange: (value: FilterMode) => void;
}

export function FilterMenu({ value, onChange }: Props) {
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
        aria-label={`Show: ${current.label}`}
        onClick={() => setOpen((o) => !o)}
      >
        <current.Icon
          size={15}
          className={styles.icon}
          data-kind={current.id}
        />
        <span>{current.short}</span>
        <ChevronDown
          size={13}
          className={styles.chev}
          data-open={open ? '' : undefined}
        />
      </button>

      {open ? (
        <div className={styles.menu} role="listbox" aria-label="Show">
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
              <o.Icon size={15} className={styles.icon} data-kind={o.id} />
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
