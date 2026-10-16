/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameView } from './Game_View/index';
import { MenuBar } from '../../../Components/Menu_Bar/index';
import { HUD } from './HUD/index';

export * from './General/index';
export * from './Game_View/index';

export const PlayAreaMain: React.FC = () => {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto space-y-2">
      <MenuBar />
      <HUD />
      <GameView />
    </main>
  );
};
