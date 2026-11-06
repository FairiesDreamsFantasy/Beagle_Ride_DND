/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AccessibilityMenu } from './Accessibility/index';
import { ViewMenu } from './View/index';

import { GameSettings } from '../../../../types';

export * from './General/index';

interface CraftedMenuBarProps {
  settings: GameSettings;
  onUpdateSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
}

export const CraftedMenuBar: React.FC<CraftedMenuBarProps> = ({ settings, onUpdateSettings }) => {
  const [activeMenu, setActiveMenu] = useState<'FILE' | 'EDIT' | 'VIEW' | 'TOOLS' | 'HELP' | 'ACCESSIBILITY' | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);

  const menuItems: Array<'FILE' | 'EDIT' | 'VIEW' | 'TOOLS' | 'HELP' | 'ACCESSIBILITY'> = ['FILE', 'EDIT', 'VIEW', 'ACCESSIBILITY', 'HELP'];
 
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Alt+Shift+F to focus menu
      if (e.altKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setActiveMenu('FILE');
        const firstBtn = document.getElementById('menu-file');
        firstBtn?.focus();
      }
 
      if (activeMenu) {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          setActiveMenu(null);
        }
 
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          e.stopPropagation();
          const currentIndex = menuItems.indexOf(activeMenu as any);
          const nextIndex = (currentIndex + 1) % menuItems.length;
          setActiveMenu(menuItems[nextIndex]);
          const nextBtn = document.getElementById(`menu-${menuItems[nextIndex].toLowerCase()}`);
          nextBtn?.focus();
        }
 
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          e.stopPropagation();
          const currentIndex = menuItems.indexOf(activeMenu as any);
          const prevIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
          setActiveMenu(menuItems[prevIndex]);
          const prevBtn = document.getElementById(`menu-${menuItems[prevIndex].toLowerCase()}`);
          prevBtn?.focus();
        }
 
        // Prevent game interaction when menu is active
        if (['ArrowUp', 'ArrowDown', ' ', 'Enter'].includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [activeMenu]);

  const toggleMenu = (menu: typeof activeMenu) => {
    setActiveMenu(prev => prev === menu ? null : menu);
  };

  return (
    <div 
      id="Menu_Bar"
      ref={menuRef} 
      role="toolbar"
      aria-label="Game Menu Bar"
      className="flex items-center space-x-4 bg-slate-900/80 backdrop-blur-xl px-6 py-2 rounded-full border border-slate-800 shadow-2xl relative"
    >
      <div className="relative" role="none">
        <button 
          id="menu-file"
          aria-pressed={activeMenu === 'FILE'}
          aria-label="File menu"
          onClick={() => toggleMenu('FILE')}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActiveMenu('FILE');
            }
          }}
          className={`text-xs font-mono transition-colors ${activeMenu === 'FILE' ? 'text-white underline decoration-green-500 underline-offset-4' : 'text-slate-400 hover:text-white'}`}
        >
          FILE
        </button>
      </div>
      
      <div className="relative" role="none">
        <button 
          id="menu-edit"
          aria-pressed={activeMenu === 'EDIT'}
          aria-label="Edit menu"
          onClick={() => toggleMenu('EDIT')}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActiveMenu('EDIT');
            }
          }}
          className={`text-xs font-mono transition-colors ${activeMenu === 'EDIT' ? 'text-white underline decoration-green-500 underline-offset-4' : 'text-slate-400 hover:text-white'}`}
        >
          EDIT
        </button>
      </div>
 
      <div className="relative" role="none">
        <button 
          id="menu-view"
          aria-pressed={activeMenu === 'VIEW'}
          aria-label="View menu"
          onClick={() => toggleMenu('VIEW')}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActiveMenu('VIEW');
            }
          }}
          className={`text-xs font-mono transition-colors ${activeMenu === 'VIEW' ? 'text-white underline decoration-green-500 underline-offset-4' : 'text-slate-400 hover:text-white'}`}
        >
          VIEW
        </button>
        {activeMenu === 'VIEW' && (
          <ViewMenu 
            compassEnabled={settings.compassEnabled}
            onToggleCompass={() => onUpdateSettings(prev => ({ ...prev, compassEnabled: !prev.compassEnabled }))}
            perspective={settings.viewMode}
            onChangePerspective={(mode) => onUpdateSettings(prev => ({ ...prev, viewMode: mode }))}
          />
        )}
      </div>
  
      <div className="relative" role="none">
        <button 
          id="menu-accessibility"
          aria-pressed={activeMenu === 'ACCESSIBILITY'}
          aria-label="Accessibility settings menu"
          onClick={() => toggleMenu('ACCESSIBILITY')}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActiveMenu('ACCESSIBILITY');
            }
          }}
          className={`text-xs font-mono transition-colors ${activeMenu === 'ACCESSIBILITY' ? 'text-white underline decoration-green-500 underline-offset-4' : 'text-slate-400 hover:text-white'}`}
        >
          ACCESSIBILITY
        </button>
        {activeMenu === 'ACCESSIBILITY' && (
          <AccessibilityMenu 
            settings={settings}
            onUpdateSettings={onUpdateSettings}
          />
        )}
      </div>
 
      <button 
        id="menu-help"
        aria-label="Help information"
        className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
      >
        HELP
      </button>
    </div>
  );
};
