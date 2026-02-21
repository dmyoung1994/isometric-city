import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const defaultInputDir = path.join(repoRoot, 'public', 'assets', 'golf', 'parts');
const defaultOutputPath = path.join(repoRoot, 'public', 'assets', 'golf', 'golf_course.svg');
const defaultManifestPath = path.join(repoRoot, 'public', 'assets', 'golf', 'parts', 'manifest.json');
const defaultMetaOutputPath = path.join(repoRoot, 'src', 'lib', 'golfSpriteSheet.ts');

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (arg.startsWith('--')) {
    const [key, value] = arg.split('=');
    args.set(key, value ?? process.argv[i + 1]);
    if (!arg.includes('=') && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) {
      i += 1;
    }
  }
}

const inputDir = args.get('--input') ?? defaultInputDir;
const outputPath = args.get('--output') ?? defaultOutputPath;
const manifestPath = args.get('--manifest') ?? defaultManifestPath;
const metaOutputPath = args.get('--meta') ?? defaultMetaOutputPath;
const cellSize = Number(args.get('--cell')) || 128;
const sheetCols = Number(args.get('--cols')) || 6;

const BASE_ORDER = [
  'fairway', 'green', 'tee', 'rough', 'sand', 'water',
  'cart_path', 'hole_flag', 'golf_ball', 'golfer_idle', 'golfer_walk', 'golfer_swing',
  'clubhouse_l1', 'driving_range_l1', 'maintenance_shed_l1', 'practice_green_l1', 'pro_shop_l1', 'restaurant_l1',
  'clubhouse_l2', 'driving_range_l2', 'maintenance_shed_l2', 'practice_green_l2', 'pro_shop_l2', 'restaurant_l2',
  'clubhouse_l3', 'driving_range_l3', 'maintenance_shed_l3', 'practice_green_l3', 'pro_shop_l3', 'restaurant_l3',
];

async function loadManifest(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const json = JSON.parse(raw);
    return json.variants || {};
  } catch {
    return {};
  }
}

function expandVariants(baseSprites, variantsMap) {
  const expanded = [];
  const variantNames = {};

  for (const name of baseSprites) {
    const count = Math.max(1, Number(variantsMap[name] || 1));
    const names = [];
    names.push(name);
    expanded.push({ name });
    for (let idx = 2; idx <= count; idx += 1) {
      const variantName = `${name}__v${idx}`;
      names.push(variantName);
      expanded.push({ name: variantName });
    }
    if (count > 1) {
      variantNames[name] = names;
    }
  }

  return { expanded, variantNames };
}

async function loadFileBase64(filePath) {
  const data = await fs.readFile(filePath);
  return data.toString('base64');
}

function buildSvg({ cols, rows, sprites, images }) {
  const width = cols * cellSize;
  const height = rows * cellSize;

  const lines = [];
  lines.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  lines.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">`
  );

  for (const sprite of sprites) {
    const x = sprite.col * cellSize;
    const y = sprite.row * cellSize;
    const href = images.get(sprite.name);
    if (!href) continue;
    lines.push(
      `  <image href="${href}" x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" />`
    );
  }

  lines.push(`</svg>`);
  return lines.join('\n');
}

async function main() {
  const variantsMap = await loadManifest(manifestPath);
  const { expanded, variantNames } = expandVariants(BASE_ORDER, variantsMap);
  const rows = Math.ceil(expanded.length / sheetCols);

  const images = new Map();
  for (const sprite of expanded) {
    const baseMatch = sprite.name.match(/^(.*)__v(\d+)$/);
    const pngPath = baseMatch
      ? path.join(inputDir, 'variants', baseMatch[1], `v${baseMatch[2]}.png`)
      : path.join(inputDir, `${sprite.name}.png`);
    const svgPath = baseMatch
      ? path.join(inputDir, 'variants', baseMatch[1], `v${baseMatch[2]}.svg`)
      : path.join(inputDir, `${sprite.name}.svg`);
    try {
      let base64;
      if (await fs.access(pngPath).then(() => true).catch(() => false)) {
        base64 = await loadFileBase64(pngPath);
        images.set(sprite.name, `data:image/png;base64,${base64}`);
      } else {
        base64 = await loadFileBase64(svgPath);
        images.set(sprite.name, `data:image/svg+xml;base64,${base64}`);
      }
    } catch (error) {
      throw new Error(`Missing or unreadable sprite: ${pngPath} (or ${svgPath})`);
    }
  }

  const placedSprites = expanded.map((sprite, index) => {
    const row = Math.floor(index / sheetCols);
    const col = index % sheetCols;
    return { name: sprite.name, row, col };
  });

  const svg = buildSvg({ cols: sheetCols, rows, sprites: placedSprites, images });
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, svg, 'utf8');

  const spriteOrder = placedSprites.map(sprite => sprite.name);
  const buildings = placedSprites.reduce((acc, sprite) => {
    acc[sprite.name] = { row: sprite.row, col: sprite.col };
    return acc;
  }, {});

  const metaLines = [];
  metaLines.push('// Auto-generated by scripts/build-golf-sprite-sheet.mjs');
  metaLines.push(`export const GOLF_SPRITE_COLS = ${sheetCols};`);
  metaLines.push(`export const GOLF_SPRITE_ROWS = ${rows};`);
  metaLines.push(`export const GOLF_SPRITE_ORDER = ${JSON.stringify(spriteOrder, null, 2)} as const;`);
  metaLines.push(`export const GOLF_SPRITE_BUILDINGS = ${JSON.stringify(buildings, null, 2)} as const;`);
  metaLines.push(`export const GOLF_SPRITE_VARIANTS = ${JSON.stringify(variantNames, null, 2)} as const;`);
  metaLines.push('');

  await fs.writeFile(metaOutputPath, metaLines.join('\n'), 'utf8');

  console.log(`Built golf sprite sheet: ${outputPath}`);
  console.log(`Sprites placed: ${placedSprites.length}`);
  console.log(`Metadata written: ${metaOutputPath}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
