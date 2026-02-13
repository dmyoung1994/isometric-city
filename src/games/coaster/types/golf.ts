export type GolfCourseElement = 
  | 'clubhouse' 
  | 'driving_range' 
  | 'fairway' 
  | 'green' 
  | 'sand_trap' 
  | 'water_hazard' 
  | 'tee_box' 
  | 'path';

export type HoleType = 'par3' | 'par4' | 'par5';

export interface GolfBall {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isOnGround: boolean;
  isStuck: boolean;
}

export interface Player {
  id: string;
  name: string;
  positionX: number;
  positionY: number;
  score: number;
  strokes: number;
}

export interface GolfCourseState {
  holes: HoleType[];
  maintenanceCost: number;
  playerSatisfaction: number;
  courseRating: number;
  balls: GolfBall[];
  players: Player[];
}
