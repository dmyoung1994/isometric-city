'use client';

import React, { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useMobile } from '@/hooks/useMobile';
import { useGolf } from '@/context/GolfContext';
import { GolfGrid } from './GolfGrid';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Panels } from './panels/Panels';

export default function GolfGame({ onExit }: { onExit?: () => void }) {
  const { isStateReady } = useGolf();
  const { isMobileDevice, isSmallScreen } = useMobile();
  const isMobile = isMobileDevice || isSmallScreen;
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);

  if (!isStateReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 text-white/60">
        Loading course...
      </div>
    );
  }

  if (isMobile) {
    return (
      <TooltipProvider>
        <div className="w-full h-full flex flex-col bg-slate-950">
          <TopBar />
          <div className="flex-1 relative">
            <GolfGrid selectedTile={selectedTile} setSelectedTile={setSelectedTile} isMobile />
            <Panels />
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full h-full min-h-[720px] overflow-hidden bg-slate-950 flex">
        <Sidebar onExit={onExit} />
        <div className="flex-1 flex flex-col ml-56">
          <TopBar />
          <div className="flex-1 relative overflow-visible">
            <GolfGrid selectedTile={selectedTile} setSelectedTile={setSelectedTile} />
            <Panels />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
