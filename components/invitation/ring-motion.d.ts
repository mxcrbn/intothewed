export interface WeddingRings { replay(): void; setPaused(value: boolean): void; destroy(): void; }
/** Mount once per rings element (the asset pack's controller, art/rings-animation/). */
export function mountWeddingRings(element: Element | null): WeddingRings | null;
