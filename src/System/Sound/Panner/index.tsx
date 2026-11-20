/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

import { PannerConfiguration, DEFAULT_PANNER_CONFIG } from './General/index';

/**
 * Spatial Panning Controller.
 * Manages 3D audio positioning and stereo field distribution.
 */
export class PannerController {
  private config: PannerConfiguration = { ...DEFAULT_PANNER_CONFIG };
  private position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  private stereoPan: number = 0;
  private attenuation: number = 1;

  public getConfiguration(): PannerConfiguration {
    return this.config;
  }

  public setPosition(x: number, y: number, z: number): void {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;

    const distance = Math.sqrt(x * x + y * y + z * z);
    // Clamped horizontal stereo azimuth ratio in [-1, 1]
    this.stereoPan = distance > 1e-6 ? Math.max(-1, Math.min(1, x / distance)) : 0;

    // Web Audio distance attenuation model bounded by refDistance and maxDistance
    const clampedDist = Math.max(this.config.refDistance, Math.min(this.config.maxDistance, distance));
    if (this.config.distanceModel === 'linear') {
      const denom = Math.max(1e-6, this.config.maxDistance - this.config.refDistance);
      this.attenuation = Math.max(0, 1 - this.config.rolloffFactor * (clampedDist - this.config.refDistance) / denom);
    } else if (this.config.distanceModel === 'exponential') {
      this.attenuation = Math.pow(clampedDist / Math.max(1e-6, this.config.refDistance), -this.config.rolloffFactor);
    } else {
      this.attenuation = this.config.refDistance / (this.config.refDistance + this.config.rolloffFactor * (clampedDist - this.config.refDistance));
    }
  }

  public getPosition(): Readonly<{ x: number; y: number; z: number }> {
    return this.position;
  }

  public getStereoBalance(): number {
    return this.stereoPan;
  }

  public getDistanceAttenuation(): number {
    return this.attenuation;
  }
}

export const pannerController = new PannerController();
