type CacheEntry<T> = {
  expiresAt: number;
  promise: Promise<T>;
};

const entries = new Map<string, CacheEntry<unknown>>();

export function cachedRequest<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs = 15000,
): Promise<T> {
  const now = Date.now();
  const existing = entries.get(key) as CacheEntry<T> | undefined;
  if (existing && existing.expiresAt > now) {
    return existing.promise;
  }

  const promise = loader().catch((error) => {
    entries.delete(key);
    throw error;
  });
  entries.set(key, { expiresAt: now + ttlMs, promise });
  return promise;
}

export function invalidateCache(prefix?: string) {
  if (!prefix) {
    entries.clear();
    return;
  }

  for (const key of entries.keys()) {
    if (key.startsWith(prefix)) entries.delete(key);
  }
}
