/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/Character/Beagle/Thelma/Accessories/Tiara/Assembly/CSharp/index.tsx
 * Domain: Thelma:TiaraGeometry (CSharp Kernel)
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
  public static readonly domain = "Thelma:TiaraGeometry";

  public static getTraitSpec(): CharacterTraitSpec {
    return {
      entity: "Thelma",
      feature: "TiaraGeometry",
      earSpan: 22,
      eyeHeightFt: 5.5,
      pitchRatio: 0.88
    };
  }

  public static filterActiveItems<T extends { enabled: boolean }>(items: readonly T[]): T[] {
    return items.filter(item => item.enabled);
  }

  public static formatStatusSummary(coordX: number, coordY: number): string {
    return `Thelma [TiaraGeometry] @ (${Math.round(coordX)}, ${Math.round(coordY)})`;
  }
}
