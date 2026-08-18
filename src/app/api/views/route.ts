/**
 * Profile view counter.
 *
 *   GET /api/views              -> increments and returns the themed SVG panel
 *   GET /api/views?peek=1       -> renders the current value without counting
 *   GET /api/views?slug=repo-x  -> separate counter for a different surface
 *
 * README.md embeds this endpoint as an image. GitHub proxies and caches README
 * images through Camo, so the number can lag reality by a few minutes — the
 * no-store headers below keep that window as short as Camo allows.
 *
 * Storage is any Upstash-compatible Redis REST endpoint (see
 * shared/views-store.mjs). Adding "Upstash Redis" from the Vercel Marketplace
 * injects the credentials automatically; both the modern and the legacy Vercel
 * KV variable names are accepted. With no store configured the panel still
 * renders — showing an em dash — instead of returning a 500, so a missing
 * binding degrades to a cosmetic problem rather than a broken image.
 */

import { counterSvg } from '@shared/counter.mjs';
import { tally } from '@shared/views-store.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  const peek = url.searchParams.has('peek');
  const label = (url.searchParams.get('label') ?? 'PROFILE VIEWS').slice(0, 28).toUpperCase();

  const count = await tally(peek ? 'get' : 'incr', slug);

  return new Response(counterSvg({ count, label }), {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      // Ask every layer in front of us not to hold on to this response.
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
      'CDN-Cache-Control': 'no-store',
      'Vercel-CDN-Cache-Control': 'no-store',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
