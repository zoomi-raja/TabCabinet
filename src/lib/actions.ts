import type { BmNode } from '../types'
import { isFolder } from './bookmarks'

export const createFolder = (parentId: string, title: string) =>
  chrome.bookmarks.create({ parentId, title })

export const createBookmark = (parentId: string, title: string, url: string) =>
  chrome.bookmarks.create({ parentId, title, url })

export const renameNode = (id: string, changes: { title: string; url?: string }) =>
  chrome.bookmarks.update(id, changes)

export const moveNode = (id: string, parentId: string) =>
  chrome.bookmarks.move(id, { parentId })

export const removeNodes = (nodes: BmNode[]) =>
  Promise.all(
    nodes.map((n) => (isFolder(n) ? chrome.bookmarks.removeTree(n.id) : chrome.bookmarks.remove(n.id)))
  )

/** Open in the current tab. chrome.tabs.update also handles chrome:// and file:// URLs. */
export const openHere = (url: string) => chrome.tabs.update({ url })
export const openInBackground = (url: string) => chrome.tabs.create({ url, active: false })

/** Chrome's own favicon cache (needs the "favicon" permission). */
export function faviconUrl(pageUrl: string, size = 32) {
  const u = new URL(chrome.runtime.getURL('/_favicon/'))
  u.searchParams.set('pageUrl', pageUrl)
  u.searchParams.set('size', String(size))
  return u.toString()
}
