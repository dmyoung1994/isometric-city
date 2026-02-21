'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BIOMES, DEFAULT_BIOME_ID, type BiomeId } from '@/lib/biomes';
import { Check } from 'lucide-react';
import { T } from 'gt-next';

type BiomeSelectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (biomeId: BiomeId) => void;
};

export function BiomeSelectModal({ open, onOpenChange, onConfirm }: BiomeSelectModalProps) {
  const [selected, setSelected] = useState<BiomeId>(DEFAULT_BIOME_ID);

  useEffect(() => {
    if (open) {
      setSelected(DEFAULT_BIOME_ID);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-white">
            <T>Select a Biome</T>
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            <T>Choose the look and feel of your new city.</T>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {BIOMES.map((biome) => {
            const isSelected = biome.id === selected;
            const colors = biome.colors;
            return (
              <button
                key={biome.id}
                type="button"
                onClick={() => setSelected(biome.id)}
                className={`w-full text-left p-4 border transition-all duration-200 rounded-none ${
                  isSelected
                    ? 'border-white/40 bg-white/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-medium text-white/90">
                      <T>{biome.name}</T>
                    </h3>
                    <p className="text-xs text-white/50 mt-1">
                      <T>{biome.description}</T>
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white/80 mt-0.5" />}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div
                    className="h-4 w-6 border border-white/10"
                    style={{ backgroundColor: colors.zoneColors.none.top }}
                    title="Ground"
                  />
                  <div
                    className="h-4 w-6 border border-white/10"
                    style={{ backgroundColor: colors.waterBaseColors.top }}
                    title="Water"
                  />
                  <div
                    className="h-4 w-6 border border-white/10"
                    style={{ backgroundColor: colors.beachColors.fill }}
                    title="Beach"
                  />
                  <div
                    className="h-4 w-6 border border-white/10"
                    style={{ backgroundColor: colors.zoneColors.residential.top }}
                    title="Residential"
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            className="bg-white/5 hover:bg-white/10 text-white/70 border-white/15 rounded-none"
            onClick={() => onOpenChange(false)}
          >
            <T>Cancel</T>
          </Button>
          <Button
            className="bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-none"
            onClick={() => onConfirm(selected)}
          >
            <T>Start Game</T>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
