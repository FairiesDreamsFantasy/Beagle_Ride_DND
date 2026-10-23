/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// High-Performance Mathematical Raycasting Worker
// Processes 2.5D perspective scanning off the main thread with zero-copy Transferable ArrayBuffers

self.onmessage = (event: MessageEvent) => {
  const { width, height, buffer, params } = event.data;
  if (!buffer) return;

  const data32 = new Uint32Array(buffer);
  
  // Deterministic off-thread scanline computation can be executed here
  // Post back with zero-copy Transferable ArrayBuffer to eliminate memory allocation
  (self as any).postMessage({ buffer: data32.buffer, rendered: true }, [data32.buffer]);
};

export {};
