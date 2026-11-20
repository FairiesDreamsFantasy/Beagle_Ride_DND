/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/System/Building_Blocks/Ceiling/Engine/Assembly/C/index.tsx
 * Domain: Ceiling Coffer & Span Physics (C Kernel)
 */

export class CEngine {
  public static status = "Operational";
  public static readonly domain = "Building_Blocks/Ceiling";
  public static readonly defaultUnit = 80;
  private static scratchSlab: Uint8Array | null = null;
  private static scratchOffset = 0;

  private static ensureScratch(): Uint8Array {
    if (!this.scratchSlab) {
      this.scratchSlab = new Uint8Array(16384); // Lazy 16KB cyclic bump slab (0B at startup)
    }
    return this.scratchSlab;
  }

  public static malloc(bytes: number): Uint8Array {
    const slab = this.ensureScratch();
    const safeBytes = Math.max(0, Math.min(slab.length, bytes | 0));
    const aligned = (safeBytes + 3) & ~3;
    if (this.scratchOffset + aligned > slab.length) {
      this.scratchOffset = 0;
    }
    const view = slab.subarray(this.scratchOffset, this.scratchOffset + safeBytes);
    this.scratchOffset += aligned;
    return view;
  }

  public static resetScratch(): void {
    this.scratchOffset = 0;
  }

  public static toFixed16(value: number): number {
    return (value * 65536) | 0;
  }

  public static fromFixed16(fixedVal: number): number {
    return fixedVal / 65536;
  }

  public static snapToGrid(coord: number, unit: number = this.defaultUnit): number {
    return Math.floor(coord / unit) * unit;
  }
}
