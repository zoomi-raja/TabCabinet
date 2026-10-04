import { memo } from 'react';
import { BookmarkPlus, ChevronDown, RotateCw, Star } from 'lucide-react';
import { useTrending } from '../hooks/useTrending';
import type { TrendingRepo } from '../types';
import { GithubMark } from './GithubMark';

// Hoisted: created once, not on every render.
// Hoisted: created once, not on every render. Based on GitHub's language colours,
// with a few very dark ones lightened so they stay visible on the dark themes.
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572a5',
  Rust: '#dea584',
  Go: '#00add8',
  Zig: '#ec915c',
  'C++': '#f34b7d',
  C: '#5c6bc0',
  'C#': '#178600',
  Java: '#b07219',
  Kotlin: '#a97bff',
  Swift: '#f05138',
  'Objective-C': '#438eff',
  Dart: '#00b4ab',
  Ruby: '#d9453d',
  PHP: '#4f5d95',
  Shell: '#89e051',
  PowerShell: '#3a7bd5',
  Lua: '#4a5fd0',
  Perl: '#0298c3',
  R: '#198ce7',
  Julia: '#a270ba',
  Scala: '#c22d40',
  Elixir: '#9b6bb8',
  Haskell: '#8a7bc4',
  Clojure: '#db5855',
  OCaml: '#ef7a08',
  Nix: '#7e7eff',
  HTML: '#e34c26',
  CSS: '#8b5cf6',
  SCSS: '#c6538c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Markdown: '#4a7bd8',
  MDX: '#fcb32c',
  TeX: '#5f9a2a',
  Dockerfile: '#2f9fe0',
  Makefile: '#5fa22a',
  'Jupyter Notebook': '#da5b0b',
  Solidity: '#aa6746',
  Assembly: '#c08a3e',
};

/** Languages not listed above still get their own stable colour (never gray). */
function hashColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h} 65% 55%)`;
}

function languageColor(language: string | null) {
  if (!language) return 'var(--ink-3)'; // only "Unknown" stays gray
  return LANGUAGE_COLORS[language] ?? hashColor(language);
}
const SKELETONS = [0, 1, 2, 3, 4];
const compact = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function RepoCard({
  repo,
  onSave,
}: {
  repo: TrendingRepo;
  onSave: (r: TrendingRepo) => void;
}) {
  return (
    <article className="repo">
      <header className="repo__head">
        <a
          className="repo__name"
          href={repo.url}
          target="_blank"
          rel="noreferrer"
          title={repo.fullName}
        >
          {repo.fullName}
        </a>
        <button
          type="button"
          className="repo__save"
          onClick={() => onSave(repo)}
          title="Save to bookmarks"
          aria-label={`Save ${repo.fullName} to bookmarks`}
        >
          <BookmarkPlus size={15} />
        </button>
      </header>
      <p className="repo__desc">
        {repo.description ?? 'No description provided.'}
      </p>
      <footer className="repo__foot">
        <span className="repo__lang">
          <i style={{ background: languageColor(repo.language) }} />
          {repo.language ?? 'Unknown'}
        </span>
        <span className="repo__stars">
          <Star size={12} fill="currentColor" /> {compact.format(repo.stars)}
        </span>
      </footer>
    </article>
  );
}

/** Mounted only while open, so a collapsed drawer never hits the network. */
function TrendingBody({ onSave }: { onSave: (r: TrendingRepo) => void }) {
  const t = useTrending();
  const firstLoad = t.status === 'loading' && t.repos.length === 0;

  return (
    <div className="drawer__body">
      <div className="drawer__note">
        <span>Most-starred repositories on GitHub.</span>
        {t.status === 'error' ? (
          <span className="drawer__error">{t.error}</span>
        ) : null}
        <button
          type="button"
          className="btn btn--small"
          onClick={t.refresh}
          disabled={t.status === 'loading'}
        >
          <RotateCw
            size={13}
            className={t.status === 'loading' ? 'spin' : undefined}
          />{' '}
          Refresh
        </button>
      </div>
      <div className="repos">
        {firstLoad
          ? SKELETONS.map((i) => (
              <div key={i} className="repo repo--skeleton" aria-hidden="true" />
            ))
          : t.repos.map((r) => (
              <RepoCard key={r.id} repo={r} onSave={onSave} />
            ))}
      </div>
    </div>
  );
}

interface Props {
  open: boolean;
  onToggle: () => void;
  onSave: (r: TrendingRepo) => void;
}

export const TrendingDrawer = memo(function TrendingDrawer({
  open,
  onToggle,
  onSave,
}: Props) {
  return (
    <section className="drawer" aria-label="GitHub trending">
      <button
        type="button"
        className="drawer__head"
        aria-expanded={open}
        onClick={onToggle}
      >
        <GithubMark style={{ fontSize: 18 }} />
        <span className="drawer__title">Trending on GitHub</span>
        <span className="chip">Most stars</span>
        <ChevronDown
          size={16}
          className="drawer__chev"
          data-open={open ? '' : undefined}
        />
      </button>
      {open ? <TrendingBody onSave={onSave} /> : null}
    </section>
  );
});
