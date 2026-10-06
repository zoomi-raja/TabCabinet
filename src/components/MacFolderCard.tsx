import { memo } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { ChevronRight, Folder } from 'lucide-react';
import { displayTitle } from '../lib/bookmarks';
import card from '../styles/macCard.module.css';
import type { BmNode } from '../types';
import styles from './MacFolderCard.module.css';

interface Props {
  node: BmNode;
  position: number;
  selected: boolean;
  onActivate: (node: BmNode, e: MouseEvent) => void;
  onOpenFolder: (node: BmNode) => void;
  onContextMenu: (e: MouseEvent, node: BmNode) => void;
}

export const MacFolderCard = memo(function MacFolderCard({
  node,
  position,
  selected,
  onActivate,
  onOpenFolder,
  onContextMenu,
}: Props) {
  const title = displayTitle(node);
  const count = node.children?.length ?? 0;

  return (
    <li className={styles.cell}>
      <button
        type="button"
        data-item
        className={`${card.card} ${styles.card}`}
        data-selected={selected ? '' : undefined}
        style={{ '--i': Math.min(position, 24) } as CSSProperties}
        title={title}
        onClick={(e) => onActivate(node, e)}
        onDoubleClick={() => onOpenFolder(node)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onOpenFolder(node);
        }}
        onContextMenu={(e) => onContextMenu(e, node)}
      >
        <span className={styles.icon}>
          <Folder size={22} strokeWidth={1.6} />
        </span>
        <span className={styles.name}>{title}</span>
        <span className={styles.meta}>
          {count} item{count === 1 ? '' : 's'}
        </span>
        <ChevronRight size={16} className={styles.chev} />
      </button>
    </li>
  );
});
