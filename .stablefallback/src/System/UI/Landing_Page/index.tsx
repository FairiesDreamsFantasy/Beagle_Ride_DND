/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Dog, 
  Keyboard, 
  Volume2, 
  Sparkles
} from 'lucide-react';
import { soundEngine } from '../../Sound/index';
import { LandingPageRegistry } from '../../Registry/Landing_Page/index';

import KeyboardCommandsModal from '../Modal/Keyboard_Commands/index';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [isKeyboardModalOpen, setIsKeyboardModalOpen] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden"
    >
      {/* Ambient pixel grids background */}
      <div className="absolute inset-0 bg-[#070b19] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-70"></div>

      {/* Elegant top decoration chimes */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

      {/* EXACT Landing Page Header structure specified by User */}
      <header className="relative z-10 text-center pt-12 pb-4">
        <motion.div
          initial={{ scale: 0.95, y: -10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center justify-center p-3.5 bg-slate-900/65 rounded-2xl border border-slate-800 shadow-xl mb-4"
        >
          <Dog className="w-12 h-12 text-pink-400 animate-bounce" />
        </motion.div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 [text-shadow:0_4px_12px_rgba(0,0,0,0.5)]">
          {LandingPageRegistry.title.split(' ').slice(0, 2).join(' ')}<br />
          {LandingPageRegistry.title.split(' ').slice(2).join(' ')}
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-pink-400 font-mono tracking-widest uppercase">
          {LandingPageRegistry.subtitle}
        </p>
      </header>

      {/* EXACT Landing Page Main container specified by User */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-4xl w-full mx-auto px-6 py-4 gap-8">
        
        {/* Elegant character rendering card */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Card 1: Beagle Specifications */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between shadow-lg relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl group-hover:bg-pink-500/10 transition-colors"></div>
            
            <div>
              <div className="flex items-center gap-2 mb-3.5">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <h3 className="text-xs font-bold font-mono text-slate-350 tracking-wider uppercase">
                  The Experience
                </h3>
              </div>
              
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                <p>
                  Mount your beagle companion as a standard rider for a high-fidelity RidePOV adventure. 
                  Navigate complex environments like the Temple of Hayana with scientific movement accuracy.
                </p>
                <p>
                  Choose between multiple riders and beagles, each with distinct dimensions and personalities. 
                  Experience the thrill of a 400ms rhythm gallop and immersive procedural soundscapes.
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-pink-500/5 rounded-xl border border-pink-500/10 text-xxs text-pink-300/80 leading-relaxed font-sans">
              * A typical human rider (5'4") mounts the beagle's back. High-fidelity gaits include trotting and 8-unit galloping.
            </div>
          </div>

          {/* Card 2: Quick Access */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div>
              <div className="flex items-center gap-2 mb-3.5">
                <Keyboard className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold font-mono text-slate-350 tracking-wider uppercase">
                  Quick Access
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                  <span className="text-xs text-slate-400">Movement Controls</span>
                  <kbd className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-white">MODAL</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                  <span className="text-xs text-slate-400">Accessibility Speech</span>
                  <kbd className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-white font-bold">Shift-Z-Z</kbd>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xxs text-emerald-400 font-mono">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span>Procedural dynamic sound synthesizer enabled</span>
            </div>
          </div>

        </div>

        {/* Symmetrical Action Buttons */}
        <div className="flex flex-col items-center gap-4 mt-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              id="start-game-button"
              onClick={() => {
                soundEngine.resume();
                soundEngine.playSfx(12); // Elegant welcome chime
                onStart();
              }}
              className="cursor-pointer font-sans bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-500 text-white text-base font-bold py-3.5 px-10 rounded-full shadow-2xl hover:shadow-pink-500/20 hover:brightness-110 active:brightness-95 transition-all duration-300 tracking-wider uppercase border border-white/20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-12 translate-x-[-100%] group-hover:translate-x-[250%] transition-transform duration-1000"></div>
              Start Game
            </button>
          </motion.div>

          <button
            onClick={() => setIsKeyboardModalOpen(true)}
            className="text-slate-400 hover:text-white transition-colors text-sm font-mono tracking-widest uppercase flex items-center gap-2 px-6 py-2 rounded-full border border-slate-800 hover:border-slate-600 bg-slate-900/50"
          >
            <Keyboard className="w-4 h-4" />
            Keyboard Commands
          </button>
        </div>
      </main>

      {/* Environmental parameters reference footer */}
      <footer className="relative z-10 py-6 text-center text-xxs text-slate-500 font-mono border-t border-slate-900">
        <p>OPEN SOURCE &bull; LANDSCAPE COZY VIEW &bull; SCREEN READER WEB SPEECH API SUPPORTED</p>
      </footer>

      <KeyboardCommandsModal isOpen={isKeyboardModalOpen} onClose={() => setIsKeyboardModalOpen(false)} />
    </motion.div>
  );
};
