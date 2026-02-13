import { createContext, useContext, useState, useEffect } from 'react';

interface GolfCourseState {
  holes: HoleType[];
  maintenanceCost: number;
  playerSatisfaction: number;
  courseRating: number;
  clubhouseBuilt: boolean;
  drivingRangeBuilt: boolean;
  balls: GolfBall[];
  players: Player[];
}

interface GolfContextType {
  golfState: GolfCourseState;
  updateGolfState: (updates: Partial<GolfCourseState>) => void;
  addBall: (x: number, y: number) => void;
  hitBall: (ballId: string, power: number, direction: number) => void;
  addPlayer: (name: string, x: number, y: number) => void;
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
    players: [],
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

  const addPlayer = (name: string, x: number, y: number) => {
    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name,
      positionX: x,
      positionY: y,
      score: 0,
      strokes: 0,
    };
    updateGolfState({ players: [...golfState.players, newPlayer] });
  };

  return (
    <GolfContext.Provider value={{ golfState, updateGolfState, addBall, hitBall, addPlayer }}>
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
