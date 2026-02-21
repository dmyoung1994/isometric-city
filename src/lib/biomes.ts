import { ZoneType } from '@/types/game';

export type TileColorScheme = {
  top: string;
  left: string;
  right: string;
  stroke: string;
};

export type BiomeColors = {
  zoneColors: Record<ZoneType, TileColorScheme>;
  zoneBorderColors: Record<ZoneType, string>;
  greyTileColors: TileColorScheme;
  beachColors: { fill: string; curb: string };
  foundationColors: TileColorScheme;
  waterBaseColors: TileColorScheme;
};

export type BiomeTerrainConfig = {
  treeNoiseThreshold: number;
  treeChance: number;
  nearWaterTreeChance: number;
  lakeCountRange: [number, number];
  lakeSizeRange: [number, number];
  oceanChance: number;
  oceanDepthMultiplier: number;
};

export type BiomeId = 'temperate' | 'desert' | 'swamp' | 'forest' | 'hills';

export type BiomeConfig = {
  id: BiomeId;
  name: string;
  description: string;
  colors: BiomeColors;
  terrain: BiomeTerrainConfig;
};

const TEMPERATE_COLORS: BiomeColors = {
  zoneColors: {
    none: { top: '#4a7c3f', left: '#3d6634', right: '#5a8f4f', stroke: '#2d4a26' },
    residential: { top: '#2d5a2d', left: '#1d4a1d', right: '#3d6a3d', stroke: '#22c55e' },
    commercial: { top: '#2a4a6a', left: '#1a3a5a', right: '#3a5a7a', stroke: '#3b82f6' },
    industrial: { top: '#6a4a2a', left: '#5a3a1a', right: '#7a5a3a', stroke: '#f59e0b' },
  },
  zoneBorderColors: {
    none: 'transparent',
    residential: '#22c55e',
    commercial: '#3b82f6',
    industrial: '#f59e0b',
  },
  greyTileColors: { top: '#6b7280', left: '#4b5563', right: '#9ca3af', stroke: '#374151' },
  beachColors: { fill: '#d4a574', curb: '#b8956a' },
  foundationColors: { top: '#a67c52', left: '#8b6914', right: '#c4a35a', stroke: '#6b4423' },
  waterBaseColors: { top: '#2563eb', left: '#1d4ed8', right: '#3b82f6', stroke: '#1e3a8a' },
};

