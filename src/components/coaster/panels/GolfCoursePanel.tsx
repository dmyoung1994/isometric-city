import React from 'react';
import { useGolf } from '@/games/coaster/context/GolfContext';

export function GolfCoursePanel({ onClose }: { onClose: () => void }) {
  const { golfState, updateGolfState } = useGolf();

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
