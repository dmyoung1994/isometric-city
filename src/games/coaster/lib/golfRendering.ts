import { SpriteSheet, SpriteMapping } from '@/games/coaster/lib/coasterRenderConfig';
import { GOLF_SPRITE_SHEETS } from '@/games/coaster/lib/golfSpriteConfig';

/**
 * Draws a golf course element (fairway, green, sand trap, etc.) on the canvas.
 */
export function drawGolfCourseElement(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  elementType: string,
  tileWidth: number,
  tileHeight: number
): void {
  const spriteInfo = getSpriteInfo(elementType);
  if (!spriteInfo) {
    console.warn(`No sprite found for golf course element: ${elementType}`);
    return;
  }

  const { sheet, sprite } = spriteInfo;
  const { sx, sy, sw, sh } = getSpriteRect(
    sheet,
    sprite,
    tileWidth * sheet.cols,
    tileHeight * sheet.rows
  );

  // Draw the sprite
  ctx.drawImage(
    sheet.src,
    sx,
    sy,
    sw,
    sh,
    x,
    y,
    tileWidth * sprite.scale,
    tileHeight * sprite.scale
  );
}

/**
 * Draws a golf ball on the canvas.
 */
export function drawGolfBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileWidth: number,
  tileHeight: number
): void {
  drawGolfCourseElement(ctx, x, y, 'golf_ball', tileWidth, tileHeight);
}

/**
 * Draws a player avatar on the canvas.
 */
export function drawPlayerAvatar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileWidth: number,
  tileHeight: number
): void {
  drawGolfCourseElement(ctx, x, y, 'player_avatar', tileWidth, tileHeight);
}
