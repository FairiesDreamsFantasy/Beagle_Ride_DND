/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/Character/Rider/Fairy-Rider/Animations/Pixelations/Assembly/CSharp/index.tsx
 * Domain: FairyRider:RetroPixelQuantizer (CSharp Kernel)
 */

export interface CharacterTraitSpec {
  readonly entity: string;
  readonly feature: string;
  readonly earSpan: number;
  readonly eyeHeightFt: number;
  readonly pitchRatio: number;
}

export class CharacterCSharpLogic {
  public static status = "Operational";
  public static readonly domain = "FairyRider:RetroPixelQuantizer";

  public static getTraitSpec(): CharacterTraitSpec {
    return {
      entity: "FairyRider",
      feature: "RetroPixelQuantizer",
      earSpan: 20,
      eyeHeightFt: 5.5,
      pitchRatio: 1.12
    };
  }

  public static filterActiveItems<T extends { enabled: boolean }>(items: readonly T[]): T[] {
    return items.filter(item => item.enabled);
  }

  public static formatStatusSummary(coordX: number, coordY: number): string {
    return `FairyRider [RetroPixelQuantizer] @ (${Math.round(coordX)}, ${Math.round(coordY)})`;
  }
}
