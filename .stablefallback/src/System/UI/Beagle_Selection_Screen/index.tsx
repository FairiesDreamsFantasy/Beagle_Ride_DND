/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Dog, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { BeagleSpecs, BeagleId } from '../../../types';
import { BeagleRegistry } from '../../Registry/Character/Beagle/index';
import { soundEngine } from '../../Sound/index';

interface BeagleSelectionScreenProps {
  onSelect: (beagleId: BeagleId) => void;
}

export const BeagleSelectionScreen: React.FC<BeagleSelectionScreenProps> = ({ onSelect }) => {
  const [selectedId, setSelectedId] = useState<BeagleId>('JETTA');
  const selectedBeagle = BeagleRegistry.find(b => b.id === selectedId) || BeagleRegistry[0];

  const handleBeagleSelect = (id: BeagleId) => {
    setSelectedId(id);
    const beagle = BeagleRegistry.find(b => b.id === id);
    if (beagle) {
      soundEngine.playSfx(0, false, 'FOYER', beagle.barkPitchModifier);
    }
  };

  const handleStartRide = () => {
    soundEngine.playSfx(12); // Cardinal/Alert chime
    onSelect(selectedId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-y-auto">
      <header className="bg-slate-900 border-b border-slate-800 py-6 px-8 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Dog className="w-8 h-8 text-pink-400" />
          <h1 className="text-xl font-bold tracking-wider leading-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-indigo-400">
            Beagle Ride<br />D&D
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">Scientific Character Selection</h2>
          <p className="text-slate-400 text-sm">Select a beagle platform to initiate the RidePOV simulation.</p>
        </div>

        <div id="Beagle_Selection_Container" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* 7-Column / 5-Row Selection Grid Area */}
          <div className="flex flex-col gap-6">
            <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-1 shadow-2xl relative overflow-hidden">
              {/* The 7x5 Grid Overlay (Visual/Structural) */}
              <div className="grid grid-cols-7 grid-rows-5 gap-1 aspect-[7/5] relative">
                {/* Background Grid Pattern */}
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="border border-slate-800/30 rounded-sm" />
                ))}

                {/* Primary Selection Buttons placed within the grid */}
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-5 gap-3 p-3">
                  <button
                    onClick={() => handleBeagleSelect('JETTA')}
                    aria-label="Select Jetta"
                    aria-pressed={selectedId === 'JETTA'}
                    className={`col-start-1 col-end-2 row-start-2 row-end-5 rounded-xl transition-all flex flex-col items-center justify-center gap-2 border-2 ${
                      selectedId === 'JETTA' 
                        ? 'bg-pink-500/20 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]' 
                         : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <Dog className={`w-10 h-10 ${selectedId === 'JETTA' ? 'text-pink-400' : 'text-slate-500'}`} />
                    <span className={`font-black text-[10px] tracking-tight ${selectedId === 'JETTA' ? 'text-white' : 'text-slate-400'}`}>JETTA</span>
                  </button>

                  <button
                    onClick={() => handleBeagleSelect('ELSA')}
                    aria-label="Select Elsa"
                    aria-pressed={selectedId === 'ELSA'}
                    className={`col-start-2 col-end-3 row-start-2 row-end-5 rounded-xl transition-all flex flex-col items-center justify-center gap-2 border-2 ${
                      selectedId === 'ELSA' 
                        ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                        : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <Dog className={`w-10 h-10 ${selectedId === 'ELSA' ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className={`font-black text-[10px] tracking-tight ${selectedId === 'ELSA' ? 'text-white' : 'text-slate-400'}`}>ELSA</span>
                  </button>

                  <button
                    onClick={() => handleBeagleSelect('THELMA')}
                    aria-label="Select Thelma"
                    aria-pressed={selectedId === 'THELMA'}
                    className={`col-start-3 col-end-4 row-start-2 row-end-5 rounded-xl transition-all flex flex-col items-center justify-center gap-2 border-2 ${
                      selectedId === 'THELMA' 
                        ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                        : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <Dog className={`w-10 h-10 ${selectedId === 'THELMA' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className={`font-black text-[10px] tracking-tight ${selectedId === 'THELMA' ? 'text-white' : 'text-slate-400'}`}>THELMA</span>
                  </button>

                  <button
                    onClick={() => handleBeagleSelect('TINA')}
                    aria-label="Select Tina"
                    aria-pressed={selectedId === 'TINA'}
                    className={`col-start-4 col-end-5 row-start-2 row-end-5 rounded-xl transition-all flex flex-col items-center justify-center gap-2 border-2 ${
                      selectedId === 'TINA' 
                        ? 'bg-sky-500/20 border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.3)]' 
                        : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <Dog className={`w-10 h-10 ${selectedId === 'TINA' ? 'text-sky-400' : 'text-slate-500'}`} />
                    <span className={`font-black text-[10px] tracking-tight ${selectedId === 'TINA' ? 'text-white' : 'text-slate-400'}`}>TINA</span>
                  </button>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="bg-slate-900 border-t border-slate-800 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    selectedId === 'JETTA' ? 'bg-pink-500' : 
                    selectedId === 'ELSA' ? 'bg-indigo-500' : 
                    selectedId === 'THELMA' ? 'bg-emerald-500' : 'bg-sky-500'
                  }`} />
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Selected: {selectedBeagle.id}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-600">ID: BEAGLE-X7-{
                  selectedId === 'JETTA' ? '01' : 
                  selectedId === 'ELSA' ? '02' : 
                  selectedId === 'THELMA' ? '03' : '04'
                }</div>
              </div>
            </div>
          </div>

          {/* Description Area */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Beagle Specifications</h2>
              <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[10px] font-mono uppercase">{selectedBeagle.breed}</span>
            </div>
            
            <div className="space-y-5 text-slate-300 text-sm leading-relaxed flex-1">
              <p>
                <span className="text-white font-bold">{selectedBeagle.name}</span> is a highly calibrated {selectedBeagle.breed} companion. 
                Standing at <span className="text-pink-300">{selectedBeagle.shoulderHeightFeet}'{selectedBeagle.shoulderHeightInches}"</span> at the shoulder, 
                this platform offers a stable and majestic RidePOV experience.
              </p>
              
              <div className="grid grid-cols-2 gap-y-2 text-xs font-mono py-4 border-y border-slate-800/50">
                <div className="text-slate-500">COLOR:</div><div className="text-slate-200">{selectedBeagle.color}</div>
                <div className="text-slate-500">EYES:</div><div className="text-slate-200">{selectedBeagle.eyeColor}</div>
                <div className="text-slate-500">COLLAR:</div><div className="text-slate-200">{selectedBeagle.collarColor} ({selectedBeagle.collarDecorations})</div>
                <div className="text-slate-500">TAIL:</div><div className="text-slate-200">{selectedBeagle.tailStyle}</div>
              </div>

              <p>
                {selectedBeagle.name}'s body dimensions are {selectedBeagle.widthInches} inches wide and {selectedBeagle.lengthFeet} feet long. 
                The head structure is {selectedBeagle.headWidthInches}x{selectedBeagle.headHeightInches} inches, 
                {selectedBeagle.hasMane ? ` featuring a distinctive ${selectedBeagle.maneColor || 'dark yellow'} mane.` : " designed with a streamlined white blaze."}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 transition-colors">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Bark Pitch</span>
                <span className="text-base font-black font-mono text-pink-400">
                  {selectedBeagle.barkPitchModifier === 1 ? '1.0x (Standard)' : 
                   selectedBeagle.barkPitchModifier === 1.05 ? '1.05x (High)' : '1.15x (Ultra)'}
                </span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 transition-colors">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Fur Density</span>
                <span className="text-base font-black font-mono text-indigo-400">
                  {selectedBeagle.furThicknessFactor === 1 ? '1.0x (Standard)' : 
                   selectedBeagle.furThicknessFactor === 1.05 ? '1.05x (Thick)' : '1.15x (Heavy)'}
                </span>
              </div>
            </div>

            <button 
              onClick={handleStartRide}
              className="mt-8 w-full bg-slate-100 hover:bg-white text-slate-950 font-black py-4 rounded-2xl shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 uppercase tracking-tighter text-lg"
            >
              <Check className="w-6 h-6" />
              Ride Now
            </button>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-[10px] text-slate-600 font-mono tracking-widest border-t border-slate-900 shrink-0">
        BEAGLE RIDE D&D &bull; ULTRA-ACCESSIBLE INTERFACE &bull; v2.0
      </footer>
    </div>
  );
};

export default BeagleSelectionScreen;
