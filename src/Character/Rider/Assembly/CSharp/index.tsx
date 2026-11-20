/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/Character/Rider/Assembly/CSharp/index.tsx
 * Domain: RiderSubsystem:Core (CSharp Kernel)
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
  public static readonly domain = "RiderSubsystem:Core";

  public static getTraitSpec(): CharacterTraitSpec {
    return {
      entity: "RiderSubsystem",
      feature: "Core",
      earSpan: 20,
      eyeHeightFt: 5.25,
      pitchRatio: 1
    };
  }

  public static filterActiveItems<T extends { enabled: boolean }>(items: readonly T[]): T[] {
    return items.filter(item => item.enabled);
  }

  public static formatStatusSummary(coordX: number, coordY: number): string {
    return `RiderSubsystem [Core] @ (${Math.round(coordX)}, ${Math.round(coordY)})`;
  }
}
