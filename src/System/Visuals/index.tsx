/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';
export * from './Animations/index';
export * from './Engine/index';
export * from './Resolution/index';

export type VisualPipelineMode = 'HYBRID_2D_3D' | 'SIMULATED_3D' | '2D_CLASSIC';

/**
 * Visuals Management Module.
 * Supports simultaneous 2-D, True 3-D (Mode-7 / RSP Matrix), and Simulated 3-D rendering pipelines.
 */
export const VisualsModule = {
  version: '4.0.0-hybrid-n64-pipeline',
  defaultPipelineMode: 'HYBRID_2D_3D' as VisualPipelineMode,
  supportedModes: ['HYBRID_2D_3D', 'SIMULATED_3D', '2D_CLASSIC'] as readonly VisualPipelineMode[],
  description: 'Simultaneous 2-D, Mode-7/RSP 3-D, and Simulated 3-D rendering and projective geometry system'
};
