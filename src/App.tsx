import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { MouseEvent } from 'react';
import {
  BookmarkPlus,
  ClipboardPaste,
  Copy,
  ExternalLink,
  FolderOpen,
  FolderPlus,
  Link2,
  Pencil,
  Scissors,
  Trash2,
} from 'lucide-react';
import { AddressBar } from './components/AddressBar';
import { CommandBar } from './components/CommandBar';
import { ConflictBanner } from './components/ConflictBanner';
import { ContextMenu } from './components/ContextMenu';
import type { MenuEntry } from './components/ContextMenu';
import { ExplorerItem } from './components/ExplorerItem';
import { NameDialog } from './components/NameDialog';
import type { DialogState, DialogValues } from './components/NameDialog';
import { Sidebar } from './components/Sidebar';
import { StatusBar } from './components/StatusBar';
import { TrendingDrawer } from './components/TrendingDrawer';
import { useBookmarkTree } from './hooks/useBookmarkTree';
import { useFolderHistory } from './hooks/useFolderHistory';
import { usePersistentState } from './hooks/usePersistentState';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { ConfirmDialog } from './components/ConfirmDialog';
import type { ConfirmState } from './components/ConfirmDialog';
import {
  createBookmark,
  createFolder,
  moveNode,
  openHere,
  openInBackground,
  removeNodes,
  renameNode,
} from './lib/actions';
import {
  ROOT_ID,
  countAll,
  displayTitle,
  getTrail,
  hostOf,
  isFolder,
  isProtected,
  selectVisible,
} from './lib/bookmarks';
import type {
  BmNode,
  ClipboardEntry,
  FilterMode,
  SortMode,
  TrendingRepo,
  ViewMode,
} from './types';

const EMPTY: ReadonlySet<string> = new Set();
const CONFLICT = new URLSearchParams(location.search).has('conflict');

interface MenuState {
  x: number;
  y: number;
  nodeId: string | null;
}

