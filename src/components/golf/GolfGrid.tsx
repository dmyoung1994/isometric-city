'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGolf } from '@/context/GolfContext';
import { Tile } from '@/games/golf/types/game';
import { GOLF_SPRITE_PACK, setActiveSpritePack, getSpritePack, DEFAULT_SPRITE_PACK_ID } from '@/lib/renderConfig';
import { getSpriteRenderInfo } from '@/components/game/buildingSprite';
import { getCachedImage, loadSpriteImage, onImageLoaded } from '@/components/game/imageLoader';
import { GOLF_SPRITE_VARIANTS } from '@/lib/golfSpriteSheet';
import { GOLF_FACILITY_SPRITE_MAP } from '@/games/golf/lib/golfAssetMap';

const TILE_WIDTH = 64;
const HEIGHT_RATIO = 0.60;
const TILE_HEIGHT = TILE_WIDTH * HEIGHT_RATIO;

const TERRAIN_COLORS: Record<Tile['terrain'], string> = {
  grass: '#5fbf5b',
  rough: '#4f8f3b',
  fairway: '#6fd068',
  green: '#2f9e4b',
  sand: '#e7c36b',
  water: '#4aa3df',
  cart_path: '#a79275',
};

function gridToScreen(gridX: number, gridY: number, offsetX: number, offsetY: number) {
  const screenX = (gridX - gridY) * (TILE_WIDTH / 2) + offsetX;
  const screenY = (gridX + gridY) * (TILE_HEIGHT / 2) + offsetY;
  return { screenX, screenY };
}

function screenToGrid(screenX: number, screenY: number, offsetX: number, offsetY: number) {
  const adjustedX = screenX - offsetX;
  const adjustedY = screenY - offsetY;
  const gridX = (adjustedX / (TILE_WIDTH / 2) + adjustedY / (TILE_HEIGHT / 2)) / 2;
  const gridY = (adjustedY / (TILE_HEIGHT / 2) - adjustedX / (TILE_WIDTH / 2)) / 2;
  return { gridX: Math.floor(gridX), gridY: Math.floor(gridY) };
}

