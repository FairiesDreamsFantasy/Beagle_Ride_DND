/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CraftedMenuBar } from './Crafted/index';

import { GameSettings } from '../../../types';

export * from './General/index';
export * from './Crafted/index';

interface MenuBarProps {
  settings: GameSettings;
  onUpdateSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
}

export const MenuBar: React.FC<MenuBarProps> = ({ settings, onUpdateSettings }) => {
  return (
    <div className="w-full flex justify-center py-4">
      <CraftedMenuBar settings={settings} onUpdateSettings={onUpdateSettings} />
    </div>
  );
};
