/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InGameAIVisualAnimationsGeneralEngine, AnimationTelemetryVector, AnimationRenderParameters } from './General/index';

export * from './General/index';

/**
 * Visual Animations AI Category Gateway and Registry.
 */
export const InGameAIVisualAnimationsCategoryRegistry = {
  version: '1.0.0',
  description: 'Visual Animations AI Category Registry for 2D/3D perspective rendering',
  engine: InGameAIVisualAnimationsGeneralEngine,

  computeAnimationState(telemetry: AnimationTelemetryVector): AnimationRenderParameters {
    return InGameAIVisualAnimationsGeneralEngine.evaluateAnimationParameters(telemetry);
  }
};
