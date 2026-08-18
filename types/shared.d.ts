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

declare module '@shared/theme.mjs' {
  export const palette: Record<string, string> & { ramp: string[] };
  export const font: { display: string; body: string; mono: string };
  export const layout: { readmeWidth: number; radius: number };
}
