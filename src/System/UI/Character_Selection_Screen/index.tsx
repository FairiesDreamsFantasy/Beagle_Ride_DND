/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { motion } from 'motion/react';
import { User, ChevronRight } from 'lucide-react';
import { RiderId } from '../../../types';
import { RiderRegistry } from '../../Registry/Character/Rider/index';

interface CharacterSelectionScreenProps {
  onSelect: (riderId: RiderId) => void;
  onNext: () => void;
  selectedRiderId: RiderId;
}

export const CharacterSelectionScreen: React.FC<CharacterSelectionScreenProps> = ({ 
  onSelect, 
  onNext,
  selectedRiderId 
}) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans overflow-hidden">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-black tracking-tighter leading-none mb-2">
          BEAGLE RIDE<br />
          <span className="text-emerald-500">D&D</span>
        </h1>
        <div className="h-1 w-24 bg-emerald-500 mx-auto rounded-full" />
      </header>

      <main className="w-full max-w-xl flex flex-col items-center">
        <h2 className="text-xl font-bold mb-8 text-slate-300">Choose your Character what you want to be.</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-12">
          {RiderRegistry.map(rider => (
            <button
              key={rider.id}
              onClick={() => onSelect(rider.id)}
              className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${
                selectedRiderId === rider.id
                  ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <User className={`w-12 h-12 mb-4 ${selectedRiderId === rider.id ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="font-bold text-lg">{rider.name}</span>
              <span className="text-[10px] text-slate-500 uppercase mt-1">{rider.description}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onNext}
          className="group flex items-center gap-2 bg-white text-black px-12 py-4 rounded-full font-black text-xl hover:bg-emerald-400 transition-colors"
        >
          NEXT
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </main>

      <footer className="mt-16 text-[10px] text-slate-600 font-mono tracking-widest uppercase">
        Character Selection Matrix v2.0
      </footer>
    </div>
  );
};
