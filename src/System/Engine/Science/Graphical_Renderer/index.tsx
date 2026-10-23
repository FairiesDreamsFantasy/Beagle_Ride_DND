/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';
export * from './RendererWorker';

export interface PerspectiveScanlineParameters {
  renderWidth: number;
  renderHeight: number;
  worldX: number;
  worldY: number;
  lookAngle: number;
  horizonOffset: number;
  riderEyeHeight: number;
  ceilingHeight: number;
  fovScale: number;
}

/**
 * High-Performance Scientific Graphical Renderer Engine.
 * Formulates non-blocking, O(1) mathematical perspective scanline matrices.
 */
export const GraphicalRendererEngine = {
  version: '2.0.0-ultra-precise',

  /**
   * Calculates horizontal scanning vectors for a given row and yaw angle.
   */
  calculateScanlineVector(sy: number, horizon: number, lookAngle: number, fovScale: number, riderEyeHeight: number, ceilingHeight: number) {
    const dy = sy - horizon;
    if (dy === 0) return null;

    const isFloor = sy > horizon;
    const h = isFloor ? riderEyeHeight : (ceilingHeight - riderEyeHeight);
    const rad = (lookAngle * Math.PI) / 180;
    const cosLook = Math.cos(rad);
    const sinLook = Math.sin(rad);

    const distance = (h * fovScale) / Math.abs(dy);
    const lookX = sinLook * distance;
    const lookY = -cosLook * distance;
    const spanX = cosLook * distance * 0.95;
    const spanY = sinLook * distance * 0.95;

    return { lookX, lookY, spanX, spanY, isFloor, distance };
  },

  /**
   * Fast 32-bit typed buffer clearing without garbage collection overhead.
   */
  clearBuffer32(buffer: Uint32Array, color32: number = 0xFF0B0B0B): void {
    buffer.fill(color32);
  },

  /**
   * Validates OffscreenCanvas browser hardware capability.
   */
  supportsOffscreenCanvas(): boolean {
    return typeof window !== 'undefined' && typeof (window as any).OffscreenCanvas !== 'undefined';
  }
};

export default GraphicalRendererEngine;
