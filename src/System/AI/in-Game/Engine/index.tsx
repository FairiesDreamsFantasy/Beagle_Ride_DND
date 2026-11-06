/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/AI/in-Game/Engine/index.tsx
 * Deterministic AI Heuristic Decision Engine.
 * Formulates O(1) decision trees for game entities with zero allocation overhead.
 */

export interface AIEntityState {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  alertness: number;
}

export class InGameAIEngine {
  public evaluatePathStep(entity: AIEntityState, speed: number): { x: number; y: number } {
    const dx = entity.targetX - entity.x;
    const dy = entity.targetY - entity.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= speed) {
      return { x: entity.targetX, y: entity.targetY };
    }
    return {
      x: entity.x + (dx / dist) * speed,
      y: entity.y + (dy / dist) * speed
    };
  }

  public calculateAlertness(distance: number, threshold: number): number {
    if (distance <= threshold) {
      return Math.min(1.0, 1.0 - (distance / threshold));
    }
    return 0.0;
  }
}

export const inGameAIEngine = new InGameAIEngine();
export default inGameAIEngine;