export default function App() {
  const { root, index } = useBookmarkTree();
  const { theme, toggle: toggleTheme } = useTheme();
  const { currentId, canBack, canForward, go, back, forward } =
    useFolderHistory(ROOT_ID);

  const [view, setView] = usePersistentState<ViewMode>('view', 'grid');
  const [sort, setSort] = usePersistentState<SortMode>('sort', 'name');
  const [sidebarOpen, setSidebarOpen] = usePersistentState('sidebar', true);
  const [trendingOpen, setTrendingOpen] = usePersistentState('trending', true);

  const [filter, setFilter] = useState<FilterMode>('all');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query); // keeps typing responsive on big libraries
  const [selected, setSelected] = useState<ReadonlySet<string>>(EMPTY);
  const [clipboard, setClipboard] = useState<ClipboardEntry | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const { message, show } = useToast();
  const searchRef = useRef<HTMLInputElement>(null);

  // Derived during render, no effect needed. Falls back to Home if the open folder was deleted.
  const current = index
    ? (index.get(currentId) ?? index.get(ROOT_ID) ?? null)
    : null;
  const atRoot = current?.id === ROOT_ID;
  const trail = useMemo(
    () => (index && current ? getTrail(index, current.id) : []),
    [index, current],
  );
  const items = useMemo(
    () =>
      index && current
        ? selectVisible(index, current, { query: deferredQuery, filter, sort })
        : [],
    [index, current, deferredQuery, filter, sort],
  );
  const totals = useMemo(
    () => (index ? countAll(index) : { bookmarks: 0, folders: 0 }),
    [index],
  );
  const newItemParent = current && !atRoot ? current.id : null;

  // Tell the background worker this page rendered (used for new-tab conflict detection).
  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'NEWTAB_LOADED' }).catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      const typing =
        t instanceof HTMLInputElement ||
        t instanceof HTMLSelectElement ||
        t instanceof HTMLTextAreaElement;
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === 'Escape') {
        setSelected(EMPTY);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const run = useCallback(
    async (job: () => Promise<unknown>, success: string) => {
      try {
        await job();
        show(success);
      } catch (e) {
        show(e instanceof Error ? e.message : 'Something went wrong');
      }
    },
    [show],
  );

  // --- Stable handlers (functional setState keeps deps empty so memoized children don't re-render) ---
  const navigate = useCallback(
    (id: string) => {
      go(id);
      setSelected(EMPTY);
      setQuery('');
    },
    [go],
  );
  const goBack = useCallback(() => {
    back();
    setSelected(EMPTY);
  }, [back]);
  const goForward = useCallback(() => {
    forward();
    setSelected(EMPTY);
  }, [forward]);
  const goUp = useCallback(() => {
    if (current?.parentId) navigate(current.parentId);
  }, [current?.parentId, navigate]);

  const activate = useCallback(
    (node: BmNode, e: MouseEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(node.id)) next.delete(node.id);
          else next.add(node.id);
          return next;
        });
      } else if (isFolder(node)) {
        setSelected(new Set([node.id]));
      } else {
        void openHere(node.url!);
      }
    },
    [navigate],
  );
  const openFolder = useCallback(
    (node: BmNode) => navigate(node.id),
    [navigate],
  );
  const openBackground = useCallback((node: BmNode) => {
    if (node.url) void openInBackground(node.url);
  }, []);
  const openMenu = useCallback((e: MouseEvent, node: BmNode | null) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected((prev) =>
      node ? (prev.has(node.id) ? prev : new Set([node.id])) : EMPTY,
    );
    setMenu({ x: e.clientX, y: e.clientY, nodeId: node?.id ?? null });
  }, []);
  const closeMenu = useCallback(() => setMenu(null), []);
  const toggleTrending = useCallback(
    () => setTrendingOpen((o) => !o),
    [setTrendingOpen],
  );
  const toggleSidebar = useCallback(
    () => setSidebarOpen((o) => !o),
    [setSidebarOpen],
  );

  const saveRepo = useCallback(
    (repo: TrendingRepo) => {
      const parentId = newItemParent ?? root?.children?.[0]?.id;
      if (!parentId) return;
      void run(
        () => createBookmark(parentId, repo.fullName, repo.url),
        `Saved ${repo.fullName}`,
      );
    },
    [newItemParent, root, run],
  );

  if (!index || !root || !current) {
    return (
      <div className="boot" role="status">
        Opening the cabinet…
      </div>
    );
  }

  // --- Actions below depend on current state, so they're plain functions (only used by menus/dialogs) ---
  function submitDialog(values: DialogValues) {
    const d = dialog;
    setDialog(null);
    if (!d) return;
    if (d.kind === 'rename') {
      const changes = d.node.url
        ? { title: values.title, url: values.url }
        : { title: values.title };
      void run(() => renameNode(d.node.id, changes), 'Saved');
    } else if (newItemParent) {
      if (d.kind === 'folder') {
        void run(
          () => createFolder(newItemParent, values.title),
          `Created "${values.title}"`,
        );
      } else {
        const title = values.title || hostOf(values.url);
        void run(
          () => createBookmark(newItemParent, title, values.url),
          `Added "${title}"`,
        );
      }
    }
  }

  function deleteNodes(nodes: BmNode[]) {
    const targets = nodes.filter((n) => !isProtected(n));
    if (targets.length === 0) return;
    const label =
      targets.length === 1
        ? `Deleted "${displayTitle(targets[0])}"`
        : `Deleted ${targets.length} items`;
    const doDelete = () => {
      void run(() => removeNodes(targets), label);
      setSelected(EMPTY);
    };

    const full = targets.find((n) => isFolder(n) && n.children?.length);
    if (!full) return doDelete();

    setConfirm({
      title:
        targets.length === 1
          ? 'Delete folder?'
          : `Delete ${targets.length} items?`,
      message:
        targets.length === 1
          ? `"${displayTitle(full)}" and everything inside it will be permanently deleted.`
          : `These items, including everything inside any folders, will be permanently deleted.`,
      confirmLabel: 'Delete',
      onConfirm: doDelete,
    });
  }

  function paste(parentId: string) {
    if (!clipboard || parentId === ROOT_ID) return;
    const { id, title, url, mode } = clipboard;
    if (mode === 'cut') {
      void run(() => moveNode(id, parentId), `Moved "${title}"`);
      setClipboard(null);
    } else if (url) {
      void run(() => createBookmark(parentId, title, url), `Pasted "${title}"`);
    }
  }

  function buildEntries(node: BmNode | null): MenuEntry[] {
    const sz = 15;
    const pasteInto = node ? (isFolder(node) ? node.id : null) : newItemParent;
    const canPaste = !!clipboard && !!pasteInto;
    const pasteItem: MenuEntry = {
      label: 'Paste',
      icon: <ClipboardPaste size={sz} />,
      disabled: !canPaste,
      onSelect: () => pasteInto && paste(pasteInto),
    };

    if (!node) {
      return [
        {
          label: 'New folder',
          icon: <FolderPlus size={sz} />,
          disabled: !newItemParent,
          onSelect: () => setDialog({ kind: 'folder' }),
        },
        {
          label: 'New bookmark',
          icon: <BookmarkPlus size={sz} />,
          disabled: !newItemParent,
          onSelect: () => setDialog({ kind: 'bookmark' }),
        },
        'divider',
        pasteItem,
      ];
    }

    const locked = isProtected(node);
    // Right-clicking inside a multi-selection deletes the whole selection.
    const deleteTargets = selected.has(node.id)
      ? items.filter((n) => selected.has(n.id))
      : [node];
    const common: MenuEntry[] = [
      {
        label: 'Rename',
        icon: <Pencil size={sz} />,
        disabled: locked,
        onSelect: () => setDialog({ kind: 'rename', node }),
      },
      {
        label: 'Cut',
        icon: <Scissors size={sz} />,
        disabled: locked,
        onSelect: () => {
          setClipboard({
            id: node.id,
            title: displayTitle(node),
            url: node.url,
            mode: 'cut',
          });
          show(`Cut "${displayTitle(node)}"`);
        },
      },
    ];
    const remove: MenuEntry = {
      label:
        deleteTargets.length > 1
          ? `Delete ${deleteTargets.length} items`
          : 'Delete',
      icon: <Trash2 size={sz} />,
      danger: true,
      disabled: locked,
      onSelect: () => deleteNodes(deleteTargets),
    };

    if (isFolder(node)) {
      return [
        {
          label: 'Open',
          icon: <FolderOpen size={sz} />,
          onSelect: () => navigate(node.id),
        },
        'divider',
        ...common,
        pasteItem,
        'divider',
        remove,
      ];
    }
    const url = node.url!;
    return [
      {
        label: 'Open',
        icon: <ExternalLink size={sz} />,
        onSelect: () => void openHere(url),
      },
      {
        label: 'Open in new tab',
        icon: <ExternalLink size={sz} />,
        onSelect: () => void openInBackground(url),
      },
      {
        label: 'Copy link address',
        icon: <Link2 size={sz} />,
        onSelect: () =>
          void navigator.clipboard
            .writeText(url)
            .then(() => show('Link copied')),
      },
      'divider',
      ...common,
      {
        label: 'Copy',
        icon: <Copy size={sz} />,
        onSelect: () => {
          setClipboard({
            id: node.id,
            title: displayTitle(node),
            url,
            mode: 'copy',
          });
          show(`Copied "${displayTitle(node)}"`);
        },
      },
      'divider',
      remove,
    ];
  }

  const menuNode = menu?.nodeId ? (index.get(menu.nodeId) ?? null) : null;
  const searching = deferredQuery.trim() !== '';

  return (
    <div className="shell">
      <header className="topbar">
        <CommandBar
          canCreate={!!newItemParent}
          view={view}
          sort={sort}
          theme={theme}
          trendingOpen={trendingOpen}
          onView={setView}
          onSort={setSort}
          onToggleTheme={toggleTheme}
          onToggleTrending={toggleTrending}
          onNewFolder={() => setDialog({ kind: 'folder' })}
          onNewBookmark={() => setDialog({ kind: 'bookmark' })}
        />
        <AddressBar
          trail={trail}
          canBack={canBack}
          canForward={canForward}
          canUp={!atRoot && !!current.parentId}
          sidebarOpen={sidebarOpen}
          query={query}
          filter={filter}
          searchRef={searchRef}
          onBack={goBack}
          onForward={goForward}
          onUp={goUp}
          onNavigate={navigate}
          onToggleSidebar={toggleSidebar}
          onQuery={setQuery}
          onFilter={setFilter}
        />
      </header>

      <div className="body">
        <Sidebar
          root={root}
          trail={trail}
          currentId={current.id}
          open={sidebarOpen}
          trendingOpen={trendingOpen}
          onNavigate={navigate}
          onToggleTrending={toggleTrending}
        />

        <main className="workspace">
          <section
            className="explorer"
            aria-label="Bookmarks"
            onClick={(e) => {
              if (!(e.target as HTMLElement).closest('.item'))
                setSelected(EMPTY);
            }}
            onContextMenu={(e) => openMenu(e, null)}
          >
            {CONFLICT ? <ConflictBanner /> : null}

            <div className="explorer__head">
              <h1 className="explorer__title">
                {searching
                  ? `Results for “${deferredQuery.trim()}”`
                  : displayTitle(current)}
              </h1>
              <span className="explorer__count">
                {items.length} item{items.length === 1 ? '' : 's'}
              </span>
            </div>

            {items.length === 0 ? (
              <div className="empty">
                <p className="empty__title">
                  {searching
                    ? 'Nothing matches that search'
                    : 'This folder is empty'}
                </p>
                <p>
                  {searching
                    ? 'Check the spelling, or change the “Show” filter.'
                    : 'Right-click here to add a folder or a bookmark.'}
                </p>
              </div>
            ) : (
              <ul className={`items items--${view}`}>
                {items.map((n, i) => (
                  <ExplorerItem
                    key={n.id}
                    node={n}
                    position={i}
                    selected={selected.has(n.id)}
                    onActivate={activate}
                    onOpenFolder={openFolder}
                    onAuxClick={openBackground}
                    onContextMenu={openMenu}
                  />
                ))}
              </ul>
            )}
          </section>

          <TrendingDrawer
            open={trendingOpen}
            onToggle={toggleTrending}
            onSave={saveRepo}
          />
        </main>
      </div>

      <StatusBar
        shown={items.length}
        selected={selected.size}
        bookmarks={totals.bookmarks}
        folders={totals.folders}
      />

      {menu ? (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          title={menuNode ? displayTitle(menuNode) : displayTitle(current)}
          kind={
            menuNode ? (isFolder(menuNode) ? 'Folder' : 'Bookmark') : 'Folder'
          }
          entries={buildEntries(menuNode)}
          onClose={closeMenu}
        />
      ) : null}

      <NameDialog
        state={dialog}
        onClose={() => setDialog(null)}
        onSubmit={submitDialog}
      />
      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />

      <div
        className="toast"
        role="status"
        aria-live="polite"
        data-show={message ? '' : undefined}
      >
        {message}
      </div>
    </div>
  );
}
