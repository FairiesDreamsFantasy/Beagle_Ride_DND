/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/Character/Beagle/Jetta/Animation/Movements/Jump/Assembly/CSharp/index.tsx
 * Domain: Jetta:ParabolicJumpArc (CSharp Kernel)
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
  public static readonly domain = "Jetta:ParabolicJumpArc";

  public static getTraitSpec(): CharacterTraitSpec {
    return {
      entity: "Jetta",
      feature: "ParabolicJumpArc",
      earSpan: 20,
      eyeHeightFt: 5.5,
      pitchRatio: 1
    };
  }

  public static filterActiveItems<T extends { enabled: boolean }>(items: readonly T[]): T[] {
    return items.filter(item => item.enabled);
  }

  public static formatStatusSummary(coordX: number, coordY: number): string {
    return `Jetta [ParabolicJumpArc] @ (${Math.round(coordX)}, ${Math.round(coordY)})`;
  }
}
