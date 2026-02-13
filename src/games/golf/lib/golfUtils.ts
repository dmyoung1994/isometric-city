import { SpriteSheet, SpriteMapping } from '@/games/golf/lib/golfRenderConfig';
import { GOLF_SPRITE_SHEETS } from '@/games/golf/lib/golfSpriteConfig';

/**
 * Get sprite information for a given element.
 */
export function getSpriteInfo(
  elementName: string
): { sheet: SpriteSheet; sprite: SpriteMapping } | null {
  for (const sheet of GOLF_SPRITE_SHEETS) {
    const sprite = sheet.sprites.find(s => s.name === elementName);
    if (sprite) {
      return { sheet, sprite };
    }
  }
  return null;
}

/**
 * Get the source rectangle for a sprite in its sheet.
 */
export function getSpriteRect(
  sheet: SpriteSheet,
  sprite: SpriteMapping,
  sheetWidth: number,
  sheetHeight: number
): { sx: number; sy: number; sw: number; sh: number } {
  const cellWidth = sheetWidth / sheet.cols;
  const cellHeight = sheetHeight / sheet.rows;

  // Apply cropping if specified
  const cropTop = sprite.cropTop || 0;
  const cropBottom = sprite.cropBottom || 0;
  const cropLeft = sprite.cropLeft || 0;
  const cropRight = sprite.cropRight || 0;

  return {
    sx: sprite.col * cellWidth + cropLeft,
    sy: sprite.row * cellHeight + cropTop,
    sw: cellWidth - cropLeft - cropRight,
    sh: cellHeight - cropTop - cropBottom,
  };
}
