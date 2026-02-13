import { createContext, useContext, useState, useEffect } from 'react';

interface GolfCourseState {
  holes: string[];
  maintenanceCost: number;
  playerSatisfaction: number;
  courseRating: number;
  clubhouseBuilt: boolean;
  drivingRangeBuilt: boolean;
}

interface GolfContextType {
  golfState: GolfCourseState;
  updateGolfState: (updates: Partial<GolfCourseState>) => void;
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
  });

  const updateGolfState = (updates: Partial<GolfCourseState>) => {
    setGolfState(prev => ({ ...prev, ...updates }));
  };

  return (
    <GolfContext.Provider value={{ golfState, updateGolfState }}>
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
