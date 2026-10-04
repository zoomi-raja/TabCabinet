import { memo } from 'react';
import {
  BookmarkPlus,
  ChevronDown,
  ExternalLink,
  RotateCw,
  Star,
} from 'lucide-react';
import { useTrending } from '../hooks/useTrending';
import type { TrendingRepo } from '../types';
import { GithubMark } from './GithubMark';

// Hoisted: created once, not on every render.
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572a5',
  Rust: '#dea584',
  Go: '#00add8',
  Zig: '#ec915c',
  'C++': '#f34b7d',
  C: '#8a8a8a',
  Java: '#b07219',
  Swift: '#f05138',
  Kotlin: '#a97bff',
  Ruby: '#a31f1f',
  'C#': '#178600',
  PHP: '#4f5d95',
  HTML: '#e34c26',
  Shell: '#89e051',
  Dart: '#00b4ab',
};
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
      <a
        className="repo__name"
        href={repo.url}
        target="_blank"
        rel="noreferrer"
      >
        {repo.fullName}
        <ExternalLink size={12} />
      </a>
      <p className="repo__desc">
        {repo.description ?? 'No description provided.'}
      </p>
      <footer className="repo__foot">
        <span className="repo__lang">
          <i
            style={{
              background:
                LANGUAGE_COLORS[repo.language ?? ''] ?? 'var(--ink-3)',
            }}
          />
          {repo.language ?? 'Unknown'}
        </span>
        <span className="repo__stars">
          <Star size={12} fill="currentColor" /> {compact.format(repo.stars)}
        </span>
        <button
          type="button"
          className="repo__save"
          onClick={() => onSave(repo)}
          title="Save to the open folder"
        >
          <BookmarkPlus size={14} /> Save
        </button>
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
