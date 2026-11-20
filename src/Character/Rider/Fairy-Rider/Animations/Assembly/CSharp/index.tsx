/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/Character/Rider/Fairy-Rider/Animations/Assembly/CSharp/index.tsx
 * Domain: FairyRider:Core (CSharp Kernel)
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
  public static readonly domain = "FairyRider:Core";

  public static getTraitSpec(): CharacterTraitSpec {
    return {
      entity: "FairyRider",
      feature: "Core",
      earSpan: 20,
      eyeHeightFt: 5.5,
      pitchRatio: 1.12
    };
  }

  public static filterActiveItems<T extends { enabled: boolean }>(items: readonly T[]): T[] {
    return items.filter(item => item.enabled);
  }

  public static formatStatusSummary(coordX: number, coordY: number): string {
    return `FairyRider [Core] @ (${Math.round(coordX)}, ${Math.round(coordY)})`;
  }
}
