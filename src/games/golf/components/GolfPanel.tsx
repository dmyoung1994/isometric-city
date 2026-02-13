import React from 'react';
import { useGolf } from '@/games/golf/context/GolfContext';

export function GolfPanel({ onClose }: { onClose: () => void }) {
  const { golfState, updateGolfState, addBall, addStaff } = useGolf();

  const handleAddBall = () => {
    // For simplicity, place a ball at the tee box (first hole)
    const firstHole = golfState.holes[0];
    if (firstHole === 'par3') {
      addBall(100, 100); // Example coordinates
    }
  };

  const handleAddCaddie = () => {
    addStaff({
      id: `caddie-${Date.now()}`,
      name: 'Caddie',
      positionX: 50,
      positionY: 50,
      role: 'caddie',
    });
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Golf Course Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Maintenance Cost</label>
          <input
            type="number"
            value={golfState.maintenanceCost}
            onChange={(e) => updateGolfState({ maintenanceCost: parseInt(e.target.value) })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Player Satisfaction</label>
          <input
            type="number"
            value={golfState.playerSatisfaction}
            onChange={(e) => updateGolfState({ playerSatisfaction: parseInt(e.target.value) })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Course Rating</label>
          <input
            type="number"
            value={golfState.courseRating}
            onChange={(e) => updateGolfState({ courseRating: parseFloat(e.target.value) })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <button
            onClick={handleAddBall}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Golf Ball
          </button>
        </div>
        <div>
          <button
            onClick={handleAddCaddie}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Caddie
          </button>
        </div>
      </div>
      <button
        onClick={onClose}
        className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
      >
        Close
      </button>
    </div>
  );
}
