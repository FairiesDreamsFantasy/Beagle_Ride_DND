/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/Character/Rider/Mary/POV/Assembly/CSharp/index.tsx
 * Domain: Mary:FirstPersonEyeCamera (CSharp Kernel)
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
  public static readonly domain = "Mary:FirstPersonEyeCamera";

  public static getTraitSpec(): CharacterTraitSpec {
    return {
      entity: "Mary",
      feature: "FirstPersonEyeCamera",
      earSpan: 20,
      eyeHeightFt: 5,
      pitchRatio: 1
    };
  }

  public static filterActiveItems<T extends { enabled: boolean }>(items: readonly T[]): T[] {
    return items.filter(item => item.enabled);
  }

  public static formatStatusSummary(coordX: number, coordY: number): string {
    return `Mary [FirstPersonEyeCamera] @ (${Math.round(coordX)}, ${Math.round(coordY)})`;
  }
}
