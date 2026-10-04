import { memo } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { displayTitle, hostOf, isFolder, modifiedAt } from '../lib/bookmarks';
import type { BmNode } from '../types';
import { Favicon } from './Favicon';

const dateFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

interface Props {
  node: BmNode;
  position: number;
  selected: boolean;
  onActivate: (node: BmNode, e: MouseEvent) => void;
  onOpenFolder: (node: BmNode) => void;
  onAuxClick: (node: BmNode, e: MouseEvent) => void;
  onContextMenu: (e: MouseEvent, node: BmNode) => void;
}

/** One markup for all three view modes; the CSS grid areas do the layout. */
export const ExplorerItem = memo(function ExplorerItem({
  node,
  position,
  selected,
  onActivate,
  onOpenFolder,
  onAuxClick,
  onContextMenu,
}: Props) {
  const folder = isFolder(node);
  const title = displayTitle(node);
  const count = node.children?.length ?? 0;
  const when = modifiedAt(node);

  const content = (
    <>
      <span
        className={folder ? 'item__glyph' : 'item__glyph item__glyph--card'}
      >
        {folder ? (
          <span className="folder-glyph" aria-hidden="true">
            <span className="folder-glyph__count">{count}</span>
          </span>
        ) : (
          <Favicon url={node.url!} />
        )}
      </span>
      <span className="item__name">{title}</span>
      <span className="item__meta">
        {folder ? 'Folder' : hostOf(node.url!)}
      </span>
      <span className="item__date">{when ? dateFmt.format(when) : ''}</span>
      <span className="item__kind">
        {folder ? `${count} item${count === 1 ? '' : 's'}` : 'Bookmark'}
      </span>
    </>
  );

  const shared = {
    className: 'item',
    'data-selected': selected ? '' : undefined,
    style: { '--i': Math.min(position, 24) } as CSSProperties,
    title: folder ? title : `${title}\n${node.url}`,
    onClick: (e: MouseEvent) => {
      e.preventDefault();
      onActivate(node, e);
    },
    onAuxClick: (e: MouseEvent) => {
      if (e.button === 1) onAuxClick(node, e);
    },
    onContextMenu: (e: MouseEvent) => onContextMenu(e, node),
  };

  return (
    <li className="cell">
      {folder ? (
        <button
          type="button"
          {...shared}
          onDoubleClick={() => onOpenFolder(node)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onOpenFolder(node);
          }}
        >
          {content}
        </button>
      ) : (
        <a href={node.url} {...shared}>
          {content}
        </a>
      )}
    </li>
  );
});
