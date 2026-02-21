'use client';

import React from 'react';
import { useGolf } from '@/context/GolfContext';

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

export function TopBar() {
  const { state, setSpeed } = useGolf();

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-white">
      <div className="flex items-center gap-4">
        <div className="text-sm font-semibold">{state.courseName}</div>
        <div className="text-sm font-semibold">Cash {formatMoney(state.finances.cash)}</div>
        <div className="text-xs text-white/70">Rating {state.courseRating.toFixed(1)}</div>
        <div className="text-xs text-white/70">Satisfaction {Math.round(state.satisfaction)}%</div>
        <div className="text-xs text-white/50">{state.month}/{state.day} {String(state.hour).padStart(2, '0')}:{String(state.minute).padStart(2, '0')}</div>
      </div>
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map(speed => (
          <button
            key={speed}
            onClick={() => setSpeed(speed as 0 | 1 | 2 | 3)}
            className={`text-xs px-2 py-1 rounded ${state.speed === speed ? 'bg-emerald-500/30 text-emerald-100' : 'bg-slate-800 text-white/70'}`}
          >
            {speed === 0 ? 'Pause' : `${speed}x`}
          </button>
        ))}
      </div>
    </div>
  );
}
