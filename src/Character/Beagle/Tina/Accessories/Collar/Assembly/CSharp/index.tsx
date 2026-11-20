/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/Character/Beagle/Tina/Accessories/Collar/Assembly/CSharp/index.tsx
 * Domain: Tina:CollarGeometry (CSharp Kernel)
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
  public static readonly domain = "Tina:CollarGeometry";

  public static getTraitSpec(): CharacterTraitSpec {
    return {
      entity: "Tina",
      feature: "CollarGeometry",
      earSpan: 25,
      eyeHeightFt: 5.5,
      pitchRatio: 1.08
    };
  }

  public static filterActiveItems<T extends { enabled: boolean }>(items: readonly T[]): T[] {
    return items.filter(item => item.enabled);
  }

  public static formatStatusSummary(coordX: number, coordY: number): string {
    return `Tina [CollarGeometry] @ (${Math.round(coordX)}, ${Math.round(coordY)})`;
  }
}
