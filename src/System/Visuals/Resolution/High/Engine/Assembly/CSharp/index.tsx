/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/System/Visuals/Resolution/High/Engine/Assembly/CSharp/index.tsx
 * Domain: High-Density 16:9 Viewport (CSharp Kernel)
 */

export class CSharpEngine {
  public static status = "Operational";
  public static readonly domain = "Visuals/Resolution/High";
  public static readonly defaultUnit = 480;

  public static linq<T, U = T>(
    arr: readonly T[],
    predicate?: (item: T, index: number) => boolean,
    selector?: (item: T, index: number) => U
  ): U[] {
    const filtered = predicate ? arr.filter(predicate) : arr.slice();
    return selector ? filtered.map((item, idx) => selector(item, idx)) : (filtered as unknown as U[]);
  }

  public static aggregateBounds(values: readonly number[]): { min: number; max: number; span: number } {
    if (values.length === 0) return { min: 0, max: 0, span: 0 };
    let min = values[0];
    let max = values[0];
    for (let i = 1; i < values.length; i++) {
      if (values[i] < min) min = values[i];
      if (values[i] > max) max = values[i];
    }
    return { min, max, span: max - min };
  }
}
