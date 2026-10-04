import { useState } from 'react'
import { Globe } from 'lucide-react'
import { faviconUrl } from '../lib/actions'

export function Favicon({ url, size = 20 }: { url: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  return failed ? (
    <Globe size={size} strokeWidth={1.75} />
  ) : (
    <img
      src={faviconUrl(url)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
