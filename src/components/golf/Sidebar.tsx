'use client';

import React from 'react';
import { useGolf } from '@/context/GolfContext';
import { TOOL_INFO, Tool } from '@/games/golf/types/game';

const TOOL_GROUPS: { title: string; tools: Tool[] }[] = [
  { title: 'Tools', tools: ['select', 'bulldoze', 'hole_build'] },
  { title: 'Terrain', tools: ['terrain_fairway', 'terrain_green', 'terrain_tee', 'terrain_rough', 'terrain_sand', 'terrain_water', 'terrain_cart_path'] },
  { title: 'Facilities', tools: ['facility_clubhouse', 'facility_driving_range', 'facility_pro_shop', 'facility_restaurant', 'facility_practice_green', 'facility_caddie_shack', 'facility_maintenance_shed'] },
];

export function Sidebar({ onExit }: { onExit?: () => void }) {
  const { state, setTool, setActivePanel, startHoleBuild } = useGolf();

  return (
    <aside className="w-56 bg-slate-950 text-white border-r border-slate-800 h-full p-4 flex flex-col gap-4">
      <div className="space-y-1">
        <div className="text-xs uppercase text-white/50">IsoGolf</div>
        <div className="text-lg font-semibold">Course Builder</div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActivePanel('course')}
          className="flex-1 text-xs bg-slate-800 hover:bg-slate-700 rounded px-2 py-1"
        >
          Course
        </button>
        <button
          onClick={() => setActivePanel('staff')}
          className="flex-1 text-xs bg-slate-800 hover:bg-slate-700 rounded px-2 py-1"
        >
          Staff
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setActivePanel('facilities')}
          className="flex-1 text-xs bg-slate-800 hover:bg-slate-700 rounded px-2 py-1"
        >
          Facilities
        </button>
        <button
          onClick={() => setActivePanel('finances')}
          className="flex-1 text-xs bg-slate-800 hover:bg-slate-700 rounded px-2 py-1"
        >
          Finances
        </button>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {TOOL_GROUPS.map(group => (
          <div key={group.title}>
            <div className="text-xs uppercase text-white/50 mb-2">{group.title}</div>
            <div className="grid grid-cols-1 gap-2">
              {group.tools.map(tool => {
                const info = TOOL_INFO[tool];
                const active = state.selectedTool === tool;
                return (
                  <button
                    key={tool}
                    onClick={() => {
                      if (tool === 'hole_build') startHoleBuild();
                      setTool(tool);
                    }}
                    className={`text-left text-xs rounded px-3 py-2 border ${active ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}`}
                  >
                    <div className="font-semibold text-white/90">{info.name}</div>
                    <div className="text-white/60">${info.cost}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <button
          onClick={() => setActivePanel('settings')}
          className="text-xs bg-slate-800 hover:bg-slate-700 rounded px-2 py-2"
        >
          Settings
        </button>
        {onExit && (
          <button onClick={onExit} className="text-xs text-white/70 hover:text-white">
            Exit
          </button>
        )}
      </div>
    </aside>
  );
}
