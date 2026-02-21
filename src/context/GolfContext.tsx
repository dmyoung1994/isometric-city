'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  GameState,
  Tile,
  Tool,
  TOOL_INFO,
  createEmptyTile,
  Finances,
} from '@/games/golf/types/game';
import { WeatherState, WeatherType, WEATHER_EFFECTS, WEATHER_TRANSITIONS, getSeasonalWeatherBias } from '@/games/golf/types/economy';
import { Facility, FacilityType, GolfHole, MaintenanceCrew, TerrainType } from '@/games/golf/types/entities';
import {
  GOLF_AUTOSAVE_KEY,
  loadGolfStateFromStorage,
  saveGolfStateToStorage,
} from '@/games/golf/saveUtils';

const DEFAULT_GRID_SIZE = 60;
const SPEED_TICK_INTERVALS = [0, 120, 60, 30] as const; // ms per tick
const WEATHER_CHANGE_MIN_TICKS = 140;
const WEATHER_CHANGE_MAX_TICKS = 260;

function createInitialWeather(month: number): WeatherState {
  const initialWeather = pickNextWeather('sunny', month);
  return {
    current: initialWeather,
    temperature: getTemperatureForWeather(initialWeather, month),
    nextChange: Math.floor(Math.random() * (WEATHER_CHANGE_MAX_TICKS - WEATHER_CHANGE_MIN_TICKS)) + WEATHER_CHANGE_MIN_TICKS,
    forecast: [
      pickNextWeather(initialWeather, month),
      pickNextWeather(initialWeather, month),
      pickNextWeather(initialWeather, month),
    ],
  };
}

function pickNextWeather(current: WeatherType, month: number): WeatherType {
  const transitions = WEATHER_TRANSITIONS[current];
  const seasonBias = getSeasonalWeatherBias(month);
  const options: { weather: WeatherType; weight: number }[] = [];
  for (const [weather, baseWeight] of Object.entries(transitions)) {
    const bias = seasonBias[weather as WeatherType] ?? 1.0;
    options.push({ weather: weather as WeatherType, weight: (baseWeight ?? 0) * bias });
  }
  const totalWeight = options.reduce((sum, o) => sum + o.weight, 0);
  const random = Math.random() * totalWeight;
  let cumulative = 0;
  for (const option of options) {
    cumulative += option.weight;
    if (random <= cumulative) {
      return option.weather;
    }
  }
  return options[options.length - 1]?.weather ?? 'sunny';
}

function getTemperatureForWeather(weather: WeatherType, month: number): number {
  let baseTemp: number;
  if (month >= 6 && month <= 8) baseTemp = 28;
  else if (month >= 3 && month <= 5) baseTemp = 18;
  else if (month >= 9 && month <= 11) baseTemp = 14;
  else baseTemp = 5;

  switch (weather) {
    case 'hot': return baseTemp + 8 + Math.random() * 5;
    case 'sunny': return baseTemp + 3 + Math.random() * 3;
    case 'partly_cloudy': return baseTemp + Math.random() * 2;
    case 'cloudy': return baseTemp - 2 + Math.random() * 2;
    case 'rain': return baseTemp - 4 + Math.random() * 2;
    case 'storm': return baseTemp - 5 + Math.random() * 3;
    case 'cold': return baseTemp - 10 + Math.random() * 3;
    default: return baseTemp;
  }
}

function simulateWeather(weather: WeatherState, tick: number, month: number): WeatherState {
  if (tick < weather.nextChange) return weather;
  const newWeather = weather.forecast[0];
  const nextChangeIn = Math.floor(Math.random() * (WEATHER_CHANGE_MAX_TICKS - WEATHER_CHANGE_MIN_TICKS)) + WEATHER_CHANGE_MIN_TICKS;
  const newForecast = [
    weather.forecast[1],
    weather.forecast[2],
    pickNextWeather(newWeather, month),
  ];

  return {
    current: newWeather,
    temperature: getTemperatureForWeather(newWeather, month),
    nextChange: tick + nextChangeIn,
    forecast: newForecast,
  };
}

function createGrid(size: number): Tile[][] {
  const grid: Tile[][] = [];
  for (let y = 0; y < size; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < size; x++) {
      row.push(createEmptyTile(x, y));
    }
    grid.push(row);
  }
  return grid;
}

