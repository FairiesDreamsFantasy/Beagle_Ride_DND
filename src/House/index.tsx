/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * House/index.tsx
 * House Module Entry Point aggregating Foyer, Garden, and Front_Porch architectural engines.
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export * from './Foyer/index';
export * from './Garden/index';
export * from './Front_Porch/index';
export * from './Animations/index';

import { Foyer } from './Foyer/index';
import { Garden } from './Garden/index';
import { FrontPorch } from './Front_Porch/index';
import { HouseAnimations } from './Animations/index';

export const HouseModule = {
  version: '2.0.0',
  description: 'Scientific refinement for house structures (Foyer, Garden, Front_Porch)',
  zones: {
    Foyer,
    Garden,
    FrontPorch
  },
  animations: HouseAnimations
};

export default HouseModule;
