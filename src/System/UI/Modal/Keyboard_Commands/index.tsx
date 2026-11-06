import React from 'react';
import { X } from 'lucide-react';

interface KeyboardCommandsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardCommandsModal: React.FC<KeyboardCommandsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Keyboard Commands</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          <section>
            <h3 className="text-pink-400 text-xs font-bold uppercase tracking-widest mb-4">Movement</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex justify-between"><span>Forward</span> <kbd className="bg-slate-800 px-2 rounded">▲</kbd></li>
              <li className="flex justify-between"><span>Reverse</span> <kbd className="bg-slate-800 px-2 rounded">▼</kbd></li>
              <li className="flex justify-between"><span>Turn Left/Right</span> <kbd className="bg-slate-800 px-2 rounded">◀ / ▶</kbd></li>
              <li className="flex justify-between"><span>Jump</span> <kbd className="bg-slate-800 px-2 rounded">Space</kbd></li>
              <li className="flex justify-between"><span>Gallop</span> <kbd className="bg-slate-800 px-2 rounded">Shift (Hold)</kbd></li>
              <li className="flex justify-between"><span>Lean Forward</span> <kbd className="bg-slate-800 px-2 rounded">L</kbd></li>
            </ul>
          </section>
          <section>
            <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">Actions & Toggles</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex justify-between"><span>Bark</span> <kbd className="bg-slate-800 px-2 rounded">S</kbd></li>
              <li className="flex justify-between"><span>Pet Beagle</span> <kbd className="bg-slate-800 px-2 rounded">P</kbd></li>
              <li className="flex justify-between"><span>Grasp Collar</span> <kbd className="bg-slate-800 px-2 rounded">C</kbd></li>
              <li className="flex justify-between"><span>Switch View</span> <kbd className="bg-slate-800 px-2 rounded">T</kbd></li>
              <li className="flex justify-between"><span>Bark Notify</span> <kbd className="bg-slate-800 px-2 rounded">Shift-1 (!)</kbd></li>
              <li className="flex justify-between"><span>Jump Notify</span> <kbd className="bg-slate-800 px-2 rounded">Shift-2 (@)</kbd></li>
              <li className="flex justify-between"><span>Pause Game</span> <kbd className="bg-slate-800 px-2 rounded">Shift-7 (&)</kbd></li>
              <li className="flex justify-between"><span>Speech Reader</span> <kbd className="bg-slate-800 px-2 rounded">Shift-Z-Z</kbd></li>
              <li className="flex justify-between"><span>Stop Speech (Silence)</span> <kbd className="bg-slate-800 px-2 rounded">Ctrl</kbd></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default KeyboardCommandsModal;
