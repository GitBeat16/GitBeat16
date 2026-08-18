declare module '@shared/mascot.mjs' {
  export const MASCOT_VIEWBOX: { w: number; h: number };
  export const mascotCss: string;
  export function mascotMarkup(opts?: {
    uid?: string;
    showHeadphones?: boolean;
    showTail?: boolean;
  }): string;
  export function webNet(opts: {
    cx: number; cy: number; radii?: number[]; spokes?: number;
    from?: number; to?: number; sag?: number;
  }): string;
  export function spiderMark(cx: number, cy: number, s?: number, color?: string): string;
}

declare module '@shared/counter.mjs' {
  export const COUNTER_SIZE: { w: number; h: number };
  export function counterSvg(opts?: { count?: number | null; label?: string }): string;
}

declare module '@shared/views-store.mjs' {
  export function cleanSlug(raw: unknown): string;
  export function readConfig(env?: Record<string, string | undefined>): { url: string; token: string };
  export function tally(
    command: 'incr' | 'get',
    slug: string | null,
    opts?: { env?: Record<string, string | undefined>; fetchImpl?: typeof fetch }
  ): Promise<number | null>;
}

declare module '@shared/theme.mjs' {
  export const palette: Record<string, string> & { ramp: string[] };
  export const font: { display: string; body: string; mono: string };
  export const layout: { readmeWidth: number; radius: number };
}
