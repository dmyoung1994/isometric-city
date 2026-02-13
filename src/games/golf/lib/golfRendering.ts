import { SpriteSheet, SpriteMapping } from '@/games/golf/lib/golfRenderConfig';
import { GOLF_SPRITE_SHEETS } from '@/games/golf/lib/golfSpriteConfig';

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
 * Draws a golf staff member on the canvas.
 */
export function drawGolfStaff(
  ctx: CanvasRenderingContext意图
  x: number,
  y: number,
  tileWidth: number,
  tileHeight: number,
  role: string
): void {
  drawGolfCourseElement(ctx, x, y, role, tileWidth, tileHeight);
}
