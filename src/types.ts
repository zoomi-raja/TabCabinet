export type BmNode = chrome.bookmarks.BookmarkTreeNode

export type ViewMode = 'grid' | 'list' | 'tiles'
export type SortMode = 'name' | 'site' | 'date'
export type FilterMode = 'all' | 'folders' | 'bookmarks'
export type Theme = 'light' | 'dark'

export interface TrendingRepo {
  id: number
  fullName: string
  description: string | null
  url: string
  language: string | null
  stars: number
}

export interface ClipboardEntry {
  id: string
  title: string
  url?: string
  mode: 'cut' | 'copy'
}
