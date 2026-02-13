import { useGolf } from '../context/GolfContext';

export const useGolfTools = () => {
  const { updateGolfState, addBall, hitBall, addStaff } = useGolf();

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

  const addGolfBall = (x: number, y: number) => {
    addBall(x, y);
  };

  const hitGolfBall = (ballId: string, power: number, direction: number) => {
    hitBall(ballId, power, direction);
  };

  const addCaddie = (x: number, y: number) => {
    const newCaddie: GolfStaff = {
      id: `caddie-${Date.now()}`,
      name: 'Caddie',
      positionX: x,
      positionY: y,
      role: 'caddie',
    };
    addStaff(newCaddie);
  };

  const addCartAttendant = (x: number, y: number) => {
    const newCartAttendant: GolfStaff = {
      id: `cart-attendant-${Date.now()}`,
      name: 'Cart Attendant',
      positionX: x,
      positionY: y,
      role: 'cart_attendant',
    };
    addStaff(newCartAttendant);
  };

  return {
    placeFairway,
    placeGreen,
    placeSandTrap,
    placeWaterHazard,
    placeTeeBox,
    addGolfBall,
    hitGolfBall,
    addCaddie,
    addCartAttendant,
  };
};
