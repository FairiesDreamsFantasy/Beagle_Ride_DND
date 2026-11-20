/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// High-Performance Mathematical Raycasting Worker
// Processes 2.5D vintage Mode-7 perspective scanlines off the main thread with zero-copy Transferable ArrayBuffers

export interface WorkerScanlineParams {
  worldX: number;
  worldY: number;
  lookAngle: number;
  horizonOffset: number;
  riderEyeHeight: number;
  ceilingHeight: number;
  fovScale: number;
  floorTileSize?: number;
}

self.onmessage = (event: MessageEvent) => {
  const { width, height, buffer, params } = event.data as {
    width: number;
    height: number;
    buffer: ArrayBuffer;
    params?: WorkerScanlineParams;
  };
  if (!buffer || !width || !height) return;

  const data32 = new Uint32Array(buffer);

  if (params) {
    const rad = (params.lookAngle * Math.PI) / 180;
    const cosLook = Math.cos(rad);
    const sinLook = Math.sin(rad);
    const horizon = Math.floor(height / 2) + Math.floor(params.horizonOffset);
    const tileSize = params.floorTileSize || 40;
    const effectiveFov = params.fovScale * (height / 180);
    const halfSpanScale = 0.95 * ((width / height) / (16 / 9));
    const invHalfW = 2.0 / width;

    for (let sy = 0; sy < height; sy++) {
      const dy = sy - horizon;
      if (dy === 0) {
        data32.fill(0xFF0B0B0B, sy * width, (sy + 1) * width);
        continue;
      }

      const isFloor = sy > horizon;
      const h = isFloor ? params.riderEyeHeight : (params.ceilingHeight - params.riderEyeHeight);
      const distance = (h * effectiveFov) / Math.abs(dy);
      const cx = params.worldX + sinLook * distance;
      const cy = params.worldY - cosLook * distance;
      const spanX = cosLook * distance * halfSpanScale;
      const spanY = sinLook * distance * halfSpanScale;

      let rx = cx - spanX;
      let ry = cy - spanY;
      const stepX = spanX * invHalfW;
      const stepY = spanY * invHalfW;
      const rowBase = sy * width;

      for (let sx = 0; sx < width; sx++) {
        const tx = Math.floor(rx / tileSize);
        const ty = Math.floor(ry / tileSize);
        const alt = ((tx + ty) & 1) === 0;
        data32[rowBase + sx] = isFloor
          ? (alt ? 0xFFCE8836 : 0xFF0BB174)
          : (alt ? 0xFFE0EAEF : 0xFFCCE0EC);
        rx += stepX;
        ry += stepY;
      }
    }
  } else {
    data32.fill(0xFF0B0B0B);
  }

  // Post back with zero-copy Transferable ArrayBuffer to eliminate memory allocation
  (self as unknown as { postMessage: (msg: unknown, transfer: Transferable[]) => void }).postMessage(
    { buffer: data32.buffer, rendered: true },
    [data32.buffer]
  );
};

export {};
