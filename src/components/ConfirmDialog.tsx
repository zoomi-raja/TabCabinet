import { useEffect, useRef } from 'react';

export interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
}

interface Props {
  state: ConfirmState | null;
  onClose: () => void;
}

export function ConfirmDialog({ state, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (state && !d.open) d.showModal();
    else if (!state && d.open) d.close();
  }, [state]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {state ? (
        <div className="dialog__form">
          <h2 className="dialog__title">{state.title}</h2>
          <p className="dialog__text">{state.message}</p>
          <div className="dialog__actions">
            {/* Cancel gets focus first, so Enter can't delete by accident */}
            <button type="button" className="btn" autoFocus onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => {
                state.onConfirm();
                onClose();
              }}
            >
              {state.confirmLabel}
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
