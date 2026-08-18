/**
 * Storage adapter for the profile view counter.
 *
 * Kept out of the route handler so it can be exercised from plain Node without
 * booting Next — the same reason shared/mascot.mjs is shared with the asset
 * generator. Talks to any Upstash-compatible Redis REST endpoint over plain
 * fetch, so there is no SDK to keep in step with.
 */

/** Short, safe charset: a slug can never reshape the Redis command path. */
export function cleanSlug(raw) {
  const s = String(raw ?? 'profile')
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 48);
  return s || 'profile';
}

export function readConfig(env = process.env) {
  return {
    url: env.UPSTASH_REDIS_REST_URL ?? env.KV_REST_API_URL ?? '',
    token: env.UPSTASH_REDIS_REST_TOKEN ?? env.KV_REST_API_TOKEN ?? '',
  };
}

/**
 * @param {'incr'|'get'} command
 * @param {string} slug
 * @returns {Promise<number|null>} null when unconfigured or on any failure —
 *   a counter is decoration, so a storage hiccup must never break the image.
 */
export async function tally(command, slug, { env = process.env, fetchImpl = fetch } = {}) {
  const { url, token } = readConfig(env);
  if (!url || !token) return null;

  const key = `views:${cleanSlug(slug)}`;
  try {
    const res = await fetchImpl(`${url.replace(/\/+$/, '')}/${command}/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const body = await res.json();
    const n = Number(body?.result);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
