/**
 * IsoGolf Game Types
 */

import { Facility, FacilityType, GolfHole, GolferGroup, MaintenanceCrew, TerrainType } from './entities';
import { WeatherState } from './economy';

export type Tool =
  | 'select'
  | 'bulldoze'
  | 'hole_build'
  | 'hole_segment_straight'
  | 'hole_turn_left'
  | 'hole_turn_right'
  | 'terrain_fairway'
  | 'terrain_green'
  | 'terrain_tee'
  | 'terrain_rough'
  | 'terrain_sand'
  | 'terrain_water'
  | 'terrain_cart_path'
  | 'facility_clubhouse'
  | 'facility_driving_range'
  | 'facility_pro_shop'
  | 'facility_restaurant'
  | 'facility_practice_green'
  | 'facility_caddie_shack'
  | 'facility_maintenance_shed';

export type ToolCategory = 'tools' | 'holes' | 'terrain' | 'facilities';

export interface ToolInfo {
  name: string;
  cost: number;
  description: string;
  category: ToolCategory;
}

export const TOOL_INFO: Record<Tool, ToolInfo> = {
  select: { name: 'Select', cost: 0, description: 'Inspect tiles', category: 'tools' },
  bulldoze: { name: 'Bulldoze', cost: 50, description: 'Remove terrain or facilities', category: 'tools' },
  hole_build: { name: 'Hole Builder', cost: 0, description: 'Start building a hole', category: 'holes' },
  hole_segment_straight: { name: 'Hole Segment', cost: 10, description: 'Add a fairway segment', category: 'holes' },
  hole_turn_left: { name: 'Hole Turn Left', cost: 10, description: 'Turn fairway left', category: 'holes' },
  hole_turn_right: { name: 'Hole Turn Right', cost: 10, description: 'Turn fairway right', category: 'holes' },
  terrain_fairway: { name: 'Fairway', cost: 8, description: 'Paint fairway grass', category: 'terrain' },
  terrain_green: { name: 'Green', cost: 12, description: 'Paint putting green', category: 'terrain' },
  terrain_tee: { name: 'Tee Box', cost: 10, description: 'Paint tee box', category: 'terrain' },
  terrain_rough: { name: 'Rough', cost: 6, description: 'Paint rough grass', category: 'terrain' },
  terrain_sand: { name: 'Sand Trap', cost: 12, description: 'Paint sand hazard', category: 'terrain' },
  terrain_water: { name: 'Water Hazard', cost: 14, description: 'Paint water hazard', category: 'terrain' },
  terrain_cart_path: { name: 'Cart Path', cost: 8, description: 'Paint cart path', category: 'terrain' },
  facility_clubhouse: { name: 'Clubhouse', cost: 12000, description: 'Main clubhouse', category: 'facilities' },
  facility_driving_range: { name: 'Driving Range', cost: 8000, description: 'Practice area', category: 'facilities' },
  facility_pro_shop: { name: 'Pro Shop', cost: 9000, description: 'Retail and rentals', category: 'facilities' },
  facility_restaurant: { name: 'Restaurant', cost: 14000, description: 'Food and drinks', category: 'facilities' },
  facility_practice_green: { name: 'Practice Green', cost: 7000, description: 'Putting practice', category: 'facilities' },
  facility_caddie_shack: { name: 'Caddie Shack', cost: 6000, description: 'Caddie services', category: 'facilities' },
  facility_maintenance_shed: { name: 'Maintenance Shed', cost: 5000, description: 'Grounds crew base', category: 'facilities' },
};

export interface Tile {
  x: number;
  y: number;
  terrain: TerrainType;
  holeId: string | null;
  grassHeight: number;
  grassHealth: number;
  facility: FacilityType | null;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  tileX?: number;
  tileY?: number;
}

export interface Finances {
  cash: number;
  income: number;
  expenses: number;
}

export interface GameState {
  id: string;
  courseName: string;
  grid: Tile[][];
  gridSize: number;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  tick: number;
  speed: 0 | 1 | 2 | 3;
  weather: WeatherState;
  finances: Finances;
  satisfaction: number;
  courseRating: number;
  holes: GolfHole[];
  golfers: GolferGroup[];
  maintenanceCrews: MaintenanceCrew[];
  facilities: Facility[];
  selectedTool: Tool;
  activePanel: 'none' | 'course' | 'staff' | 'facilities' | 'finances' | 'settings';
  notifications: Notification[];
  buildingHoleId: string | null;
  buildingHolePath: { x: number; y: number }[];
  buildingHoleLastDirection: 'north' | 'south' | 'east' | 'west' | null;
  gameVersion: number;
}

export function createEmptyTile(x: number, y: number): Tile {
  return {
    x,
    y,
    terrain: 'grass',
    holeId: null,
    grassHeight: 40,
    grassHealth: 100,
    facility: null,
  };
}
