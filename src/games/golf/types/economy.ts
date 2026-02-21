/**
 * IsoGolf Economy & Weather Types
 */

export type WeatherType = 'sunny' | 'partly_cloudy' | 'cloudy' | 'rain' | 'storm' | 'hot' | 'cold';

export interface WeatherState {
  current: WeatherType;
  temperature: number; // Celsius
  nextChange: number; // Tick when weather will change
  forecast: WeatherType[]; // Next 3 weather conditions
}

export interface WeatherEffects {
  golferSpawnMultiplier: number;
  satisfactionModifier: number;
  grassGrowthModifier: number;
  playSpeedModifier: number;
}

export const WEATHER_EFFECTS: Record<WeatherType, WeatherEffects> = {
  sunny: {
    golferSpawnMultiplier: 1.15,
    satisfactionModifier: 0.12,
    grassGrowthModifier: 1.05,
    playSpeedModifier: 1.05,
  },
  partly_cloudy: {
    golferSpawnMultiplier: 1.05,
    satisfactionModifier: 0.05,
    grassGrowthModifier: 1.0,
    playSpeedModifier: 1.0,
  },
  cloudy: {
    golferSpawnMultiplier: 1.0,
    satisfactionModifier: 0,
    grassGrowthModifier: 0.95,
    playSpeedModifier: 0.98,
  },
  rain: {
    golferSpawnMultiplier: 0.8,
    satisfactionModifier: -0.12,
    grassGrowthModifier: 1.15,
    playSpeedModifier: 0.9,
  },
  storm: {
    golferSpawnMultiplier: 0.6,
    satisfactionModifier: -0.2,
    grassGrowthModifier: 1.2,
    playSpeedModifier: 0.8,
  },
  hot: {
    golferSpawnMultiplier: 0.9,
    satisfactionModifier: -0.08,
    grassGrowthModifier: 1.1,
    playSpeedModifier: 0.95,
  },
  cold: {
    golferSpawnMultiplier: 0.85,
    satisfactionModifier: -0.06,
    grassGrowthModifier: 0.85,
    playSpeedModifier: 0.9,
  },
};

export const WEATHER_TRANSITIONS: Record<WeatherType, Partial<Record<WeatherType, number>>> = {
  sunny: { sunny: 0.6, partly_cloudy: 0.25, hot: 0.1, cloudy: 0.05 },
  partly_cloudy: { sunny: 0.4, partly_cloudy: 0.35, cloudy: 0.15, rain: 0.05, hot: 0.05 },
  cloudy: { cloudy: 0.25, partly_cloudy: 0.35, sunny: 0.2, rain: 0.15, cold: 0.05 },
  rain: { partly_cloudy: 0.35, cloudy: 0.35, rain: 0.2, storm: 0.05, sunny: 0.05 },
  storm: { rain: 0.3, cloudy: 0.4, partly_cloudy: 0.25, storm: 0.05 },
  hot: { sunny: 0.45, hot: 0.3, partly_cloudy: 0.2, storm: 0.05 },
  cold: { partly_cloudy: 0.35, cloudy: 0.3, cold: 0.2, sunny: 0.15 },
};

export function getSeasonalWeatherBias(month: number): Partial<Record<WeatherType, number>> {
  if (month >= 3 && month <= 5) {
    return { sunny: 1.2, partly_cloudy: 1.1, rain: 0.9, cloudy: 1.0 };
  }
  if (month >= 6 && month <= 8) {
    return { sunny: 1.4, hot: 1.3, partly_cloudy: 1.0, storm: 0.7, rain: 0.5 };
  }
  if (month >= 9 && month <= 11) {
    return { cloudy: 1.1, partly_cloudy: 1.2, sunny: 0.9, cold: 0.8, rain: 0.8 };
  }
  return { cold: 1.2, cloudy: 1.1, partly_cloudy: 1.0, sunny: 0.8 };
}
