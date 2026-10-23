/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResolutionModule } from '../../Visuals/Resolution/index';

/**
 * Video Card Virtualization: Dynamic Performance Scaler.
 * Adjusts frame buffer resolution to maintain stable frame rates.
 */
export class DynamicResolutionManager {
  private currentScale: number = 1.0;

  public getScale(): number {
    return this.currentScale;
  }

  public adjustForPerformance(frameTimeMs: number): void {
    if (frameTimeMs > 16.6) {
      this.currentScale = Math.max(0.75, this.currentScale - 0.05);
    } else if (frameTimeMs < 12) {
      this.currentScale = Math.min(1.0, this.currentScale + 0.01);
    }
  }

  public getRenderDimensions(): { width: number; height: number } {
    const res = ResolutionModule.getActiveResolution();
    return {
      width: Math.floor(res.width * this.currentScale),
      height: Math.floor(res.height * this.currentScale)
    };
  }
}

export const videoCardUnit = new DynamicResolutionManager();
export default videoCardUnit;
