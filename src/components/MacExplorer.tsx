import type { MouseEvent } from 'react';
import { FolderPlus } from 'lucide-react';
import { folderPath } from '../lib/bookmarks';
import type { BmNode } from '../types';
import styles from './MacExplorer.module.css';
import { MacFolderCard } from './MacFolderCard';
import { MacLinkItem } from './MaclinkItem';

interface Props {
  folders: BmNode[];
  links: BmNode[];
  view: 'tiles' | 'list';
  index: Map<string, BmNode>;
  selected: ReadonlySet<string>;
  canCreateFolder: boolean;
  onNewFolder: () => void;
  onActivate: (node: BmNode, e: MouseEvent) => void;
  onOpenFolder: (node: BmNode) => void;
  onAuxClick: (node: BmNode, e: MouseEvent) => void;
  onContextMenu: (e: MouseEvent, node: BmNode) => void;
}

/** Mac theme explorer: folders are always a card row, only links follow the Tiles / List view. */
export function MacExplorer({
  folders,
  links,
  view,
  index,
  selected,
  canCreateFolder,
  onNewFolder,
  onActivate,
  onOpenFolder,
  onAuxClick,
  onContextMenu,
}: Props) {
  return (
    <>
      {folders.length > 0 ? (
        <section className={styles.folders} aria-label="Folders">
          <div className={styles.head}>
            <h2 className={styles.label}>Folders</h2>
            <button
              type="button"
              className={styles.newBtn}
              disabled={!canCreateFolder}
              onClick={onNewFolder}
            >
              <FolderPlus size={14} /> New folder
            </button>
          </div>
          <ul className={styles.folderGrid}>
            {folders.map((n, i) => (
              <MacFolderCard
                key={n.id}
                node={n}
                position={i}
                selected={selected.has(n.id)}
                onActivate={onActivate}
                onOpenFolder={onOpenFolder}
                onContextMenu={onContextMenu}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {links.length > 0 ? (
        <ul className={view === 'list' ? styles.list : styles.tiles}>
          {links.map((n, i) => (
            <MacLinkItem
              key={n.id}
              node={n}
              position={i}
              selected={selected.has(n.id)}
              view={view}
              path={folderPath(index, n)}
              onActivate={onActivate}
              onAuxClick={onAuxClick}
              onContextMenu={onContextMenu}
            />
          ))}
        </ul>
      ) : null}
    </>
  );
}
