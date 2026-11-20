/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/Character/Beagle/Tina/Accessories/Collar/Assembly/C/index.tsx
 * Domain: Tina:CollarGeometry (C Kernel)
 */

export class CharacterCLogic {
  public static status = "Operational";
  public static readonly domain = "Tina:CollarGeometry";
  public static readonly baseRgb24 = 0xE1F5FE;
  public static readonly pitchRatio = 1.08;

  public static toFixed16(value: number): number {
    return (value * 65536) | 0;
  }

  public static fromFixed16(fixedVal: number): number {
    return fixedVal / 65536;
  }

  public static packColorABGR32(rgb24: number = this.baseRgb24, alpha: number = 255): number {
    const r = (rgb24 >>> 16) & 0xFF;
    const g = (rgb24 >>> 8) & 0xFF;
    const b = rgb24 & 0xFF;
    return (((alpha & 0xFF) << 24) | (b << 16) | (g << 8) | r) >>> 0;
  }

  public static packPoseMask(stridePhaseByte: number, active: boolean, leaning: boolean): number {
    return (((active ? 1 : 0) << 9) | ((leaning ? 1 : 0) << 8) | (stridePhaseByte & 0xFF)) >>> 0;
  }
}
