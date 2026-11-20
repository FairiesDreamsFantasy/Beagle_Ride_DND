/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Res2048KResolution } from "../../../../../../Visuals/Resolution/2048K/index";

export interface ResolutionTelemetryResult {
  tierId: string;
  suitabilityScore: number;
  recommendedPhysicalWidth: number;
  recommendedPhysicalHeight: number;
  frameBudgetUtilization: number;
  downscaleRequired: boolean;
}

/**
 * In-Game AI Visual Resolution Evaluator: 2048K
 * Uses closed-loop frame-budget control theory to prevent GPU/CPU/RAM spikes.
 */
export const AIRes2048KResolutionEvaluator = {
  spec: Res2048KResolution,

  evaluateTelemetry(
    frameTimeMs: number,
    containerWidth: number,
    containerHeight: number,
    maxPhysicalPixels: number = 230400
  ): ResolutionTelemetryResult {
    const targetBudgetMs = 1000 / 60;
    const utilization = Math.max(0.01, frameTimeMs / targetBudgetMs);
    const virtualized = Res2048KResolution.virtualizeForBudget(maxPhysicalPixels);
    const containerPixels = Math.max(1, containerWidth * containerHeight);
    const logicalFit = Math.min(1, containerPixels / (2097152 * 1179648));
    const thermalHeadroom = Math.max(0, Math.min(1, 1.25 - utilization));
    const suitabilityScore = Number((0.6 * thermalHeadroom + 0.4 * logicalFit).toFixed(4));

    return {
      tierId: Res2048KResolution.id,
      suitabilityScore,
      recommendedPhysicalWidth: virtualized.width,
      recommendedPhysicalHeight: virtualized.height,
      frameBudgetUtilization: Number(utilization.toFixed(4)),
      downscaleRequired: utilization > 0.95 || (2097152 * 1179648) > maxPhysicalPixels
    };
  }
};

export default AIRes2048KResolutionEvaluator;
