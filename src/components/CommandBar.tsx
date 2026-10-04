import { Archive, BookmarkPlus, FolderPlus, LayoutGrid, List, Moon, Rows3, Sun, TrendingUp } from 'lucide-react'
import type { SortMode, Theme, ViewMode } from '../types'
import { GithubMark } from './GithubMark'

const VIEWS = [
  { id: 'grid', label: 'Large icons', Icon: LayoutGrid },
  { id: 'tiles', label: 'Tiles', Icon: Rows3 },
  { id: 'list', label: 'Details', Icon: List },
] as const

interface Props {
  canCreate: boolean
  view: ViewMode
  sort: SortMode
  theme: Theme
  trendingOpen: boolean
  onView: (v: ViewMode) => void
  onSort: (s: SortMode) => void
  onToggleTheme: () => void
  onToggleTrending: () => void
  onNewFolder: () => void
  onNewBookmark: () => void
}

export function CommandBar({
  canCreate,
  view,
  sort,
  theme,
  trendingOpen,
  onView,
  onSort,
  onToggleTheme,
  onToggleTrending,
  onNewFolder,
  onNewBookmark,
}: Props) {
  const hint = canCreate ? undefined : 'Open a folder first. Home only lists your top-level folders.'
  return (
    <div className="cmdbar">
      <div className="brand">
        <span className="brand__mark">
          <Archive size={17} strokeWidth={2.2} />
        </span>
        TabCabinet
      </div>

      <button type="button" className="btn btn--primary" disabled={!canCreate} title={hint} onClick={onNewFolder}>
        <FolderPlus size={16} /> New folder
      </button>
      <button type="button" className="btn" disabled={!canCreate} title={hint} onClick={onNewBookmark}>
        <BookmarkPlus size={16} /> Add bookmark
      </button>

      <label className="select">
        <span className="select__label">Sort</span>
        <select value={sort} onChange={(e) => onSort(e.target.value as SortMode)}>
          <option value="name">Name</option>
          <option value="site">Site</option>
          <option value="date">Date modified</option>
        </select>
      </label>

      <span className="spacer" />

      <div className="segmented" role="group" aria-label="View mode">
        {VIEWS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={view === id}
            aria-label={label}
            title={label}
            onClick={() => onView(id)}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      <button
        type="button"
        className="btn"
        aria-pressed={trendingOpen}
        onClick={onToggleTrending}
        title="Toggle GitHub trending"
      >
        <TrendingUp size={16} /> <span className="hide-sm">Trending</span>
      </button>
      <button
        type="button"
        className="btn btn--icon"
        onClick={onToggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>
      <a className="btn btn--icon" href="https://github.com/trending" target="_blank" rel="noreferrer" aria-label="Open GitHub trending" title="github.com/trending">
        <GithubMark style={{ fontSize: 17 }} />
      </a>
    </div>
  )
}
