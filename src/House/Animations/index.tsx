/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * House/Animations/index.tsx
 * Unified House Architectural Animation Registry.
 */

export * from '../Foyer/Animations/index';
export * from '../Garden/Animations/index';
export * from '../Front_Porch/Animations/index';

export const HouseAnimations = {
  types: ['2D', '3D', 'POLYGON', 'PIXEL'] as const,
  registry: ['FoyerAnimations', 'GardenAnimations', 'FrontPorchAnimations'] as const
};

export default HouseAnimations;
