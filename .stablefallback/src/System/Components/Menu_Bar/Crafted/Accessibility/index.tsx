/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameSettings } from '../../../../../types';

export * from './General/index';

interface AccessibilityMenuProps {
  settings: GameSettings;
  onUpdateSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
}

export const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({ 
  settings,
  onUpdateSettings
}) => {
  const { 
    ttsEnabled, 
    barkNotificationsEnabled, 
    jumpNotificationsEnabled, 
    turningTonesEnabled,
    pettingDescriptionsEnabled,
    collarGraspDescriptionsEnabled,
    leaningDescriptionsEnabled
  } = settings;

  const toggleSetting = (key: keyof GameSettings) => {
    onUpdateSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div 
      role="group"
      aria-label="Accessibility options"
      className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-4 space-y-3 z-50"
    >
      <div className="flex items-center justify-between" role="none">
        <span id="label-tts" className="text-xs font-mono text-slate-300">TTS ENGINE</span>
        <button 
          aria-pressed={ttsEnabled}
          aria-labelledby="label-tts"
          onClick={() => toggleSetting('ttsEnabled')}
          className={`w-8 h-4 rounded-full transition-colors relative ${ttsEnabled ? 'bg-green-600' : 'bg-slate-700'}`}
        >
          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${ttsEnabled ? 'left-4.5' : 'left-0.5'}`} />
        </button>
      </div>
 
      <div className="pt-2 border-t border-slate-800 space-y-2" role="none">
        <div className="flex items-center justify-between" role="none">
          <span id="label-tones" className="text-[10px] font-mono text-slate-400 uppercase">Turning Tones</span>
          <button 
            aria-pressed={turningTonesEnabled}
            aria-labelledby="label-tones"
            onClick={() => toggleSetting('turningTonesEnabled')}
            className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${turningTonesEnabled ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
          >
            {turningTonesEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
 
        {ttsEnabled && (
          <div className="pt-1 space-y-2" role="none">
            <div className="flex items-center justify-between" role="none">
              <span id="label-bark" className="text-[10px] font-mono text-slate-400 uppercase">Bark Narration</span>
              <button 
                aria-pressed={barkNotificationsEnabled}
                aria-labelledby="label-bark"
                onClick={() => toggleSetting('barkNotificationsEnabled')}
                className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${barkNotificationsEnabled ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
              >
                {barkNotificationsEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="flex items-center justify-between" role="none">
              <span id="label-jump" className="text-[10px] font-mono text-slate-400 uppercase">Jump Notify</span>
              <button 
                aria-pressed={jumpNotificationsEnabled}
                aria-labelledby="label-jump"
                onClick={() => toggleSetting('jumpNotificationsEnabled')}
                className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${jumpNotificationsEnabled ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
              >
                {jumpNotificationsEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
 
            <div className="flex items-center justify-between" role="none">
              <span id="label-petting" className="text-[10px] font-mono text-slate-400 uppercase">Petting Desc</span>
              <button 
                aria-pressed={pettingDescriptionsEnabled}
                aria-labelledby="label-petting"
                onClick={() => toggleSetting('pettingDescriptionsEnabled')}
                className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${pettingDescriptionsEnabled ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
              >
                {pettingDescriptionsEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
 
            <div className="flex items-center justify-between" role="none">
              <span id="label-collar" className="text-[10px] font-mono text-slate-400 uppercase">Collar Grasp</span>
              <button 
                aria-pressed={collarGraspDescriptionsEnabled}
                aria-labelledby="label-collar"
                onClick={() => toggleSetting('collarGraspDescriptionsEnabled')}
                className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${collarGraspDescriptionsEnabled ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
              >
                {collarGraspDescriptionsEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
 
            <div className="flex items-center justify-between" role="none">
              <span id="label-leaning" className="text-[10px] font-mono text-slate-400 uppercase">Leaning Desc</span>
              <button 
                aria-pressed={leaningDescriptionsEnabled}
                aria-labelledby="label-leaning"
                onClick={() => toggleSetting('leaningDescriptionsEnabled')}
                className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${leaningDescriptionsEnabled ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
              >
                {leaningDescriptionsEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
