/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export * from './General/index';

interface ViewMenuProps {
  compassEnabled: boolean;
  onToggleCompass: () => void;
  perspective: 'POV' | 'RIDER';
  onChangePerspective: (p: 'POV' | 'RIDER') => void;
}

export const ViewMenu: React.FC<ViewMenuProps> = ({
  compassEnabled,
  onToggleCompass,
  perspective,
  onChangePerspective
}) => {
  return (
    <div 
      role="group"
      aria-label="View options"
      className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-4 space-y-3 z-50"
    >
      <button 
        className="w-full text-left text-xs font-mono text-slate-300 hover:text-white transition-colors"
      >
        KEYBOARD COMMANDS
      </button>
      
      <div className="flex items-center justify-between" role="none">
        <span id="label-compass" className="text-xs font-mono text-slate-300">COMPASS</span>
        <button 
          aria-pressed={compassEnabled}
          aria-labelledby="label-compass"
          onClick={onToggleCompass}
          className={`text-[10px] font-mono px-2 py-0.5 rounded ${compassEnabled ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-500'}`}
        >
          {compassEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
 
      <div className="pt-2 border-t border-slate-800 space-y-2" role="none">
        <span id="label-perspective" className="text-[10px] font-mono text-slate-500">RIDER PERSPECTIVE</span>
        <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="label-perspective">
          <button 
            aria-pressed={perspective === 'POV'}
            onClick={() => onChangePerspective('POV')}
            className={`text-[10px] font-mono py-1 rounded border ${perspective === 'POV' ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-slate-700 text-slate-500'}`}
          >
            POV
          </button>
          <button 
            aria-pressed={perspective === 'RIDER'}
            onClick={() => onChangePerspective('RIDER')}
            className={`text-[10px] font-mono py-1 rounded border ${perspective === 'RIDER' ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-slate-700 text-slate-500'}`}
          >
            RIDER VIEW
          </button>
        </div>
      </div>
    </div>
  );
};
