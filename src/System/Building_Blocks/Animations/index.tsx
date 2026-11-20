/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/Building_Blocks/Animations/index.tsx
 * Centralized Building Blocks Animation Facade: 2-D, 3-D, Polygons, Pixelations/Dot_Matrix, Color_Palette.
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export * from './2-D/index';
export * from './3-D/index';
export * from './Polygons/index';
export * from './Pixelations/index';
export * from './Color_Palette/index';

import { BlockAnimation2D } from './2-D/index';
import { BlockAnimation3D } from './3-D/index';
import { BlockAnimationPolygons } from './Polygons/index';
import { BlockAnimationPixelations, BlockAnimationDotMatrix } from './Pixelations/index';
import { BlockAnimationColorPalette } from './Color_Palette/index';

export const BuildingBlocksAnimations = {
  TwoD: BlockAnimation2D,
  ThreeD: BlockAnimation3D,
  Polygons: BlockAnimationPolygons,
  Pixelations: BlockAnimationPixelations,
  DotMatrix: BlockAnimationDotMatrix,
  ColorPalette: BlockAnimationColorPalette
};

export default BuildingBlocksAnimations;
