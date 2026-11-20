/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SpanSlice {
  start: number;
  length: number;
}

/**
 * C#-Style Zero-Allocation Span<T> Indexing & Numerical Queries.
 * Performs reductions and searches in-place without allocating intermediate arrays.
 */
export class CSharpEngine {
  public static status = "Operational";

  public static createSpan(start: number, length: number, maxLength: number): SpanSlice {
    const s = Math.max(0, Math.min(start, maxLength));
    const len = Math.max(0, Math.min(length, maxLength - s));
    return { start: s, length: len };
  }

  public static sumRange(data: ArrayLike<number>, start: number = 0, length: number = data.length): number {
    const end = Math.min(data.length, Math.max(0, start) + Math.max(0, length));
    let total = 0;
    for (let i = Math.max(0, start); i < end; i++) {
      total += data[i];
    }
    return total;
  }

  public static binarySearchSorted(sorted: ArrayLike<number>, target: number): number {
    let low = 0;
    let high = sorted.length - 1;
    while (low <= high) {
      const mid = (low + high) >>> 1;
      const val = sorted[mid];
      if (val === target) return mid;
      if (val < target) low = mid + 1;
      else high = mid - 1;
    }
    return ~low;
  }
}
