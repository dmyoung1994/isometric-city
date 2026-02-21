'use client';

import React, { useState } from 'react';
import { useGolf } from '@/context/GolfContext';

function PanelWrapper({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="absolute top-20 right-6 w-[360px] bg-slate-950/95 border border-slate-700 shadow-xl z-50 rounded-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold tracking-wide text-white/90 uppercase">{title}</h3>
        <button onClick={onClose} className="h-7 w-7 text-white/60 hover:text-white">✕</button>
      </div>
      <div className="max-h-[360px] overflow-y-auto p-4 space-y-3 text-sm text-white/80">{children}</div>
    </div>
  );
}

function CoursePanel({ onClose }: { onClose: () => void }) {
  const { state, finishHoleBuild, cancelHoleBuild } = useGolf();
  return (
    <PanelWrapper title="Course" onClose={onClose}>
      <div className="space-y-2">
        <div className="text-xs uppercase text-white/50">Holes</div>
        <div className="text-xs text-white/60">Goal: 18 holes · Current: {state.holes.length}</div>
        {state.holes.length === 0 && <div className="text-white/60">No holes yet. Start building.</div>}
        {state.holes.map(hole => (
          <div key={hole.id} className="border border-slate-800 rounded px-3 py-2">
            <div className="text-white font-semibold">{hole.name}</div>
            <div className="text-xs text-white/60">Par {hole.par} · {hole.length} tiles · Difficulty {hole.difficulty.toFixed(1)}</div>
          </div>
        ))}
      </div>
      {state.buildingHoleId && (
        <div className="flex gap-2">
          <button onClick={finishHoleBuild} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded px-2 py-1 text-xs">Finish Hole</button>
          <button onClick={cancelHoleBuild} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded px-2 py-1 text-xs">Cancel</button>
        </div>
      )}
    </PanelWrapper>
  );
}

function StaffPanel({ onClose }: { onClose: () => void }) {
  const { state, hireCrew, trainCrew } = useGolf();
  return (
    <PanelWrapper title="Staff" onClose={onClose}>
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase text-white/50">Maintenance Crews</div>
        <button onClick={hireCrew} className="text-xs bg-slate-800 hover:bg-slate-700 rounded px-2 py-1">Hire ($2,000)</button>
      </div>
      {state.maintenanceCrews.map(crew => (
        <div key={crew.id} className="border border-slate-800 rounded px-3 py-2 space-y-1">
          <div className="text-white font-semibold">Crew {crew.id.slice(-4)}</div>
          <div className="text-xs text-white/60">Level {crew.level} · Efficiency {(crew.efficiency * 100).toFixed(0)}%</div>
          <div className="text-xs text-white/60">Training {crew.trainingProgress}%</div>
          <button onClick={() => trainCrew(crew.id)} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded px-2 py-1">Train ($800)</button>
        </div>
      ))}
    </PanelWrapper>
  );
}

function FacilitiesPanel({ onClose }: { onClose: () => void }) {
  const { state, upgradeFacility } = useGolf();
  return (
    <PanelWrapper title="Facilities" onClose={onClose}>
      {state.facilities.map(facility => (
        <div key={facility.type} className="border border-slate-800 rounded px-3 py-2 space-y-1">
          <div className="text-white font-semibold">{facility.type.replace('_', ' ')}</div>
          <div className="text-xs text-white/60">Level {facility.level || 1} · {facility.built ? 'Built' : 'Not built'}</div>
          {facility.built && facility.level < 3 && (
            <button onClick={() => upgradeFacility(facility.type)} className="text-xs bg-slate-800 hover:bg-slate-700 rounded px-2 py-1">Upgrade</button>
          )}
        </div>
      ))}
    </PanelWrapper>
  );
}

function FinancesPanel({ onClose }: { onClose: () => void }) {
  const { state } = useGolf();
  return (
    <PanelWrapper title="Finances" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-white/50 text-xs uppercase">Cash</div>
          <div className="text-green-400 font-semibold">${Math.round(state.finances.cash).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-white/50 text-xs uppercase">Income</div>
          <div className="text-green-300 font-semibold">${Math.round(state.finances.income).toLocaleString()}</div>
        </div>
      </div>
      <div>
        <div className="text-white/50 text-xs uppercase">Expenses</div>
        <div className="text-red-300 font-semibold">${Math.round(state.finances.expenses).toLocaleString()}</div>
      </div>
    </PanelWrapper>
  );
}

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { exportState, loadState, newGame } = useGolf();
  const [importValue, setImportValue] = useState('');

  return (
    <PanelWrapper title="Settings" onClose={onClose}>
      <div className="space-y-2">
        <button onClick={() => newGame()} className="w-full text-xs bg-slate-800 hover:bg-slate-700 rounded px-2 py-2">New Game</button>
        <button onClick={() => navigator.clipboard.writeText(exportState())} className="w-full text-xs bg-slate-800 hover:bg-slate-700 rounded px-2 py-2">Copy Save</button>
        <textarea
          value={importValue}
          onChange={(e) => setImportValue(e.target.value)}
          className="w-full h-24 bg-slate-900 text-white text-xs p-2 border border-slate-800 rounded"
          placeholder="Paste save data here"
        />
        <button
          onClick={() => {
            if (importValue.trim()) loadState(importValue.trim());
          }}
          className="w-full text-xs bg-emerald-600 hover:bg-emerald-500 rounded px-2 py-2"
        >
          Import Save
        </button>
      </div>
    </PanelWrapper>
  );
}

export function Panels() {
  const { state, setActivePanel } = useGolf();
  const close = () => setActivePanel('none');

  if (state.activePanel === 'course') return <CoursePanel onClose={close} />;
  if (state.activePanel === 'staff') return <StaffPanel onClose={close} />;
  if (state.activePanel === 'facilities') return <FacilitiesPanel onClose={close} />;
  if (state.activePanel === 'finances') return <FinancesPanel onClose={close} />;
  if (state.activePanel === 'settings') return <SettingsPanel onClose={close} />;
  return null;
}
