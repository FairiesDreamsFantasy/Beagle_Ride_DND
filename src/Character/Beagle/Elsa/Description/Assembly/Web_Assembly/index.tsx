/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/Character/Beagle/Elsa/Description/Assembly/Web_Assembly/index.tsx
 * Domain: Elsa:AccessibilityDescriptor (WebAssembly Kernel)
 */

export class CharacterWebAssemblyLogic {
  public static status = "Operational";
  public static readonly domain = "Elsa:AccessibilityDescriptor";
  public static readonly earSpanPx = 20;

  public static encodeStateWord32(earOffsetPx: number, tailOffsetPx: number, interactionBits: number): number {
    const e = (Math.round(earOffsetPx * 4) + 128) & 0xFF;
    const tl = (Math.round(tailOffsetPx * 4) + 128) & 0xFF;
    return (((interactionBits & 0xFFFF) << 16) | (tl << 8) | e) >>> 0;
  }

  public static decodeEarOffsetPx(word32: number): number {
    return ((word32 & 0xFF) - 128) * 0.25;
  }

  public static alignVertexStride(vertexCount: number, floatsPerVertex: number = 4): number {
    return ((Math.max(0, vertexCount | 0) * floatsPerVertex * 4) + 15) & ~15;
  }
}
