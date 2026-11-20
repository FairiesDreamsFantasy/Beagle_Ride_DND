/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * House/Front_Porch/Animations/index.tsx
 * Scientific Architectural Animation Registry for House/Front_Porch/ (canonical name; Porch unused).
 */

import { BlockAnimation2D } from '../../../System/Building_Blocks/Animations/2-D/index';
import { BlockAnimationColorPalette } from '../../../System/Building_Blocks/Animations/Color_Palette/index';
import { BlockTexturePalette } from '../../../System/Building_Blocks/Animations/Color_Palette/Texture_Palette/index';

export interface FrontPorchAnimationEntry {
  readonly id: string;
  readonly target: 'LANTERN' | 'TWILIGHT_SKY' | 'COLUMN_SHADING';
  readonly frequencyHz: number;
}

export const FrontPorchAnimations = {
  registry: [
    { id: 'FRONT_PORCH_LANTERN_GLOW', target: 'LANTERN', frequencyHz: 0.65 },
    { id: 'FRONT_PORCH_TWILIGHT_DRIFT', target: 'TWILIGHT_SKY', frequencyHz: 0.12 }
  ] as readonly FrontPorchAnimationEntry[],

  evaluateLanternGlow32(frame: number): number {
    const phase = BlockAnimation2D.evaluateHarmonicPhase(frame, 0.65, 0);
    const blend256 = Math.round((phase + 1) * 20);
    return BlockAnimationColorPalette.lerp32Fixed(
      BlockTexturePalette.PORCH_LANTERN_GLOW,
      BlockTexturePalette.TEMPLE_GATE_LINTEL,
      blend256
    );
  }
};

export default FrontPorchAnimations;
