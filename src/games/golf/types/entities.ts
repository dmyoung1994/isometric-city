/**
 * IsoGolf Entities
 */

export type TerrainType = 'grass' | 'rough' | 'fairway' | 'green' | 'sand' | 'water' | 'cart_path';

export type FacilityType =
  | 'clubhouse'
  | 'driving_range'
  | 'pro_shop'
  | 'restaurant'
  | 'practice_green'
  | 'caddie_shack'
  | 'maintenance_shed';

export interface Facility {
  type: FacilityType;
  built: boolean;
  level: number; // 1-3
  capacityBoost: number;
  satisfactionBoost: number;
  maintenanceCost: number;
}

export interface GolfHole {
  id: string;
  name: string;
  tiles: { x: number; y: number }[];
  teeTile: { x: number; y: number };
  greenTile: { x: number; y: number };
  par: 3 | 4 | 5;
  length: number; // tiles
  difficulty: number; // 0-10
  hazardCount: number;
}

export type GolferState = 'walking_to_tee' | 'teeing' | 'playing' | 'putting' | 'finished';

export interface GolferGroup {
  id: string;
  holeId: string;
  state: GolferState;
  pathIndex: number;
  ballIndex: number;
  strokes: number;
  skill: number; // 0-100
  satisfaction: number; // 0-100
  nextShotAt: number;
}

export interface MaintenanceCrew {
  id: string;
  level: number; // 1-5
  efficiency: number; // 0-1
  fatigue: number; // 0-100
  assignedHoleIds: string[];
  trainingProgress: number;
}
