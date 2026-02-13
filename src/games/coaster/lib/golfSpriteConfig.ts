import { SpriteSheet, SpriteMapping } from '@/games/coaster/lib/coasterRenderConfig';

export const GOLF_SPRITE_SHEETS: SpriteSheet[] = [
  {
    id: 'golf_course',
    src: '/assets/golf/golf_course.webp',
    cols: 5,
    rows: 6,
    sprites: [
      {
        name: 'fairway',
        row: 0,
        col: 0,
        offsetY: -10,
        scale: 0.8,
      },
      {
        name: 'green',
        row: 0,
        col: 1,
        offsetY: -10,
        scale: 0.8,
      },
      {
        name: 'sand_trap',
        row: 0,
        col: 2,
        offsetY: -10,
        scale: 0.8,
      },
      {
        name: 'water_hazard',
        row: 0,
        col: 3,
        offsetY: -10,
        scale: 0.8,
      },
      {
        name: 'tee_box',
        row: 0,
        col: 4,
        offsetY: -10,
        scale: 0.8,
      },
    ],
  },
];
