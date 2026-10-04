import { useCallback, useEffect, useState } from 'react';
import type { TrendingRepo } from '../types';

const CACHE_KEY = 'trending:v2';
const TTL_MS = 60 * 60 * 1000; // GitHub's unauthenticated search limit is only 10 requests/min

interface Cached {
  at: number;
  repos: TrendingRepo[];
}

interface ApiItem {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
}

async function readCache(): Promise<Cached | null> {
  const stored = await chrome.storage.local.get(CACHE_KEY);
  return (stored[CACHE_KEY] as Cached | undefined) ?? null;
}

async function fetchRepos(signal: AbortSignal): Promise<TrendingRepo[]> {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent('stars:>1000')}&sort=stars&order=desc&per_page=5`;
  const res = await fetch(url, {
    signal,
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!res.ok)
    throw new Error(
      res.status === 403
        ? 'GitHub rate limit reached'
        : `GitHub returned ${res.status}`,
    );
  const data = (await res.json()) as { items: ApiItem[] };
  return data.items.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    description: r.description,
    url: r.html_url,
    language: r.language,
    stars: r.stargazers_count,
  }));
}

type State =
  | { status: 'loading'; repos: TrendingRepo[] }
  | { status: 'ready'; repos: TrendingRepo[] }
  | { status: 'error'; repos: TrendingRepo[]; error: string };

export function useTrending() {
  const [state, setState] = useState<State>({ status: 'loading', repos: [] });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const force = nonce > 0;

    async function run() {
      const cached = await readCache();
      if (cached && !force && Date.now() - cached.at < TTL_MS) {
        setState({ status: 'ready', repos: cached.repos });
        return;
      }
      if (cached) setState({ status: 'loading', repos: cached.repos }); // show stale data while refreshing
      try {
        const repos = await fetchRepos(controller.signal);
        await chrome.storage.local.set({
          [CACHE_KEY]: { at: Date.now(), repos } satisfies Cached,
        });
        setState({ status: 'ready', repos });
      } catch (e) {
        if (controller.signal.aborted) return;
        setState({
          status: 'error',
          repos: cached?.repos ?? [],
          error:
            e instanceof Error ? e.message : 'Could not load trending repos',
        });
      }
    }

    void run();
    return () => controller.abort();
  }, [nonce]);

  const refresh = useCallback(() => {
    setState((s) => ({ status: 'loading', repos: s.repos }));
    setNonce((n) => n + 1);
  }, []);

  return { ...state, refresh };
}
