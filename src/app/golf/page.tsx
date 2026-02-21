'use client';

import React from 'react';
import { GolfProvider } from '@/context/GolfContext';
import GolfGame from '@/components/golf/Game';

export default function GolfPage() {
  return (
    <GolfProvider>
      <GolfGame />
    </GolfProvider>
  );
}