function baseFacilities(): Facility[] {
  return [
    { type: 'clubhouse', built: true, level: 1, capacityBoost: 10, satisfactionBoost: 6, maintenanceCost: 400 },
    { type: 'driving_range', built: true, level: 1, capacityBoost: 6, satisfactionBoost: 4, maintenanceCost: 250 },
    { type: 'maintenance_shed', built: true, level: 1, capacityBoost: 0, satisfactionBoost: 0, maintenanceCost: 300 },
    { type: 'pro_shop', built: false, level: 0, capacityBoost: 8, satisfactionBoost: 5, maintenanceCost: 350 },
    { type: 'restaurant', built: false, level: 0, capacityBoost: 12, satisfactionBoost: 8, maintenanceCost: 500 },
    { type: 'practice_green', built: false, level: 0, capacityBoost: 5, satisfactionBoost: 3, maintenanceCost: 200 },
    { type: 'caddie_shack', built: false, level: 0, capacityBoost: 4, satisfactionBoost: 2, maintenanceCost: 150 },
  ];
}

function createInitialFinances(): Finances {
  return { cash: 250000, income: 0, expenses: 0 };
}

function createInitialCrews(): MaintenanceCrew[] {
  return [
    { id: `crew-${Date.now()}`, level: 1, efficiency: 0.4, fatigue: 0, assignedHoleIds: [], trainingProgress: 0 },
  ];
}

function createInitialGolfGameState(courseName = 'My Golf Course', gridSize = DEFAULT_GRID_SIZE): GameState {
  const initialWeather = createInitialWeather(6);
  return {
    id: `golf-${Date.now()}`,
    courseName,
    grid: createGrid(gridSize),
    gridSize,
    year: 2026,
    month: 6,
    day: 1,
    hour: 8,
    minute: 0,
    tick: 0,
    speed: 1,
    weather: initialWeather,
    finances: createInitialFinances(),
    satisfaction: 70,
    courseRating: 4.5,
    holes: [],
    golfers: [],
    maintenanceCrews: createInitialCrews(),
    facilities: baseFacilities(),
    selectedTool: 'select',
    activePanel: 'none',
    notifications: [],
    buildingHoleId: null,
    buildingHolePath: [],
    buildingHoleLastDirection: null,
    gameVersion: 1,
  };
}

function getParForLength(length: number): 3 | 4 | 5 {
  if (length <= 8) return 3;
  if (length <= 14) return 4;
  return 5;
}

function getTerrainForTool(tool: Tool): TerrainType | null {
  switch (tool) {
    case 'terrain_fairway': return 'fairway';
    case 'terrain_green': return 'green';
    case 'terrain_tee': return 'grass';
    case 'terrain_rough': return 'rough';
    case 'terrain_sand': return 'sand';
    case 'terrain_water': return 'water';
    case 'terrain_cart_path': return 'cart_path';
    default: return null;
  }
}

function toolToFacility(tool: Tool): FacilityType | null {
  switch (tool) {
    case 'facility_clubhouse': return 'clubhouse';
    case 'facility_driving_range': return 'driving_range';
    case 'facility_pro_shop': return 'pro_shop';
    case 'facility_restaurant': return 'restaurant';
    case 'facility_practice_green': return 'practice_green';
    case 'facility_caddie_shack': return 'caddie_shack';
    case 'facility_maintenance_shed': return 'maintenance_shed';
    default: return null;
  }
}

function calculateCourseRating(holes: GolfHole[], facilities: Facility[], avgGrassHealth: number, grid: Tile[][]): number {
  const holeScore = Math.min(10, holes.length / 2);
  const facilityScore = facilities.filter(f => f.built).reduce((sum, f) => sum + f.level * 0.6, 0);
  let hazardScore = 0;
  for (const hole of holes) {
    for (const pos of hole.tiles) {
      const terrain = grid[pos.y]?.[pos.x]?.terrain;
      if (terrain === 'sand' || terrain === 'water') hazardScore += 0.03;
    }
  }
  const grassScore = avgGrassHealth / 20;
  return Math.max(1, Math.min(10, holeScore + facilityScore + grassScore + hazardScore));
}