const BIOMES: BiomeConfig[] = [
  {
    id: 'temperate',
    name: 'Temperate',
    description: 'Balanced climate with lakes and mixed forests.',
    colors: TEMPERATE_COLORS,
    terrain: {
      treeNoiseThreshold: 0.72,
      treeChance: 0.35,
      nearWaterTreeChance: 0.3,
      lakeCountRange: [2, 3],
      lakeSizeRange: [40, 80],
      oceanChance: 0.4,
      oceanDepthMultiplier: 1,
    },
  },
  {
    id: 'desert',
    name: 'Desert',
    description: 'Sparse vegetation, sandy soil, and rare water.',
    colors: {
      zoneColors: {
        none: { top: '#caa46b', left: '#b08c57', right: '#d8b57a', stroke: '#9a7a4b' },
        residential: { top: '#b48e5b', left: '#9d7a4e', right: '#c8a06a', stroke: '#f59e0b' },
        commercial: { top: '#a47c4a', left: '#8b653d', right: '#b88d58', stroke: '#f97316' },
        industrial: { top: '#8f6a3e', left: '#7a5935', right: '#a77a4a', stroke: '#f59e0b' },
      },
      zoneBorderColors: {
        none: 'transparent',
        residential: '#f59e0b',
        commercial: '#f97316',
        industrial: '#f59e0b',
      },
      greyTileColors: { top: '#7b7568', left: '#656057', right: '#9a9485', stroke: '#4b4a45' },
      beachColors: { fill: '#e0c08a', curb: '#caa46b' },
      foundationColors: { top: '#c9a46b', left: '#b08c57', right: '#e2bf83', stroke: '#8f6a3e' },
      waterBaseColors: { top: '#1d4ed8', left: '#1e40af', right: '#3b82f6', stroke: '#1e3a8a' },
    },
    terrain: {
      treeNoiseThreshold: 0.78,
      treeChance: 0.15,
      nearWaterTreeChance: 0.2,
      lakeCountRange: [1, 2],
      lakeSizeRange: [25, 50],
      oceanChance: 0.2,
      oceanDepthMultiplier: 0.7,
    },
  },
  {
    id: 'swamp',
    name: 'Swamp',
    description: 'Wetlands with dense water pockets and reeds.',
    colors: {
      zoneColors: {
        none: { top: '#3f5c3b', left: '#314a2f', right: '#4d6f47', stroke: '#22361f' },
        residential: { top: '#2f4f2c', left: '#263d25', right: '#3a6236', stroke: '#22c55e' },
        commercial: { top: '#2b4a3f', left: '#223b32', right: '#375a4a', stroke: '#38bdf8' },
        industrial: { top: '#5a4a2f', left: '#4a3b26', right: '#6b5c3a', stroke: '#f59e0b' },
      },
      zoneBorderColors: {
        none: 'transparent',
        residential: '#22c55e',
        commercial: '#38bdf8',
        industrial: '#f59e0b',
      },
      greyTileColors: { top: '#5a6157', left: '#474f46', right: '#717a6f', stroke: '#374151' },
      beachColors: { fill: '#8f7a4e', curb: '#7a663f' },
      foundationColors: { top: '#8b6f4a', left: '#6f5738', right: '#a88758', stroke: '#5a452c' },
      waterBaseColors: { top: '#1e3a8a', left: '#1e40af', right: '#2563eb', stroke: '#172554' },
    },
    terrain: {
      treeNoiseThreshold: 0.68,
      treeChance: 0.5,
      nearWaterTreeChance: 0.45,
      lakeCountRange: [3, 5],
      lakeSizeRange: [30, 70],
      oceanChance: 0.35,
      oceanDepthMultiplier: 1.1,
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Dense tree cover and richer soil.',
    colors: {
      zoneColors: {
        none: { top: '#3f6b38', left: '#2f532a', right: '#4f7d46', stroke: '#1f3b1c' },
        residential: { top: '#2f5a2a', left: '#234421', right: '#3f6f36', stroke: '#16a34a' },
        commercial: { top: '#2b4a6a', left: '#20395a', right: '#3b5e7a', stroke: '#3b82f6' },
        industrial: { top: '#6b4f2d', left: '#5a4125', right: '#7d5d3a', stroke: '#f59e0b' },
      },
      zoneBorderColors: {
        none: 'transparent',
        residential: '#16a34a',
        commercial: '#3b82f6',
        industrial: '#f59e0b',
      },
      greyTileColors: { top: '#6b7280', left: '#4b5563', right: '#9ca3af', stroke: '#374151' },
      beachColors: { fill: '#c8b07a', curb: '#b89a66' },
      foundationColors: { top: '#8f6d4d', left: '#6f533b', right: '#a98461', stroke: '#5a3f2c' },
      waterBaseColors: { top: '#1d4ed8', left: '#1e40af', right: '#3b82f6', stroke: '#1e3a8a' },
    },
    terrain: {
      treeNoiseThreshold: 0.65,
      treeChance: 0.6,
      nearWaterTreeChance: 0.5,
      lakeCountRange: [2, 4],
      lakeSizeRange: [35, 75],
      oceanChance: 0.35,
      oceanDepthMultiplier: 1,
    },
  },
  {
    id: 'hills',
    name: 'Hills',
    description: 'Rocky ground with scattered trees and cool tones.',
    colors: {
      zoneColors: {
        none: { top: '#5a734a', left: '#4a5f3d', right: '#6b8560', stroke: '#36452f' },
        residential: { top: '#48623f', left: '#3a5133', right: '#5a7250', stroke: '#22c55e' },
        commercial: { top: '#3a5463', left: '#2f4350', right: '#4a6a7a', stroke: '#3b82f6' },
        industrial: { top: '#6a5a3a', left: '#5a4c31', right: '#7a6a46', stroke: '#f59e0b' },
      },
      zoneBorderColors: {
        none: 'transparent',
        residential: '#22c55e',
        commercial: '#3b82f6',
        industrial: '#f59e0b',
      },
      greyTileColors: { top: '#6b7280', left: '#4b5563', right: '#9ca3af', stroke: '#374151' },
      beachColors: { fill: '#bfa77a', curb: '#a89269' },
      foundationColors: { top: '#8a7a5c', left: '#6f6148', right: '#a89269', stroke: '#5a4c37' },
      waterBaseColors: { top: '#1d4ed8', left: '#1e40af', right: '#3b82f6', stroke: '#1e3a8a' },
    },
    terrain: {
      treeNoiseThreshold: 0.72,
      treeChance: 0.35,
      nearWaterTreeChance: 0.3,
      lakeCountRange: [1, 3],
      lakeSizeRange: [30, 65],
      oceanChance: 0.3,
      oceanDepthMultiplier: 0.9,
    },
  },
];

export const DEFAULT_BIOME_ID: BiomeId = 'temperate';

export function getBiome(id: BiomeId): BiomeConfig {
  return BIOMES.find((biome) => biome.id === id) ?? BIOMES[0];
}

export function listBiomes(): BiomeConfig[] {
  return BIOMES;
}

let _activeBiome: BiomeConfig = getBiome(DEFAULT_BIOME_ID);

export function setActiveBiome(id: BiomeId): void {
  _activeBiome = getBiome(id);
}

export function getActiveBiome(): BiomeConfig {
  return _activeBiome;
}

export { BIOMES };
