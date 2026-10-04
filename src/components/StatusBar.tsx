interface Props {
  shown: number
  selected: number
  bookmarks: number
  folders: number
}

export function StatusBar({ shown, selected, bookmarks, folders }: Props) {
  return (
    <footer className="statusbar">
      <span>
        {shown} item{shown === 1 ? '' : 's'}
      </span>
      {selected > 0 ? <span>{selected} selected</span> : null}
      <span className="spacer" />
      <span>
        {bookmarks} bookmarks · {folders} folders
      </span>
      <span className="statusbar__hint">Ctrl/Cmd-click to select · Middle-click opens in background</span>
    </footer>
  )
}