function averageGrassHealth(grid: Tile[][]): number {
  let total = 0;
  let count = 0;
  for (const row of grid) {
    for (const tile of row) {
      if (tile.terrain === 'fairway' || tile.terrain === 'green' || tile.terrain === 'rough' || tile.terrain === 'grass') {
        total += tile.grassHealth;
        count += 1;
      }
    }
  }
  return count > 0 ? total / count : 100;
}

interface GolfContextValue {
  state: GameState;
  isStateReady: boolean;
  setTool: (tool: Tool) => void;
  setSpeed: (speed: 0 | 1 | 2 | 3) => void;
  setActivePanel: (panel: GameState['activePanel']) => void;
  startHoleBuild: () => void;
  addHoleSegment: (x: number, y: number) => void;
  finishHoleBuild: () => void;
  cancelHoleBuild: () => void;
  placeAtTile: (x: number, y: number) => void;
  bulldozeTile: (x: number, y: number) => void;
  hireCrew: () => void;
  trainCrew: (crewId: string) => void;
  buildFacility: (facility: FacilityType) => void;
  upgradeFacility: (facility: FacilityType) => void;
  newGame: (name?: string, size?: number) => void;
  loadState: (stateString: string) => boolean;
  exportState: () => string;
}

const GolfContext = createContext<GolfContextValue | null>(null);