function drawTile(ctx: CanvasRenderingContext2D, tile: Tile, screenX: number, screenY: number) {
  ctx.fillStyle = TERRAIN_COLORS[tile.terrain];
  ctx.beginPath();
  ctx.moveTo(screenX, screenY);
  ctx.lineTo(screenX + TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2);
  ctx.lineTo(screenX, screenY + TILE_HEIGHT);
  ctx.lineTo(screenX - TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.stroke();
}

function spriteForTerrain(terrain: Tile['terrain']): string | null {
  if (terrain === 'fairway') return 'fairway';
  if (terrain === 'green') return 'green';
  if (terrain === 'rough' || terrain === 'grass') return 'rough';
  if (terrain === 'sand') return 'sand';
  if (terrain === 'water') return 'water';
  if (terrain === 'cart_path') return 'cart_path';
  return null;
}

function pickVariant(baseName: string, x: number, y: number): string {
  const variants = GOLF_SPRITE_VARIANTS[baseName as keyof typeof GOLF_SPRITE_VARIANTS];
  if (!variants || variants.length === 0) {
    return baseName;
  }
  const hash = (x * 73856093) ^ (y * 19349663);
  const index = Math.abs(hash) % variants.length;
  return variants[index];
}

export function GolfGrid({
  selectedTile,
  setSelectedTile,
  isMobile,
}: {
  selectedTile: { x: number; y: number } | null;
  setSelectedTile: (tile: { x: number; y: number } | null) => void;
  isMobile?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, placeAtTile, bulldozeTile, addHoleSegment } = useGolf();
  const offset = useMemo(() => ({ x: 600, y: 80 }), []);
  const [imageLoadVersion, setImageLoadVersion] = useState(0);
  const spritePack = GOLF_SPRITE_PACK;
  const spriteSheetSrc = spritePack.parksSrc ?? spritePack.src;
  const isoPack = getSpritePack(DEFAULT_SPRITE_PACK_ID);
  const isoParksSrc = isoPack.parksSrc ?? isoPack.src;

  useEffect(() => {
    setActiveSpritePack(spritePack);
    loadSpriteImage(spriteSheetSrc, false).catch(console.error);
    if (isoParksSrc) {
      loadSpriteImage(isoParksSrc, true).catch(console.error);
    }
    const unsubscribe = onImageLoaded(() => {
      setImageLoadVersion(version => version + 1);
    });
    return unsubscribe;
  }, [spritePack, spriteSheetSrc, isoParksSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    for (let y = 0; y < state.gridSize; y++) {
      for (let x = 0; x < state.gridSize; x++) {
        const tile = state.grid[y][x];
        const { screenX, screenY } = gridToScreen(x, y, offset.x, offset.y);
        drawTile(ctx, tile, screenX, screenY);

        const spriteName = spriteForTerrain(tile.terrain);
        if (spriteName) {
          const variantName = pickVariant(spriteName, x, y);
          const img = getCachedImage(spriteSheetSrc, false);
          if (img) {
            const renderInfo = getSpriteRenderInfo(
              variantName,
              { constructionProgress: 100, abandoned: false },
              x,
              y,
              screenX,
              screenY,
              img.naturalWidth || img.width,
              img.naturalHeight || img.height,
              {},
              spritePack
            );
            if (renderInfo) {
              const { coords, positioning } = renderInfo;
              if (coords) {
                ctx.drawImage(
                  img,
                  coords.sx,
                  coords.sy,
                  coords.sw,
                  coords.sh,
                  positioning.drawX,
                  positioning.drawY,
                  positioning.destWidth,
                  positioning.destHeight
                );
              }
            }
          }
        }

        if (tile.facility) {
          const facilityLevel = state.facilities.find(f => f.type === tile.facility)?.level ?? 1;
          const mappedSprite = GOLF_FACILITY_SPRITE_MAP[tile.facility as keyof typeof GOLF_FACILITY_SPRITE_MAP];
          const facilitySprite = mappedSprite || `${tile.facility}_l${facilityLevel}`;
          const variantSprite = pickVariant(facilitySprite, x, y);
          const img = isoParksSrc ? getCachedImage(isoParksSrc, true) : undefined;
          if (img && isoParksSrc) {
            const renderInfo = getSpriteRenderInfo(
              variantSprite,
              { constructionProgress: 100, abandoned: false, level: facilityLevel },
              x,
              y,
              screenX,
              screenY,
              img.naturalWidth || img.width,
              img.naturalHeight || img.height,
              {},
              isoPack
            );
            if (renderInfo?.coords) {
              const { coords, positioning } = renderInfo;
              ctx.drawImage(
                img,
                coords.sx,
                coords.sy,
                coords.sw,
                coords.sh,
                positioning.drawX,
                positioning.drawY,
                positioning.destWidth,
                positioning.destHeight
              );
            }
          }
        }
      }
    }

    for (const hole of state.holes) {
      const tee = hole.teeTile;
      const green = hole.greenTile;
      const teeScreen = gridToScreen(tee.x, tee.y, offset.x, offset.y);
      const greenScreen = gridToScreen(green.x, green.y, offset.x, offset.y);
      const img = getCachedImage(spriteSheetSrc, false);
      if (img) {
        const teeInfo = getSpriteRenderInfo(
          pickVariant('tee', tee.x, tee.y),
          { constructionProgress: 100, abandoned: false },
          tee.x,
          tee.y,
          teeScreen.screenX,
          teeScreen.screenY,
          img.naturalWidth || img.width,
          img.naturalHeight || img.height,
          {},
          spritePack
        );
        if (teeInfo?.coords) {
          const { coords, positioning } = teeInfo;
          ctx.drawImage(
            img,
            coords.sx,
            coords.sy,
            coords.sw,
            coords.sh,
            positioning.drawX,
            positioning.drawY,
            positioning.destWidth,
            positioning.destHeight
          );
        }
        const flagInfo = getSpriteRenderInfo(
          pickVariant('hole_flag', green.x, green.y),
          { constructionProgress: 100, abandoned: false },
          green.x,
          green.y,
          greenScreen.screenX,
          greenScreen.screenY,
          img.naturalWidth || img.width,
          img.naturalHeight || img.height,
          {},
          spritePack
        );
        if (flagInfo?.coords) {
          const { coords, positioning } = flagInfo;
          ctx.drawImage(
            img,
            coords.sx,
            coords.sy,
            coords.sw,
            coords.sh,
            positioning.drawX,
            positioning.drawY,
            positioning.destWidth,
            positioning.destHeight
          );
        }
      }
    }

    for (const golfer of state.golfers) {
      const hole = state.holes.find(h => h.id === golfer.holeId);
      if (!hole) continue;
      const pos = hole.tiles[golfer.pathIndex] ?? hole.tiles[0];
      const { screenX, screenY } = gridToScreen(pos.x, pos.y, offset.x, offset.y);
      const spriteName = golfer.state === 'teeing' ? 'golfer_swing' : golfer.state === 'playing' ? 'golfer_walk' : 'golfer_idle';
      const variantName = pickVariant(spriteName, pos.x, pos.y);
      const img = getCachedImage(spriteSheetSrc, false);
      if (img) {
        const renderInfo = getSpriteRenderInfo(
          variantName,
          { constructionProgress: 100, abandoned: false },
          pos.x,
          pos.y,
          screenX,
          screenY,
          img.naturalWidth || img.width,
          img.naturalHeight || img.height,
          {},
          spritePack
        );
        if (renderInfo?.coords) {
          const { coords, positioning } = renderInfo;
          ctx.drawImage(
            img,
            coords.sx,
            coords.sy,
            coords.sw,
            coords.sh,
            positioning.drawX,
            positioning.drawY,
            positioning.destWidth,
            positioning.destHeight
          );
        }
      }
    }

    if (selectedTile) {
      const { screenX, screenY } = gridToScreen(selectedTile.x, selectedTile.y, offset.x, offset.y);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screenX, screenY);
      ctx.lineTo(screenX + TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2);
      ctx.lineTo(screenX, screenY + TILE_HEIGHT);
      ctx.lineTo(screenX - TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2);
      ctx.closePath();
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  }, [state, offset, selectedTile, spritePack, spriteSheetSrc, imageLoadVersion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const { gridX, gridY } = screenToGrid(x, y, offset.x, offset.y);
      if (gridX < 0 || gridY < 0 || gridX >= state.gridSize || gridY >= state.gridSize) return;
      setSelectedTile({ x: gridX, y: gridY });

      if (state.selectedTool === 'bulldoze') {
        bulldozeTile(gridX, gridY);
        return;
      }

      if (state.selectedTool === 'hole_build' || state.selectedTool === 'hole_segment_straight') {
        addHoleSegment(gridX, gridY);
        return;
      }

      placeAtTile(gridX, gridY);
    };

    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [state.selectedTool, state.gridSize, offset, setSelectedTile, placeAtTile, bulldozeTile, addHoleSegment, state]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ touchAction: isMobile ? 'none' : 'manipulation' }}
    />
  );
}
