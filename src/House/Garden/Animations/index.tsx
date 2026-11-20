/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * House/Garden/Animations/index.tsx
 * Scientific Botanical & Floral Animation Registry for House/Garden/.
 */

import { BlockAnimation2D } from '../../../System/Building_Blocks/Animations/2-D/index';
import { BlockAnimationColorPalette } from '../../../System/Building_Blocks/Animations/Color_Palette/index';
import { BlockTexturePalette } from '../../../System/Building_Blocks/Animations/Color_Palette/Texture_Palette/index';

export interface GardenAnimationEntry {
  readonly id: string;
  readonly target: 'GRASS' | 'FLOWER' | 'HEDGE';
  readonly frequencyHz: number;
  readonly amplitude: number;
}

export const GardenAnimations = {
  registry: [
    { id: 'GARDEN_MEADOW_BREEZE', target: 'GRASS', frequencyHz: 0.45, amplitude: 0.25 },
    { id: 'GARDEN_FLORAL_SWAY', target: 'FLOWER', frequencyHz: 0.72, amplitude: 0.35 },
    { id: 'GARDEN_HEDGE_RUSTLE', target: 'HEDGE', frequencyHz: 0.30, amplitude: 0.12 }
  ] as readonly GardenAnimationEntry[],

  evaluateBotanicalSway(timeSec: number, worldX: number, worldY: number): number {
    return BlockAnimation2D.evaluateFoliageSway(timeSec, worldX, worldY, 0.35);
  },

  evaluateSunlightFloralTint(baseColor32: number, harmonicPhase: number): number {
    const blend256 = Math.max(0, Math.min(36, Math.round((harmonicPhase + 1) * 18)));
    return BlockAnimationColorPalette.lerp32Fixed(baseColor32, BlockTexturePalette.GARDEN_FLOWER_GOLD, blend256);
  }
};

export default GardenAnimations;
