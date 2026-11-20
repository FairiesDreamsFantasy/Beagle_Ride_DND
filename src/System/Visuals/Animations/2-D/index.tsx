/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrigLUT } from '../../../Engine/Mathematics/LUT/Trig';

export interface Point2D {
  x: number;
  y: number;
}

export type HybridRenderLayer = 'WORLD_3D_SCANLINE' | 'CHARACTER_SIMULATED_3D' | 'OVERLAY_2D_HUD';

/**
 * 2D Visual Animation & Hybrid 2-D / Simulated 3-D Coordination Engine.
 * Uses precomputed TrigLUT for zero-spike gait harmonics and viewport-independent sprite transforms.
 */
export const VisualAnimation2D = {
  scaling: 'LINEAR',
  interpolation: true,
  hybridPipelineOrder: ['WORLD_3D_SCANLINE', 'CHARACTER_SIMULATED_3D', 'OVERLAY_2D_HUD'] as readonly HybridRenderLayer[],

  /**
   * Harmonic trot bobbing formula using O(1) TrigLUT: y(t) = |sin(t * frequency)| * amplitude
   */
  calculateTrotBob(frame: number, frequencyRad: number = 0.2, amplitude: number = 2.5): number {
    const deg = frame * frequencyRad * (180 / Math.PI);
    return Math.abs(TrigLUT.sinInterpolated(deg)) * amplitude;
  },

  /**
   * Canine ear oscillation driven by AI frequency parameter (Hz).
   */
  calculateEarBob(bobFrame: number, earFreqHz: number = 1.5, amplitude: number = 2.0): number {
    const deg = bobFrame * earFreqHz * (180 / Math.PI);
    return TrigLUT.sinInterpolated(deg) * amplitude;
  },

  /**
   * Canine tail wag oscillation driven by AI amplitude parameter.
   */
  calculateTailSwing(bobFrame: number, isIntense: boolean, maxAmplitudeDeg: number = 15): number {
    const radScale = isIntense ? 8.0 : 2.0;
    const amp = isIntense ? maxAmplitudeDeg : Math.min(3.5, maxAmplitudeDeg * 0.25);
    return TrigLUT.sinInterpolated(bobFrame * radScale * (180 / Math.PI)) * amp;
  },

  /**
   * Rider hand bobbing harmonic.
   */
  calculateHandBob(bobFrame: number, amplitude: number = 1.2): number {
    return TrigLUT.sinInterpolated(bobFrame * 2.0 * (180 / Math.PI)) * amplitude;
  },

  /**
   * Simulated 3-D foreshortening factor from canine breathing / trot phase [0.96 .. 1.04].
   */
  calculateDepthForeshortening(bobFrame: number, isLeaning: boolean): { scaleX: number; scaleY: number; zShift: number } {
    const out = { scaleX: 1.0, scaleY: 1.0, zShift: 0 };
    return this.calculateDepthForeshorteningInto(out, bobFrame, isLeaning);
  },

  calculateDepthForeshorteningInto(
    out: { scaleX: number; scaleY: number; zShift: number },
    bobFrame: number,
    isLeaning: boolean
  ): { scaleX: number; scaleY: number; zShift: number } {
    const pulse = TrigLUT.cosInterpolated(bobFrame * 114.59) * 0.025;
    const leanFactor = isLeaning ? 1.06 : 1.0;
    out.scaleX = (1.0 + pulse) * leanFactor;
    out.scaleY = 1.0 - pulse * 0.5;
    out.zShift = isLeaning ? 3.5 : 0;
    return out;
  },

  /**
   * Maps virtual 320x180 coordinates onto an arbitrary physical canvas size while preserving aspect ratio.
   */
  mapVirtualToPhysical(
    vx: number,
    vy: number,
    physicalWidth: number,
    physicalHeight: number
  ): Point2D {
    const uniformScale = Math.min(physicalHeight / 180, physicalWidth / 220);
    const centerX = physicalWidth / 2;
    return {
      x: centerX + (vx - 160) * uniformScale,
      y: vy * uniformScale
    };
  },

  smoothstep(edge0: number, edge1: number, x: number): number {
    const t = edge1 !== edge0 ? Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0))) : 0;
    return t * t * (3 - 2 * t);
  },

  lerp(a: number, b: number, t: number): number {
    return a + (b - a) * Math.max(0, Math.min(1, t));
  },

  rotatePoint(p: Point2D, origin: Point2D, angleDeg: number): Point2D {
    const cos = TrigLUT.cosInterpolated(angleDeg);
    const sin = TrigLUT.sinInterpolated(angleDeg);
    const dx = p.x - origin.x;
    const dy = p.y - origin.y;
    return {
      x: origin.x + dx * cos - dy * sin,
      y: origin.y + dx * sin + dy * cos
    };
  }
};

export default VisualAnimation2D;
