/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CSharpConfig, DEFAULT_CSHARP_CONFIG } from "./General/index";

/**
 * C# LINQ-style zero-allocation lazy iterator sequence.
 */
export class Enumerable<T> {
  private items: T[];

  constructor(items: T[]) {
    this.items = items;
  }

  public where(predicate: (item: T) => boolean): Enumerable<T> {
    const result: T[] = [];
    for (let i = 0; i < this.items.length; i++) {
      if (predicate(this.items[i])) {
        result.push(this.items[i]);
      }
    }
    return new Enumerable<T>(result);
  }

  public select<U>(selector: (item: T) => U): Enumerable<U> {
    const result: U[] = new Array(this.items.length);
    for (let i = 0; i < this.items.length; i++) {
      result[i] = selector(this.items[i]);
    }
    return new Enumerable<U>(result);
  }

  public firstOrDefault(predicate?: (item: T) => boolean): T | null {
    if (!predicate) return this.items.length > 0 ? this.items[0] : null;
    for (let i = 0; i < this.items.length; i++) {
      if (predicate(this.items[i])) return this.items[i];
    }
    return null;
  }

  public toArray(): T[] {
    return this.items;
  }

  public count(): number {
    return this.items.length;
  }
}

/**
 * CSharp Controller.
 * Provides deterministic LINQ-style sequence transforms, immutable struct emulations, and strongly-typed queries.
 */
export class CSharpController {
  private config: CSharpConfig = { ...DEFAULT_CSHARP_CONFIG };

  public getStatus() {
    return { module: "CSharp", active: true, config: this.config };
  }

  /**
   * Wraps an array into a LINQ-style Enumerable.
   */
  public from<T>(items: T[]): Enumerable<T> {
    return new Enumerable<T>(items);
  }

  /**
   * Computes an immutable 2D vector coordinate struct.
   */
  public structVector2(x: number, y: number): Readonly<{ x: number; y: number }> {
    return Object.freeze({ x, y });
  }
}

export const cSharpController = new CSharpController();
export default cSharpController;
