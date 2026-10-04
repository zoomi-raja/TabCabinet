import { Fragment } from 'react'
import type { RefObject } from 'react'
import { ArrowLeft, ArrowRight, ArrowUp, ChevronRight, House, PanelLeftClose, PanelLeftOpen, Search, X } from 'lucide-react'
import { displayTitle } from '../lib/bookmarks'
import type { BmNode, FilterMode } from '../types'

interface Props {
  trail: BmNode[]
  canBack: boolean
  canForward: boolean
  canUp: boolean
  sidebarOpen: boolean
  query: string
  filter: FilterMode
  searchRef: RefObject<HTMLInputElement | null>
  onBack: () => void
  onForward: () => void
  onUp: () => void
  onNavigate: (id: string) => void
  onToggleSidebar: () => void
  onQuery: (q: string) => void
  onFilter: (f: FilterMode) => void
}

export function AddressBar(p: Props) {
  return (
    <div className="addressbar">
      <div className="navgroup">
        <button type="button" className="btn btn--icon" onClick={p.onToggleSidebar} aria-pressed={p.sidebarOpen} aria-label="Toggle sidebar" title="Toggle sidebar">
          {p.sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>
        <button type="button" className="btn btn--icon" disabled={!p.canBack} onClick={p.onBack} aria-label="Back" title="Back">
          <ArrowLeft size={16} />
        </button>
        <button type="button" className="btn btn--icon" disabled={!p.canForward} onClick={p.onForward} aria-label="Forward" title="Forward">
          <ArrowRight size={16} />
        </button>
        <button type="button" className="btn btn--icon" disabled={!p.canUp} onClick={p.onUp} aria-label="Up one level" title="Up one level">
          <ArrowUp size={16} />
        </button>
      </div>

      <nav className="crumbs" aria-label="Breadcrumb">
        {p.trail.map((n, i) => (
          <Fragment key={n.id}>
            {i > 0 ? <ChevronRight size={12} className="crumbs__sep" /> : null}
            <button
              type="button"
              className="crumb"
              aria-current={i === p.trail.length - 1 ? 'page' : undefined}
              onClick={() => p.onNavigate(n.id)}
            >
              {i === 0 ? <House size={13} /> : null}
              {displayTitle(n)}
            </button>
          </Fragment>
        ))}
      </nav>

      <label className="select">
        <span className="select__label">Show</span>
        <select value={p.filter} onChange={(e) => p.onFilter(e.target.value as FilterMode)}>
          <option value="all">Everything</option>
          <option value="folders">Folders</option>
          <option value="bookmarks">Bookmarks</option>
        </select>
      </label>

      <div className="search">
        <Search size={14} className="search__icon" />
        <input
          ref={p.searchRef}
          type="search"
          value={p.query}
          placeholder="Search the whole cabinet   /"
          aria-label="Search bookmarks"
          onChange={(e) => p.onQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              p.onQuery('')
              e.currentTarget.blur()
            }
          }}
        />
        {p.query ? (
          <button type="button" className="search__clear" aria-label="Clear search" onClick={() => p.onQuery('')}>
            <X size={14} />
          </button>
        ) : null}
      </div>
    </div>
  )
}
