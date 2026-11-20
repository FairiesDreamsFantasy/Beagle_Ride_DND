/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AccessibilityMenu } from './Accessibility/index';
import { ViewMenu } from './View/index';
import { ToolboxMenu } from './Toolbox/index';

import { GameSettings } from '../../../../types';

export * from './General/index';

interface CraftedMenuBarProps {
  settings: GameSettings;
  onUpdateSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  onTakeScreenshot: (format: 'png' | 'jpg') => void;
}

export const CraftedMenuBar: React.FC<CraftedMenuBarProps> = React.memo(({ settings, onUpdateSettings, onTakeScreenshot }) => {
  const [activeMenu, setActiveMenu] = useState<'TOOLBOX' | 'VIEW' | 'ACCESSIBILITY' | 'HELP' | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);

  const menuItems: Array<'TOOLBOX' | 'VIEW' | 'ACCESSIBILITY' | 'HELP'> = ['TOOLBOX', 'VIEW', 'ACCESSIBILITY', 'HELP'];
 
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Alt+Shift+T to focus toolbox menu
      if (e.altKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setActiveMenu('TOOLBOX');
        const firstBtn = document.getElementById('menu-toolbox');
        firstBtn?.focus();
      }
 
      if (activeMenu) {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          setActiveMenu(null);
          return;
        }
 
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          e.stopPropagation();
          const currentIndex = menuItems.indexOf(activeMenu);
          const nextIndex = (currentIndex + 1) % menuItems.length;
          setActiveMenu(menuItems[nextIndex]);
          const nextBtn = document.getElementById(`menu-${menuItems[nextIndex].toLowerCase()}`);
          nextBtn?.focus();
          return;
        }
 
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          e.stopPropagation();
          const currentIndex = menuItems.indexOf(activeMenu);
          const prevIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
          setActiveMenu(menuItems[prevIndex]);
          const prevBtn = document.getElementById(`menu-${menuItems[prevIndex].toLowerCase()}`);
          prevBtn?.focus();
          return;
        }
 
        // Prevent game interaction while a dropdown menu is active, leaving Enter functional for focused controls
        if (['ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (activeMenu && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true);
    window.addEventListener('mousedown', handleOutsideClick);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown, true);
      window.removeEventListener('mousedown', handleOutsideClick);
    };
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
      className="flex items-center space-x-4 bg-slate-900/95 px-6 py-2 rounded-full border border-slate-800 shadow-2xl relative"
    >
      <div className="relative" role="none">
        <button 
          id="menu-toolbox"
          aria-pressed={activeMenu === 'TOOLBOX'}
          aria-label="Toolbox menu"
          onClick={() => toggleMenu('TOOLBOX')}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActiveMenu('TOOLBOX');
            }
          }}
          className={`text-xs font-mono transition-colors ${activeMenu === 'TOOLBOX' ? 'text-white underline decoration-green-500 underline-offset-4' : 'text-slate-400 hover:text-white'}`}
        >
          TOOLBOX
        </button>
        {activeMenu === 'TOOLBOX' && (
          <ToolboxMenu 
            onTakeScreenshot={onTakeScreenshot}
            onClose={() => setActiveMenu(null)}
          />
        )}
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
        aria-pressed={activeMenu === 'HELP'}
        aria-label="Help information"
        onClick={() => toggleMenu('HELP')}
        className={`text-xs font-mono transition-colors ${activeMenu === 'HELP' ? 'text-white underline decoration-green-500 underline-offset-4' : 'text-slate-400 hover:text-white'}`}
      >
        HELP
      </button>
    </div>
  );
});
