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

export interface GolfCourseState {
  holes: HoleType[];
  maintenanceCost: number;
  playerSatisfaction: number;
  courseRating: number;
}
