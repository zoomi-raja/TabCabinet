import {
  Archive,
  BookmarkPlus,
  Command,
  Droplets,
  FolderPlus,
  LayoutGrid,
  List,
  Moon,
  Rows3,
  Sun,
  TrendingUp,
} from 'lucide-react';
import type { SortMode, Theme, ViewMode } from '../types';
import { GithubMark } from './GithubMark';
import { SortMenu } from './SortMenu';
import { THEMES } from '../lib/theme';

const VIEWS = [
  { id: 'grid', label: 'Large icons', Icon: LayoutGrid },
  { id: 'tiles', label: 'Tiles', Icon: Rows3 },
  { id: 'list', label: 'Details', Icon: List },
] as const;

const THEME_META = {
  light: { label: 'Light', Icon: Sun },
  dark: { label: 'Dark', Icon: Moon },
  fluent: { label: 'Fluent blue', Icon: Droplets },
  mac: { label: 'Mac', Icon: Command },
} as const satisfies Record<Theme, { label: string; Icon: unknown }>;

const nextTheme = (t: Theme) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length];

function ThemeIcon({ theme }: { theme: Theme }) {
  const { Icon } = THEME_META[theme];
  return <Icon size={17} />;
}

interface Props {
  canCreate: boolean;
  view: ViewMode;
  sort: SortMode;
  theme: Theme;
  trendingOpen: boolean;
  onView: (v: ViewMode) => void;
  onSort: (s: SortMode) => void;
  onToggleTheme: () => void;
  onToggleTrending: () => void;
  onNewFolder: () => void;
  onNewBookmark: () => void;
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
  // The Mac theme has no Large icons option
  const views = theme === 'mac' ? VIEWS.filter((v) => v.id !== 'grid') : VIEWS;
  const hint = canCreate
    ? undefined
    : 'Open a folder first. Home only lists your top-level folders.';
  const nextLabel = THEME_META[nextTheme(theme)].label;
  return (
    <div className="cmdbar">
      <div className="brand">
        <span className="brand__mark">
          <Archive size={17} strokeWidth={2.2} />
        </span>
        TabCabinet
      </div>

      <button
        type="button"
        className="btn btn--primary"
        disabled={!canCreate}
        title={hint}
        onClick={onNewFolder}
      >
        <FolderPlus size={16} /> New folder
      </button>
      <button
        type="button"
        className="btn"
        disabled={!canCreate}
        title={hint}
        onClick={onNewBookmark}
      >
        <BookmarkPlus size={16} /> Add bookmark
      </button>

      <SortMenu value={sort} onChange={onSort} />

      <span className="spacer" />

      <div className="segmented" role="group" aria-label="View mode">
        {views.map(({ id, label, Icon }) => (
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
        aria-label={`Theme: ${THEME_META[theme].label}. Switch to ${nextLabel}`}
        title={`Theme: ${THEME_META[theme].label} (click for ${nextLabel})`}
      >
        <ThemeIcon theme={theme} />
      </button>
      <a
        className="btn btn--icon"
        href="https://github.com/trending"
        target="_blank"
        rel="noreferrer"
        aria-label="Open GitHub trending"
        title="github.com/trending"
      >
        <GithubMark style={{ fontSize: 17 }} />
      </a>
    </div>
  );
}
