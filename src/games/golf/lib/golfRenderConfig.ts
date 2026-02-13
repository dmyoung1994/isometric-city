/**
 * Golf Sprite Render Configuration
 * Maps golf course elements and staff to sprite sheet locations with offsets and scales
 */

export interface SpriteSheet {
  id: string;
  src: string;
  cols: number;
  rows: number;
  sprites: SpriteMapping[];
}

export interface SpriteMapping {
  name: string;
  row: number; // 0-indexed
  col: number; // 0-indexed
  offsetX?: number; // Pixel offset for alignment
  offsetY?: number;
  scale?: number; // Scale multiplier (default 1.0)
  cropTop?: number; // Pixels to crop from top of sprite cell
  cropBottom?: number; // Pixels to crop from bottom of sprite cell
  cropLeft?: number; // Pixels to crop from left of sprite cell
  cropRight?: number; // Pixels to crop from right of sprite cell
}

export const GOLF_SPRITE_SHEETS: SpriteSheet[] = [];
