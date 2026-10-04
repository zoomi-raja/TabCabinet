import { useEffect, useState } from 'react'

export function ConflictBanner() {
  const [others, setOthers] = useState<chrome.management.ExtensionInfo[]>([])

  useEffect(() => {
    chrome.management.getAll().then((all) =>
      setOthers(
        all
          .filter((e) => e.enabled && e.type === 'extension' && e.mayDisable)
          .filter((e) => e.id !== chrome.runtime.id)
          .sort((a, b) => a.name.localeCompare(b.name))
      )
    )
  }, [])

  const disable = async (id: string) => {
    try {
      await chrome.management.setEnabled(id, false) // Chrome asks the user to confirm
      setOthers((list) => list.filter((e) => e.id !== id))
    } catch {
      // user cancelled
    }
  }

  return (
    <div className="banner" role="alert">
      <h2>Another extension is controlling your new tab</h2>
      <p>
        Chrome allows only one new tab page. Disable the extension that replaced it, then open a new tab to see
        TabCabinet.
      </p>
      <button type="button" className="btn btn--primary" onClick={() => chrome.tabs.create({ url: 'chrome://extensions' })}>
        Open chrome://extensions
      </button>
      <details>
        <summary>Pick from installed extensions</summary>
        <ul>
          {others.map((e) => (
            <li key={e.id}>
              {e.name}{' '}
              <button type="button" className="btn btn--small" onClick={() => disable(e.id)}>
                Disable
              </button>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
