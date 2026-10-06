import { memo } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { Folder } from 'lucide-react';
import { displayTitle, hostOf, modifiedAt } from '../lib/bookmarks';
import card from '../styles/macCard.module.css';
import type { BmNode } from '../types';
import { Favicon } from './Favicon';
import styles from './MacLinkItem.module.css';

const dateFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

interface Props {
  node: BmNode;
  position: number;
  selected: boolean;
  view: 'tiles' | 'list';
  path: string;
  onActivate: (node: BmNode, e: MouseEvent) => void;
  onAuxClick: (node: BmNode, e: MouseEvent) => void;
  onContextMenu: (e: MouseEvent, node: BmNode) => void;
}

export const MacLinkItem = memo(function MacLinkItem({
  node,
  position,
  selected,
  view,
  path,
  onActivate,
  onAuxClick,
  onContextMenu,
}: Props) {
  const title = displayTitle(node);
  const when = modifiedAt(node);

  return (
    <li className={styles.cell} data-view={view}>
      <a
        href={node.url}
        data-item
        className={
          view === 'tiles' ? `${card.card} ${styles.item}` : styles.item
        }
        data-view={view}
        data-selected={selected ? '' : undefined}
        style={{ '--i': Math.min(position, 24) } as CSSProperties}
        title={`${title}\n${node.url}`}
        onClick={(e) => {
          e.preventDefault();
          onActivate(node, e);
        }}
        onAuxClick={(e) => {
          if (e.button === 1) onAuxClick(node, e);
        }}
        onContextMenu={(e) => onContextMenu(e, node)}
      >
        <span className={styles.icon}>
          <Favicon url={node.url!} />
        </span>
        <span className={styles.name}>{title}</span>
        <span className={styles.meta}>{hostOf(node.url!)}</span>
        {path ? (
          <span className={styles.path}>
            <Folder size={14} />
            <span>{path}</span>
          </span>
        ) : null}
        <span className={styles.date}>{when ? dateFmt.format(when) : ''}</span>
      </a>
    </li>
  );
});
