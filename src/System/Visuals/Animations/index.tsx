/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './2-D/index';
export * from './3-D/index';
export * from './Polygons/index';
export * from './Color_Palette/index';
export * from './Pixelations/index';
export * from './Geometry/index';

import { VisualAnimation2D } from './2-D/index';
import { VisualAnimation3D } from './3-D/index';
import { VisualAnimationPolygons } from './Polygons/index';
import { VisualAnimationColorPalette } from './Color_Palette/index';
import { VisualAnimationPixelations } from './Pixelations/index';
import { VisualAnimationGeometry } from './Geometry/index';

/**
 * Unified Visual Animations Registry.
 * Aggregates all mathematical visual animation sub-engines.
 */
export const VisualAnimations = {
  modes: ['2D', '3D', 'POLYGON', 'PIXEL', 'DOT_MATRIX'],
  TwoD: VisualAnimation2D,
  ThreeD: VisualAnimation3D,
  Polygons: VisualAnimationPolygons,
  ColorPalette: VisualAnimationColorPalette,
  Pixelations: VisualAnimationPixelations,
  Geometry: VisualAnimationGeometry
};

export default VisualAnimations;
