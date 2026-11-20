/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SDResolution } from "../../../../../../Visuals/Resolution/SD/index";

export interface ResolutionTelemetryResult {
  tierId: string;
  suitabilityScore: number;
  recommendedPhysicalWidth: number;
  recommendedPhysicalHeight: number;
  frameBudgetUtilization: number;
  downscaleRequired: boolean;
}

/**
 * In-Game AI Visual Resolution Evaluator: SD
 * Uses closed-loop frame-budget control theory to prevent GPU/CPU/RAM spikes.
 */
export const AISDResolutionEvaluator = {
  spec: SDResolution,

  evaluateTelemetry(
    frameTimeMs: number,
    containerWidth: number,
    containerHeight: number,
    maxPhysicalPixels: number = 230400
  ): ResolutionTelemetryResult {
    const targetBudgetMs = 1000 / 60;
    const utilization = Math.max(0.01, frameTimeMs / targetBudgetMs);
    const virtualized = SDResolution.virtualizeForBudget(maxPhysicalPixels);
    const containerPixels = Math.max(1, containerWidth * containerHeight);
    const logicalFit = Math.min(1, containerPixels / (640 * 360));
    const thermalHeadroom = Math.max(0, Math.min(1, 1.25 - utilization));
    const suitabilityScore = Number((0.6 * thermalHeadroom + 0.4 * logicalFit).toFixed(4));

    return {
      tierId: SDResolution.id,
      suitabilityScore,
      recommendedPhysicalWidth: virtualized.width,
      recommendedPhysicalHeight: virtualized.height,
      frameBudgetUtilization: Number(utilization.toFixed(4)),
      downscaleRequired: utilization > 0.95 || (640 * 360) > maxPhysicalPixels
    };
  }
};

export default AISDResolutionEvaluator;
