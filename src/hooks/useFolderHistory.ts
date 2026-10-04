import { useCallback, useState } from 'react'

interface History {
  stack: string[]
  pos: number
}

/** Browser-style back/forward over folder ids. */
export function useFolderHistory(initialId: string) {
  const [h, setH] = useState<History>({ stack: [initialId], pos: 0 })

  const go = useCallback((id: string) => {
    setH((s) =>
      s.stack[s.pos] === id ? s : { stack: [...s.stack.slice(0, s.pos + 1), id], pos: s.pos + 1 }
    )
  }, [])
  const back = useCallback(() => setH((s) => ({ ...s, pos: Math.max(0, s.pos - 1) })), [])
  const forward = useCallback(
    () => setH((s) => ({ ...s, pos: Math.min(s.stack.length - 1, s.pos + 1) })),
    []
  )

  return {
    currentId: h.stack[h.pos],
    canBack: h.pos > 0,
    canForward: h.pos < h.stack.length - 1,
    go,
    back,
    forward,
  }
}
