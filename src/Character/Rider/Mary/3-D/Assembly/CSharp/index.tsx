/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/Character/Rider/Mary/3-D/Assembly/CSharp/index.tsx
 * Domain: Mary:Volumetric3DRig (CSharp Kernel)
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
  public static readonly domain = "Mary:Volumetric3DRig";

  public static getTraitSpec(): CharacterTraitSpec {
    return {
      entity: "Mary",
      feature: "Volumetric3DRig",
      earSpan: 20,
      eyeHeightFt: 5,
      pitchRatio: 1
    };
  }

  public static filterActiveItems<T extends { enabled: boolean }>(items: readonly T[]): T[] {
    return items.filter(item => item.enabled);
  }

  public static formatStatusSummary(coordX: number, coordY: number): string {
    return `Mary [Volumetric3DRig] @ (${Math.round(coordX)}, ${Math.round(coordY)})`;
  }
}
