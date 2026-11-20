/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/Character/Beagle/Tina/Assembly/CSharp/index.tsx
 * Domain: Tina:Core (CSharp Kernel)
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
  public static readonly domain = "Tina:Core";

  public static getTraitSpec(): CharacterTraitSpec {
    return {
      entity: "Tina",
      feature: "Core",
      earSpan: 20,
      eyeHeightFt: 5.5,
      pitchRatio: 1.08
    };
  }

  public static filterActiveItems<T extends { enabled: boolean }>(items: readonly T[]): T[] {
    return items.filter(item => item.enabled);
  }

  public static formatStatusSummary(coordX: number, coordY: number): string {
    return `Tina [Core] @ (${Math.round(coordX)}, ${Math.round(coordY)})`;
  }
}
