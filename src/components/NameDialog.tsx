import { useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import { displayTitle } from '../lib/bookmarks'
import type { BmNode } from '../types'

export type DialogState =
  | { kind: 'folder' }
  | { kind: 'bookmark' }
  | { kind: 'rename'; node: BmNode }

export interface DialogValues {
  title: string
  url: string
}

interface Props {
  state: DialogState | null
  onClose: () => void
  onSubmit: (values: DialogValues) => void
}

function heading(s: DialogState) {
  if (s.kind === 'folder') return 'New folder'
  if (s.kind === 'bookmark') return 'Add bookmark'
  return s.node.url ? 'Edit bookmark' : 'Rename folder'
}

/** Native <dialog>: focus trap, Esc to close and a backdrop come for free. */
export function NameDialog({ state, onClose, onSubmit }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (state && !d.open) d.showModal()
    else if (!state && d.open) d.close()
  }, [state])

  const showUrl = state?.kind === 'bookmark' || (state?.kind === 'rename' && !!state.node.url)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    onSubmit({ title: String(fd.get('title') ?? '').trim(), url: String(fd.get('url') ?? '').trim() })
  }

  return (
    <dialog ref={ref} className="dialog" onClose={onClose} onClick={(e) => e.target === e.currentTarget && onClose()}>
      {state ? (
        <form key={state.kind === 'rename' ? state.node.id : state.kind} onSubmit={submit} className="dialog__form">
          <h2 className="dialog__title">{heading(state)}</h2>
          <label className="dialog__field">
            <span>{state.kind === 'folder' || (state.kind === 'rename' && !state.node.url) ? 'Folder name' : 'Title'}</span>
            <input
              name="title"
              required={state.kind === 'folder' || state.kind === 'rename'}
              autoFocus
              defaultValue={state.kind === 'rename' ? displayTitle(state.node) : ''}
              placeholder={state.kind === 'bookmark' ? 'Optional. Defaults to the site name' : ''}
            />
          </label>
          {showUrl ? (
            <label className="dialog__field">
              <span>Address</span>
              <input
                name="url"
                type="url"
                required
                placeholder="https://example.com"
                defaultValue={state.kind === 'rename' ? state.node.url : ''}
              />
            </label>
          ) : null}
          <div className="dialog__actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {state.kind === 'rename' ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      ) : null}
    </dialog>
  )
}
