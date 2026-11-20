/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/Character/Rider/Mary/Animations/Assembly/CSharp/index.tsx
 * Domain: Mary:Core (CSharp Kernel)
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
  public static readonly domain = "Mary:Core";

  public static getTraitSpec(): CharacterTraitSpec {
    return {
      entity: "Mary",
      feature: "Core",
      earSpan: 20,
      eyeHeightFt: 5,
      pitchRatio: 1
    };
  }

  public static filterActiveItems<T extends { enabled: boolean }>(items: readonly T[]): T[] {
    return items.filter(item => item.enabled);
  }

  public static formatStatusSummary(coordX: number, coordY: number): string {
    return `Mary [Core] @ (${Math.round(coordX)}, ${Math.round(coordY)})`;
  }
}
