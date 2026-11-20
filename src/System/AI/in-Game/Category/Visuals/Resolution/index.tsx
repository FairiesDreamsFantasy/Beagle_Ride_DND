/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type { ResolutionTelemetryResult } from './Ultra-Low/index';
export { AIUltraLowResolutionEvaluator } from './Ultra-Low/index';
export { AIVeryLowResolutionEvaluator } from './Very_Low/index';
export { AIMediumLowResolutionEvaluator } from './Medium-Low/index';
export { AISDResolutionEvaluator } from './SD/index';
export { AIMediumHighResolutionEvaluator } from './Medium-High/index';
export { AIVeryHighResolutionEvaluator } from './Very-High/index';
export { AIUltraHighResolutionEvaluator } from './Ultra-High/index';
export { AIRes2KResolutionEvaluator } from './2K/index';
export { AIRes4KResolutionEvaluator } from './4K/index';
export { AIRes8KResolutionEvaluator } from './8K/index';
export { AIRes16KResolutionEvaluator } from './16K/index';
export { AIRes32KResolutionEvaluator } from './32K/index';
export { AIRes64KResolutionEvaluator } from './64K/index';
export { AIRes128KResolutionEvaluator } from './128K/index';
export { AIRes256KResolutionEvaluator } from './256K/index';
export { AIRes512KResolutionEvaluator } from './512K/index';
export { AIRes1024KResolutionEvaluator } from './1024K/index';
export { AIRes2048KResolutionEvaluator } from './2048K/index';
export { AIRes4096KResolutionEvaluator } from './4096K/index';
export { AIRes8192KResolutionEvaluator } from './8192K/index';

import AIUltraLowResolutionEvaluator from './Ultra-Low/index';
import AIVeryLowResolutionEvaluator from './Very_Low/index';
import AIMediumLowResolutionEvaluator from './Medium-Low/index';
import AISDResolutionEvaluator from './SD/index';
import AIMediumHighResolutionEvaluator from './Medium-High/index';
import AIVeryHighResolutionEvaluator from './Very-High/index';
import AIUltraHighResolutionEvaluator from './Ultra-High/index';
import AIRes2KResolutionEvaluator from './2K/index';
import AIRes4KResolutionEvaluator from './4K/index';
import AIRes8KResolutionEvaluator from './8K/index';
import AIRes16KResolutionEvaluator from './16K/index';
import AIRes32KResolutionEvaluator from './32K/index';
import AIRes64KResolutionEvaluator from './64K/index';
import AIRes128KResolutionEvaluator from './128K/index';
import AIRes256KResolutionEvaluator from './256K/index';
import AIRes512KResolutionEvaluator from './512K/index';
import AIRes1024KResolutionEvaluator from './1024K/index';
import AIRes2048KResolutionEvaluator from './2048K/index';
import AIRes4096KResolutionEvaluator from './4096K/index';
import AIRes8192KResolutionEvaluator from './8192K/index';

export const RESOLUTION_AI_EVALUATORS = [
  AIUltraLowResolutionEvaluator,
  AIVeryLowResolutionEvaluator,
  AIMediumLowResolutionEvaluator,
  AISDResolutionEvaluator,
  AIMediumHighResolutionEvaluator,
  AIVeryHighResolutionEvaluator,
  AIUltraHighResolutionEvaluator,
  AIRes2KResolutionEvaluator,
  AIRes4KResolutionEvaluator,
  AIRes8KResolutionEvaluator,
  AIRes16KResolutionEvaluator,
  AIRes32KResolutionEvaluator,
  AIRes64KResolutionEvaluator,
  AIRes128KResolutionEvaluator,
  AIRes256KResolutionEvaluator,
  AIRes512KResolutionEvaluator,
  AIRes1024KResolutionEvaluator,
  AIRes2048KResolutionEvaluator,
  AIRes4096KResolutionEvaluator,
  AIRes8192KResolutionEvaluator
];

/**
 * Unified AI Resolution Selector.
 * Uses frame-budget control theory to dynamically match any screen size without CPU/GPU/RAM spikes.
 */
export const InGameAIVisualResolutionEngine = {
  selectOptimalProfile(
    frameTimeMs: number,
    containerWidth: number,
    containerHeight: number,
    maxPhysicalPixels: number = 230400
  ) {
    let best = RESOLUTION_AI_EVALUATORS[0].evaluateTelemetry(frameTimeMs, containerWidth, containerHeight, maxPhysicalPixels);
    for (let i = 1; i < RESOLUTION_AI_EVALUATORS.length; i++) {
      const candidate = RESOLUTION_AI_EVALUATORS[i].evaluateTelemetry(frameTimeMs, containerWidth, containerHeight, maxPhysicalPixels);
      if (candidate.suitabilityScore > best.suitabilityScore) {
        best = candidate;
      }
    }
    return best;
  }
};

export default InGameAIVisualResolutionEngine;
