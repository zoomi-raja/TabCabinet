import { memo, useMemo, useState } from 'react';
import { ChevronRight, Folder, House } from 'lucide-react';
import { displayTitle, isFolder } from '../lib/bookmarks';
import type { BmNode } from '../types';
import { GithubMark } from './GithubMark';
import type { MouseEvent } from 'react';

interface BranchProps {
  node: BmNode;
  depth: number;
  trailIds: ReadonlySet<string>;
  currentId: string;
  onNavigate: (id: string) => void;
  onContextMenu: (e: MouseEvent, node: BmNode) => void;
}

function TreeBranch({
  node,
  depth,
  trailIds,
  currentId,
  onNavigate,
  onContextMenu,
}: BranchProps) {
  const folders = (node.children ?? []).filter(isFolder);
  const [open, setOpen] = useState(depth === 0 || trailIds.has(node.id));
  const current = node.id === currentId;

  return (
    <li>
      <div
        className="tree__row"
        data-current={current ? '' : undefined}
        onContextMenu={(e) => onContextMenu(e, node)}
      >
        <button
          type="button"
          className="tree__toggle"
          disabled={folders.length === 0}
          aria-expanded={folders.length ? open : undefined}
          aria-label={
            open
              ? `Collapse ${displayTitle(node)}`
              : `Expand ${displayTitle(node)}`
          }
          onClick={() => setOpen((o) => !o)}
        >
          {folders.length ? (
            <ChevronRight
              size={13}
              className="tree__chev"
              data-open={open ? '' : undefined}
            />
          ) : null}
        </button>
        <button
          type="button"
          className="tree__label"
          aria-current={current ? 'page' : undefined}
          onClick={() => onNavigate(node.id)}
        >
          <Folder size={15} strokeWidth={1.75} />
          <span>{displayTitle(node)}</span>
          <span className="tree__count">{node.children?.length ?? 0}</span>
        </button>
      </div>
      {open && folders.length ? (
        <ul className="tree__children">
          {folders.map((f) => (
            <TreeBranch
              key={f.id}
              node={f}
              depth={depth + 1}
              trailIds={trailIds}
              currentId={currentId}
              onNavigate={onNavigate}
              onContextMenu={onContextMenu}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

interface Props {
  root: BmNode;
  trail: BmNode[];
  currentId: string;
  open: boolean;
  trendingOpen: boolean;
  onNavigate: (id: string) => void;
  onToggleTrending: () => void;
  onContextMenu: (e: MouseEvent, node: BmNode) => void;
}

export const Sidebar = memo(function Sidebar({
  root,
  trail,
  currentId,
  open,
  trendingOpen,
  onNavigate,
  onToggleTrending,
  onContextMenu,
}: Props) {
  const trailIds = useMemo(() => new Set(trail.map((n) => n.id)), [trail]);
  const topFolders = (root.children ?? []).filter(isFolder);

  return (
    <aside className="sidebar" hidden={!open} aria-label="Folders">
      <p className="eyebrow">Cabinet</p>
      <button
        type="button"
        className="tree__home"
        aria-current={currentId === root.id ? 'page' : undefined}
        onClick={() => onNavigate(root.id)}
      >
        <House size={15} strokeWidth={1.75} /> Home
      </button>
      <ul className="tree">
        {topFolders.map((f) => (
          <TreeBranch
            key={f.id}
            node={f}
            depth={0}
            trailIds={trailIds}
            currentId={currentId}
            onNavigate={onNavigate}
            onContextMenu={onContextMenu}
          />
        ))}
      </ul>

      <p className="eyebrow">Discover</p>
      <button
        type="button"
        className="tree__home"
        aria-pressed={trendingOpen}
        onClick={onToggleTrending}
      >
        <GithubMark /> GitHub trending
      </button>
    </aside>
  );
});
