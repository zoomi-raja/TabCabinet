import { useEffect, useMemo, useState } from 'react'
import type { BmNode } from '../types'
import { indexTree } from '../lib/bookmarks'

/** Loads the bookmark tree and keeps it live as Chrome's bookmarks change. */
export function useBookmarkTree() {
  const [root, setRoot] = useState<BmNode | null>(null)

  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setTimeout> | undefined

    const load = () => {
      chrome.bookmarks.getTree().then((tree) => {
        if (active) setRoot(tree[0])
      })
    }
    // Imports and bulk moves fire many events; coalesce them into one reload.
    const schedule = () => {
      clearTimeout(timer)
      timer = setTimeout(load, 60)
    }

    load()
    const b = chrome.bookmarks
    const events = [b.onCreated, b.onRemoved, b.onChanged, b.onMoved, b.onChildrenReordered, b.onImportEnded]
    events.forEach((e) => e.addListener(schedule))

    return () => {
      active = false
      clearTimeout(timer)
      events.forEach((e) => e.removeListener(schedule))
    }
  }, [])

  const index = useMemo(() => (root ? indexTree(root) : null), [root])
  return { root, index }
}
