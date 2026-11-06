/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './Menu_Bar/index';
export * from './Game_View/index';
export * from './HUD/index';

import { HUDDisplay } from './HUD/index';
import { GameView } from './Game_View/index';

/**
 * Play Area Unified Registry.
 * Centralizes UI layout coordinates, HUD specifications, and viewport virtualization bounds.
 */
export const PlayAreaRegistry = {
  version: '2.0.0-ultra-precise',
  dimensions: {
    renderWidth: 320,
    renderHeight: 180,
    aspectRatio: 16 / 9
  },
  hud: {
    component: HUDDisplay,
    isStatusVisible: true,
    compassAlignment: 'TOP_RIGHT'
  },
  gameView: {
    component: GameView,
    canvasId: 'beagle-ride-viewport'
  }
};

export default PlayAreaRegistry;
