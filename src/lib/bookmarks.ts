import type { BmNode, FilterMode, SortMode } from '../types';

export const ROOT_ID = '0';

export const isFolder = (n: BmNode) => !n.url;

/** One pass over the tree -> O(1) lookups by id (js-index-maps). */
export function indexTree(root: BmNode): Map<string, BmNode> {
  const map = new Map<string, BmNode>();
  const walk = (n: BmNode) => {
    map.set(n.id, n);
    n.children?.forEach(walk);
  };
  walk(root);
  return map;
}

/** Root -> ... -> node, for breadcrumbs. */
export function getTrail(index: Map<string, BmNode>, id: string): BmNode[] {
  const trail: BmNode[] = [];
  let cur = index.get(id);
  while (cur) {
    trail.push(cur);
    cur = cur.parentId ? index.get(cur.parentId) : undefined;
  }
  return trail.reverse();
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '') || url;
  } catch {
    return url;
  }
}

export const displayTitle = (n: BmNode) =>
  n.title || (n.url ? hostOf(n.url) : n.id === ROOT_ID ? 'Home' : 'Untitled');

export const modifiedAt = (n: BmNode) =>
  n.dateGroupModified ?? n.dateAdded ?? 0;

/** Top-level folders (bookmarks bar, other bookmarks) can't be renamed or removed. */
export const isProtected = (n: BmNode) =>
  n.id === ROOT_ID || n.parentId === ROOT_ID;

/** "Bookmarks bar/Dev" style path of the folder a node lives in (Home excluded). */
export function folderPath(index: Map<string, BmNode>, node: BmNode): string {
  const names: string[] = [];
  let cur = node.parentId ? index.get(node.parentId) : undefined;
  while (cur && cur.id !== ROOT_ID) {
    names.push(displayTitle(cur));
    cur = cur.parentId ? index.get(cur.parentId) : undefined;
  }
  return names.reverse().join('/');
}

interface ViewOptions {
  query: string;
  filter: FilterMode;
  sort: SortMode;
}

/** Every node below `node`, at any depth. */
function descendantsOf(node: BmNode, out: BmNode[] = []): BmNode[] {
  for (const child of node.children ?? []) {
    out.push(child);
    descendantsOf(child, out);
  }
  return out;
}

/** Search + filter + sort in a single pass over the candidates. */
export function selectVisible(
  current: BmNode,
  { query, filter, sort }: ViewOptions,
): BmNode[] {
  const q = query.trim().toLowerCase();
  // While searching, look through the open folder and everything inside it.
  const source = q ? descendantsOf(current) : (current.children ?? []);

  const out: BmNode[] = [];
  for (const n of source) {
    const folder = isFolder(n);
    if (filter === 'folders' && !folder) continue;
    if (filter === 'bookmarks' && folder) continue;
    if (
      q &&
      !displayTitle(n).toLowerCase().includes(q) &&
      !(n.url ?? '').toLowerCase().includes(q)
    )
      continue;
    out.push(n);
  }

  return out.sort((a, b) => {
    const fa = isFolder(a);
    if (fa !== isFolder(b)) return fa ? -1 : 1; // folders first
    if (sort === 'date') return modifiedAt(b) - modifiedAt(a);
    if (sort === 'site' && !fa) {
      return (
        hostOf(a.url!).localeCompare(hostOf(b.url!)) ||
        displayTitle(a).localeCompare(displayTitle(b))
      );
    }
    return displayTitle(a).localeCompare(displayTitle(b));
  });
}

export function countAll(index: Map<string, BmNode>) {
  let bookmarks = 0;
  let folders = 0;
  for (const n of index.values()) {
    if (n.id === ROOT_ID) continue;
    if (isFolder(n)) folders++;
    else bookmarks++;
  }
  return { bookmarks, folders };
}
