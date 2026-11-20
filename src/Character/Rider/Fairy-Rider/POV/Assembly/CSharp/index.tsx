/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/Character/Rider/Fairy-Rider/POV/Assembly/CSharp/index.tsx
 * Domain: FairyRider:FirstPersonEyeCamera (CSharp Kernel)
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
  public static readonly domain = "FairyRider:FirstPersonEyeCamera";

  public static getTraitSpec(): CharacterTraitSpec {
    return {
      entity: "FairyRider",
      feature: "FirstPersonEyeCamera",
      earSpan: 20,
      eyeHeightFt: 5.5,
      pitchRatio: 1.12
    };
  }

  public static filterActiveItems<T extends { enabled: boolean }>(items: readonly T[]): T[] {
    return items.filter(item => item.enabled);
  }

  public static formatStatusSummary(coordX: number, coordY: number): string {
    return `FairyRider [FirstPersonEyeCamera] @ (${Math.round(coordX)}, ${Math.round(coordY)})`;
  }
}
