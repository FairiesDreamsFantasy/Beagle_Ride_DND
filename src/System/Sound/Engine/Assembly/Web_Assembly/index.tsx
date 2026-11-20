/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { WebAssemblyConfig, DEFAULT_WEBASSEMBLY_CONFIG } from "./General/index";

/**
 * WebAssembly-Pattern Linear Memory Audio Engine.
 * Provides lazy-allocated 64KB linear memory pages, genuine Radix-2 FFT frequency-domain
 * spectral scaling (with Hermitian conjugate symmetry), batch gain, and DC-offset removal.
 */
export class SoundAssemblyWebAssemblyController {
  private config: WebAssemblyConfig = { ...DEFAULT_WEBASSEMBLY_CONFIG };
  private memoryPage: Float32Array | null = null;
  private fftImagScratch: Float32Array | null = null;

  private ensureMemoryPage(): Float32Array {
    if (!this.memoryPage) {
      this.memoryPage = new Float32Array(16384); // 64KB linear memory page allocated lazily on first use
    }
    return this.memoryPage;
  }

  private ensureImagScratch(size: number): Float32Array {
    if (!this.fftImagScratch || this.fftImagScratch.length < size) {
      this.fftImagScratch = new Float32Array(size);
    } else {
      this.fftImagScratch.fill(0, 0, size);
    }
    return this.fftImagScratch;
  }

  public getStatus() {
    return {
      module: "SoundAssemblyWebAssembly",
      active: true,
      config: this.config,
      linearMemoryBytes: this.memoryPage ? this.memoryPage.byteLength : 0,
      pageCapacityBytes: 16384 * 4,
      pageCount: this.memoryPage ? 1 : 0
    };
  }

  private static fftInPlace(real: Float32Array, imag: Float32Array, offset: number, n: number, inverse: boolean): void {
    // Bit-reversal permutation
    let j = 0;
    for (let i = 1; i < n; i++) {
      let bit = n >> 1;
      while (j & bit) {
        j ^= bit;
        bit >>= 1;
      }
      j ^= bit;
      if (i < j) {
        const idxI = offset + i;
        const idxJ = offset + j;
        const tr = real[idxI];
        real[idxI] = real[idxJ];
        real[idxJ] = tr;
        const ti = imag[i];
        imag[i] = imag[j];
        imag[j] = ti;
      }
    }

    const angleSign = inverse ? 1 : -1;
    for (let len = 2; len <= n; len <<= 1) {
      const halfLen = len >> 1;
      const angle = (angleSign * 2 * Math.PI) / len;
      const wStepRe = Math.cos(angle);
      const wStepIm = Math.sin(angle);
      for (let start = 0; start < n; start += len) {
        let wRe = 1.0;
        let wIm = 0.0;
        for (let k = 0; k < halfLen; k++) {
          const evenIdx = offset + start + k;
          const oddIdx = evenIdx + halfLen;
          const oddLocal = start + k + halfLen;
          const evenLocal = start + k;

          const oRe = real[oddIdx];
          const oIm = imag[oddLocal];
          const tRe = wRe * oRe - wIm * oIm;
          const tIm = wRe * oIm + wIm * oRe;

          real[oddIdx] = real[evenIdx] - tRe;
          imag[oddLocal] = imag[evenLocal] - tIm;
          real[evenIdx] += tRe;
          imag[evenLocal] += tIm;

          const nextWRe = wRe * wStepRe - wIm * wStepIm;
          wIm = wRe * wStepIm + wIm * wStepRe;
          wRe = nextWRe;
        }
      }
    }

    if (inverse) {
      const invN = 1.0 / n;
      for (let i = 0; i < n; i++) {
        real[offset + i] *= invN;
        imag[i] *= invN;
      }
    }
  }

  /**
   * True Frequency-Domain Spectral Equalizer using Radix-2 FFT + IFFT.
   * Transforms time-domain samples into DFT bins, applies conjugate-symmetric spectral
   * tilt weights from DC (lowGain) to Nyquist (highGain), and reconstructs the time signal.
   */
  public spectralScale(offset: number, length: number, lowGain: number, highGain: number): void {
    const page = this.ensureMemoryPage();
    const safeOffset = Math.max(0, Math.min(page.length - 1, offset | 0));
    const maxAvail = page.length - safeOffset;
    const requested = Math.max(2, Math.min(maxAvail, length | 0));

    // Largest power of 2 <= requested for Radix-2 Cooley-Tukey butterfly
    let n = 1;
    while ((n << 1) <= requested) n <<= 1;
    if (n < 2) return;

    const imag = this.ensureImagScratch(n);
    SoundAssemblyWebAssemblyController.fftInPlace(page, imag, safeOffset, n, false);

    const halfN = n >> 1;
    page[safeOffset] *= lowGain; // DC bin
    page[safeOffset + halfN] *= highGain; // Nyquist bin
    for (let k = 1; k < halfN; k++) {
      const weight = lowGain + ((highGain - lowGain) * k) / halfN;
      page[safeOffset + k] *= weight;
      imag[k] *= weight;
      // Preserve Hermitian symmetry for real-valued time-domain reconstruction
      page[safeOffset + n - k] *= weight;
      imag[n - k] *= weight;
    }

    SoundAssemblyWebAssemblyController.fftInPlace(page, imag, safeOffset, n, true);
  }

  /**
   * Linear-memory batch gain scaling.
   */
  public applyLinearGain(offset: number, length: number, gainFactor: number): void {
    const page = this.ensureMemoryPage();
    const start = Math.max(0, offset | 0);
    const end = Math.min(page.length, start + Math.max(0, length | 0));
    for (let i = start; i < end; i++) {
      page[i] *= gainFactor;
    }
  }

  /**
   * Deterministic DC-offset mean subtraction pass in linear memory.
   */
  public removeDCOffset(offset: number, length: number): void {
    const page = this.ensureMemoryPage();
    const start = Math.max(0, offset | 0);
    const end = Math.min(page.length, start + Math.max(0, length | 0));
    const count = end - start;
    if (count <= 0) return;

    let mean = 0;
    for (let i = start; i < end; i++) {
      mean += page[i];
    }
    mean /= count;
    for (let i = start; i < end; i++) {
      page[i] -= mean;
    }
  }

  public getMemorySlice(offset: number, length: number): Float32Array {
    const page = this.ensureMemoryPage();
    const start = Math.max(0, Math.min(page.length, offset | 0));
    const end = Math.max(start, Math.min(page.length, start + Math.max(0, length | 0)));
    return page.subarray(start, end);
  }
}

export const soundAssemblyWebAssemblyController = new SoundAssemblyWebAssemblyController();
export default soundAssemblyWebAssemblyController;
