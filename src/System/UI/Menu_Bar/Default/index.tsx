/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settings, Info, Keyboard } from 'lucide-react';

export const DefaultMenuBar: React.FC<{ onOpenSettings?: () => void; onOpenCommands?: () => void }> = ({ onOpenSettings, onOpenCommands }) => {
  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full shadow-lg">
      <button 
        onClick={onOpenCommands}
        className="p-2 text-slate-400 hover:text-white transition-colors"
        title="Keyboard Commands"
      >
        <Keyboard className="w-5 h-5" />
      </button>
      <button 
        className="p-2 text-slate-400 hover:text-white transition-colors"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>
      <button 
        className="p-2 text-slate-400 hover:text-white transition-colors"
        title="About"
      >
        <Info className="w-5 h-5" />
      </button>
    </div>
  );
};
