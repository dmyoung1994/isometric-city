import { useGolf } from '../context/GolfContext';

export const useGolfTools = () => {
  const { updateGolfState } = useGolf();

  const placeFairway = (x: number, y: number) => {
    console.log(`Placing fairway at (${x}, ${y})`);
  };

  const placeGreen = (x: number, y: number) => {
    console.log(`Placing green at (${x}, ${y})`);
  };

  const placeSandTrap = (x: number, y: number) => {
    console.log(`Placing sand trap at (${x}, ${y})`);
  };

  const placeWaterHazard = (x: number, y: number) => {
    console.log(`Placing water hazard at (${x}, ${y})`);
  };

  const placeTeeBox = (x: number, y: number) => {
    console.log(`Placing tee box at (${x}, ${y})`);
  };

  return {
    placeFairway,
    placeGreen,
    placeSandTrap,
    placeWaterHazard,
    placeTeeBox,
  };
};
