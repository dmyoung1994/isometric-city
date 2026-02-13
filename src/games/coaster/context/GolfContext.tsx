import { createContext, useContext, useState, useEffect } from 'react';

interface GolfCourseState {
  holes: HoleType[];
  maintenanceCost: number;
  playerSatisfaction: number;
  courseRating: number;
  clubhouseBuilt: boolean;
  drivingRangeBuilt: boolean;
  balls: GolfBall[];
  // Removed Player[] and related logic
}

interface GolfContextType {
  golfState: GolfCourseState;
  updateGolfState: (updates: Partial<GolfCourseState>) => void;
  addBall: (x: number, y: number) => void;
  hitBall: (ballId: string, power: number, direction: number) => void;
  // Removed addPlayer and related logic
}

const GolfContext = createContext<GolfContextType | undefined>(undefined);

export const GolfProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [golfState, setGolfState] = useState<GolfCourseState>({
    holes: ['par3', 'par4', 'par5'],
    maintenanceCost: 1000,
    playerSatisfaction: 85,
    courseRating: 7.5,
    clubhouseBuilt: false,
    drivingRangeBuilt: false,
    balls: [],
  });

  const updateGolfState = (updates: Partial<GolfCourseState>) => {
    setGolfState(prev => ({ ...prev, ...updates }));
  };

  const addBall = (x: number, y: number) => {
    const newBall: GolfBall = {
      id: `ball-${Date.now()}`,
      x,
      y,
      velocityX: 0,
      velocityY: 0,
      isOnGround: true,
      isStuck: false,
    };
    updateGolfState({ balls: [...golfState.balls, newBall] });
  };

  const hitBall = (ballId: string, power: number, direction: number) => {
    const ball = golfState.balls.find(b => b.id === ballId);
    if (!ball) return;

    const angle = direction * Math.PI / 180;
    const velocityX = Math.cos(angle) * power;
    const velocityY = Math.sin(angle) * power;

    updateGolfState({
      balls: golfState.balls.map(b =>
        b.id === ballId
          ? { ...b, velocityX, velocityY, isOnGround: false }
          : b
      ),
    });
  };

  return (
    <GolfContext.Provider value={{ golfState, updateGolfState, addBall, hitBall }}>
      {children}
    </GolfContext.Provider>
  );
};

export const useGolf = () => {
  const context = useContext(GolfContext);
  if (!context) {
    throw new Error('useGolf must be used within a GolfProvider');
  }
  return context;
};