export function GolfProvider({ children, startFresh }: { children: React.ReactNode; startFresh?: boolean }) {
  const [state, setState] = useState<GameState>(() => createInitialGolfGameState());
  const [isStateReady, setIsStateReady] = useState(false);
  const tickRef = useRef(0);
  const spawnCooldownRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!startFresh) {
      const saved = loadGolfStateFromStorage(GOLF_AUTOSAVE_KEY);
      if (saved) {
        setState(saved);
      }
    }
    setIsStateReady(true);
  }, [startFresh]);

  useEffect(() => {
    if (!isStateReady) return;
    const interval = SPEED_TICK_INTERVALS[state.speed];
    if (interval === 0) return;

    const timer = window.setInterval(() => {
      setState(prev => {
        const nextTick = prev.tick + 1;
        tickRef.current = nextTick;
        const nextMinute = (prev.minute + 10) % 60;
        const minuteCarry = prev.minute + 10 >= 60;
        const nextHour = (prev.hour + (minuteCarry ? 1 : 0)) % 24;
        const hourCarry = prev.hour + (minuteCarry ? 1 : 0) >= 24;
        const nextDay = prev.day + (hourCarry ? 1 : 0);
        const nextMonth = prev.month + (nextDay > 30 ? 1 : 0);
        const nextYear = prev.year + (nextMonth > 12 ? 1 : 0);

        const timeUpdated: GameState = {
          ...prev,
          tick: nextTick,
          minute: nextMinute,
          hour: nextHour,
          day: nextDay > 30 ? 1 : nextDay,
          month: nextMonth > 12 ? 1 : nextMonth,
          year: nextYear,
        };

        const weather = simulateWeather(timeUpdated.weather, nextTick, timeUpdated.month);
        const weatherEffect = WEATHER_EFFECTS[weather.current];

        const grid = timeUpdated.grid.map(row => row.map(tile => {
          if (tile.terrain === 'sand' || tile.terrain === 'water' || tile.terrain === 'cart_path') {
            return tile;
          }
          const targetHeight = tile.terrain === 'green' ? 22
            : tile.terrain === 'fairway' ? 28
            : tile.terrain === 'rough' ? 55
            : 40;
          const growthRate = 0.2 * weatherEffect.grassGrowthModifier;
          let grassHeight = tile.grassHeight;
          let grassHealth = tile.grassHealth;
          if (grassHeight < targetHeight) {
            grassHeight = Math.min(targetHeight, grassHeight + growthRate);
          } else if (grassHeight > targetHeight + 8) {
            grassHealth = Math.max(40, grassHealth - 0.15);
          }
          return { ...tile, grassHeight, grassHealth };
        }));

        const holesById = new Map(timeUpdated.holes.map(h => [h.id, h]));
        const updatedCrews = timeUpdated.maintenanceCrews.map(crew => {
          let assigned = crew.assignedHoleIds[0];
          if (!assigned && timeUpdated.holes.length > 0) {
            assigned = timeUpdated.holes[0].id;
          }
          if (!assigned) return crew;
          const hole = holesById.get(assigned);
          if (!hole) return crew;
          const efficiency = Math.max(0.25, crew.efficiency + crew.level * 0.05);
          for (const tilePos of hole.tiles) {
            const tile = grid[tilePos.y]?.[tilePos.x];
            if (!tile) continue;
            if (tile.terrain === 'fairway' || tile.terrain === 'green' || tile.terrain === 'rough' || tile.terrain === 'grass') {
              tile.grassHeight = Math.max(18, tile.grassHeight - efficiency * 0.4);
              tile.grassHealth = Math.min(100, tile.grassHealth + efficiency * 0.2);
            }
          }
          return { ...crew, fatigue: Math.min(100, crew.fatigue + 0.05), assignedHoleIds: assigned ? [assigned] : crew.assignedHoleIds };
        });

        const updatedGolfers = timeUpdated.golfers.map(group => {
          const hole = holesById.get(group.holeId);
          if (!hole) return group;
          if (group.state === 'finished') return group;
          if (nextTick < group.nextShotAt) return group;

          let newState = group.state;
          let ballIndex = group.ballIndex;
          let pathIndex = group.pathIndex;
          let strokes = group.strokes;
          let satisfaction = group.satisfaction;

          if (group.state === 'walking_to_tee') {
            newState = 'teeing';
            pathIndex = 0;
            ballIndex = 0;
          } else if (group.state === 'teeing' || group.state === 'playing') {
            const currentTile = hole.tiles[ballIndex];
            const terrain = currentTile ? grid[currentTile.y][currentTile.x].terrain : 'fairway';
            const heightPenalty = terrain === 'rough' ? 1.5 : terrain === 'sand' ? 2.0 : terrain === 'green' ? 0.5 : 1.0;
            const shotLength = Math.max(1, Math.round((2 + group.skill / 30) / heightPenalty));
            ballIndex = Math.min(hole.tiles.length - 1, ballIndex + shotLength);
            pathIndex = ballIndex;
            strokes += 1;
            if (terrain === 'sand' || terrain === 'water') {
              satisfaction = Math.max(20, satisfaction - 4);
            }
            newState = ballIndex >= hole.tiles.length - 1 ? 'putting' : 'playing';
          } else if (group.state === 'putting') {
            strokes += 1;
            newState = 'finished';
          }

          const nextShotAt = nextTick + Math.max(8, Math.round(20 * (1 / weatherEffect.playSpeedModifier)));
          return { ...group, state: newState, pathIndex, ballIndex, strokes, satisfaction, nextShotAt };
        }).filter(g => g.state !== 'finished');

        const avgHealth = averageGrassHealth(grid);
        const rating = calculateCourseRating(timeUpdated.holes, timeUpdated.facilities, avgHealth, grid);
        const satisfaction = Math.max(30, Math.min(100, (timeUpdated.satisfaction + rating * 0.3 + weatherEffect.satisfactionModifier * 10) / 1.05));

        let golfers = updatedGolfers;
        if (timeUpdated.holes.length > 0 && spawnCooldownRef.current <= nextTick) {
          const spawnChance = 0.12 * weatherEffect.golferSpawnMultiplier * (rating / 8);
          if (Math.random() < spawnChance) {
            const hole = timeUpdated.holes[Math.floor(Math.random() * timeUpdated.holes.length)];
            golfers = [
              ...updatedGolfers,
              {
                id: `golfer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                holeId: hole.id,
                state: 'walking_to_tee',
                pathIndex: 0,
                ballIndex: 0,
                strokes: 0,
                skill: 40 + Math.random() * 50,
                satisfaction: 70 + Math.random() * 20,
                nextShotAt: nextTick + 8,
              },
            ];
            spawnCooldownRef.current = nextTick + 30;
          }
        }

        return {
          ...timeUpdated,
          weather,
          grid,
          maintenanceCrews: updatedCrews,
          golfers,
          courseRating: rating,
          satisfaction,
        };
      });
    }, interval);

    return () => window.clearInterval(timer);
  }, [isStateReady, state.speed]);

  useEffect(() => {
    if (!isStateReady) return;
    saveGolfStateToStorage(GOLF_AUTOSAVE_KEY, state);
  }, [state, isStateReady]);

  const setTool = useCallback((tool: Tool) => {
    setState(prev => ({ ...prev, selectedTool: tool }));
  }, []);

  const setSpeed = useCallback((speed: 0 | 1 | 2 | 3) => {
    setState(prev => ({ ...prev, speed }));
  }, []);

  const setActivePanel = useCallback((panel: GameState['activePanel']) => {
    setState(prev => ({ ...prev, activePanel: panel }));
  }, []);

  const startHoleBuild = useCallback(() => {
    setState(prev => ({
      ...prev,
      buildingHoleId: `hole-${Date.now()}`,
      buildingHolePath: [],
      buildingHoleLastDirection: null,
    }));
  }, []);

  const addHoleSegment = useCallback((x: number, y: number) => {
    setState(prev => {
      if (!prev.buildingHoleId) return prev;
      const path = prev.buildingHolePath;
      const last = path[path.length - 1];
      if (last) {
        const dx = Math.abs(last.x - x);
        const dy = Math.abs(last.y - y);
        if (dx + dy !== 1) return prev;
      }
      if (prev.grid[y]?.[x]?.holeId) return prev;

      const nextPath = [...path, { x, y }];
      const grid = prev.grid.map(row => row.map(tile => {
        if (tile.x === x && tile.y === y) {
          return { ...tile, terrain: 'fairway', holeId: prev.buildingHoleId };
        }
        return tile;
      }));

      return { ...prev, buildingHolePath: nextPath, grid };
    });
  }, []);

  const finishHoleBuild = useCallback(() => {
    setState(prev => {
      if (!prev.buildingHoleId || prev.buildingHolePath.length < 5) return prev;
      const path = prev.buildingHolePath;
      const teeTile = path[0];
      const greenTile = path[path.length - 1];
      const length = path.length;
      const par = getParForLength(length);
      const hazardCount = path.reduce((count, tilePos) => {
        const terrain = prev.grid[tilePos.y][tilePos.x].terrain;
        return terrain === 'sand' || terrain === 'water' ? count + 1 : count;
      }, 0);
      const hole: GolfHole = {
        id: prev.buildingHoleId,
        name: `Hole ${prev.holes.length + 1}`,
        tiles: path,
        teeTile,
        greenTile,
        par,
        length,
        difficulty: Math.min(10, 3 + hazardCount * 0.5 + length / 10),
        hazardCount,
      };

      const grid = prev.grid.map(row => row.map(tile => {
        if (tile.x === teeTile.x && tile.y === teeTile.y) {
          return { ...tile, terrain: 'fairway', holeId: hole.id };
        }
        if (tile.x === greenTile.x && tile.y === greenTile.y) {
          return { ...tile, terrain: 'green', holeId: hole.id };
        }
        return tile;
      }));

      return {
        ...prev,
        grid,
        holes: [...prev.holes, hole],
        buildingHoleId: null,
        buildingHolePath: [],
        buildingHoleLastDirection: null,
      };
    });
  }, []);

  const cancelHoleBuild = useCallback(() => {
    setState(prev => ({
      ...prev,
      buildingHoleId: null,
      buildingHolePath: [],
      buildingHoleLastDirection: null,
    }));
  }, []);

  const placeAtTile = useCallback((x: number, y: number) => {
    setState(prev => {
      const tool = prev.selectedTool;
      const terrain = getTerrainForTool(tool);
      const facility = toolToFacility(tool);
      const tile = prev.grid[y]?.[x];
      if (!tile) return prev;

      const cost = TOOL_INFO[tool]?.cost ?? 0;
      if (prev.finances.cash < cost) return prev;

      let grid = prev.grid.map(row => row.map(t => t));
      if (terrain) {
        grid = prev.grid.map(row => row.map(t => {
          if (t.x === x && t.y === y) {
            return { ...t, terrain, holeId: t.holeId };
          }
          return t;
        }));
      }

      let facilities = prev.facilities;
      if (facility) {
        const existing = prev.facilities.find(f => f.type === facility);
        if (existing?.built) return prev;
        facilities = prev.facilities.map(f => {
          if (f.type === facility) {
            return { ...f, built: true, level: 1 };
          }
          return f;
        });
        grid = prev.grid.map(row => row.map(t => {
          if (t.x === x && t.y === y) {
            return { ...t, facility };
          }
          return t;
        }));
      }

      return {
        ...prev,
        grid,
        facilities,
        finances: { ...prev.finances, cash: prev.finances.cash - cost },
      };
    });
  }, []);

  const bulldozeTile = useCallback((x: number, y: number) => {
    setState(prev => {
      const tile = prev.grid[y]?.[x];
      if (!tile) return prev;
      const grid = prev.grid.map(row => row.map(t => {
        if (t.x === x && t.y === y) {
          return { ...t, terrain: 'grass', holeId: null, facility: null };
        }
        return t;
      }));
      return { ...prev, grid };
    });
  }, []);

  const hireCrew = useCallback(() => {
    setState(prev => ({
      ...prev,
      maintenanceCrews: [
        ...prev.maintenanceCrews,
        {
          id: `crew-${Date.now()}`,
          level: 1,
          efficiency: 0.4,
          fatigue: 0,
          assignedHoleIds: [],
          trainingProgress: 0,
        },
      ],
      finances: { ...prev.finances, cash: prev.finances.cash - 2000 },
    }));
  }, []);

  const trainCrew = useCallback((crewId: string) => {
    setState(prev => ({
      ...prev,
      maintenanceCrews: prev.maintenanceCrews.map(crew => {
        if (crew.id !== crewId) return crew;
        const progress = crew.trainingProgress + 20;
        if (progress >= 100) {
          return {
            ...crew,
            level: Math.min(5, crew.level + 1),
            efficiency: Math.min(1, crew.efficiency + 0.1),
            trainingProgress: 0,
            fatigue: Math.max(0, crew.fatigue - 10),
          };
        }
        return { ...crew, trainingProgress: progress };
      }),
      finances: { ...prev.finances, cash: prev.finances.cash - 800 },
    }));
  }, []);

  const buildFacility = useCallback((facility: FacilityType) => {
    setState(prev => ({
      ...prev,
      facilities: prev.facilities.map(f => f.type === facility ? { ...f, built: true, level: 1 } : f),
    }));
  }, []);

  const upgradeFacility = useCallback((facility: FacilityType) => {
    setState(prev => ({
      ...prev,
      facilities: prev.facilities.map(f => {
        if (f.type !== facility) return f;
        if (!f.built) return f;
        return { ...f, level: Math.min(3, f.level + 1) };
      }),
    }));
  }, []);

  const newGame = useCallback((name?: string, size?: number) => {
    const fresh = createInitialGolfGameState(name ?? 'New Course', size ?? DEFAULT_GRID_SIZE);
    setState(fresh);
  }, []);

  const loadState = useCallback((stateString: string): boolean => {
    try {
      const parsed = JSON.parse(stateString) as GameState;
      if (!parsed.grid || !parsed.gridSize) return false;
      setState(parsed);
      return true;
    } catch {
      return false;
    }
  }, []);

  const exportState = useCallback(() => JSON.stringify(state), [state]);

  const value = useMemo<GolfContextValue>(() => ({
    state,
    isStateReady,
    setTool,
    setSpeed,
    setActivePanel,
    startHoleBuild,
    addHoleSegment,
    finishHoleBuild,
    cancelHoleBuild,
    placeAtTile,
    bulldozeTile,
    hireCrew,
    trainCrew,
    buildFacility,
    upgradeFacility,
    newGame,
    loadState,
    exportState,
  }), [
    state,
    isStateReady,
    setTool,
    setSpeed,
    setActivePanel,
    startHoleBuild,
    addHoleSegment,
    finishHoleBuild,
    cancelHoleBuild,
    placeAtTile,
    bulldozeTile,
    hireCrew,
    trainCrew,
    buildFacility,
    upgradeFacility,
    newGame,
    loadState,
    exportState,
  ]);

  return <GolfContext.Provider value={value}>{children}</GolfContext.Provider>;
}

export function useGolf() {
  const context = useContext(GolfContext);
  if (!context) {
    throw new Error('useGolf must be used within a GolfProvider');
  }
  return context;
}
