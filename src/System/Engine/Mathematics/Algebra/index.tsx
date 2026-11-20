/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const AlgebraModule = {
  solveLinear: (m: number, x: number, b: number): number => m * x + b,
  clamp: (val: number, min: number, max: number): number => (val < min ? min : val > max ? max : val),
  lerp: (a: number, b: number, t: number): number => a + (b - a) * (t < 0 ? 0 : t > 1 ? 1 : t),
  inverseLerp: (a: number, b: number, v: number): number => (b !== a ? (v - a) / (b - a) : 0),
  smoothstep: (edge0: number, edge1: number, x: number): number => {
    const t = edge1 !== edge0 ? Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0))) : 0;
    return t * t * (3 - 2 * t);
  },
  fixedMul16: (a: number, b: number): number => ((a * b) >> 16) | 0,
  exponentialDamping: (current: number, target: number, lambda: number, dt: number): number => {
    const decay = 1 - Math.exp(-Math.max(0, lambda) * Math.max(0, dt));
    return current + (target - current) * decay;
  },
  ema: (prev: number, sample: number, alpha: number): number => {
    const a = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
    return prev * (1 - a) + sample * a;
  },
  solveQuadraticReal: (a: number, b: number, c: number): [number, number] | null => {
    if (Math.abs(a) < 1e-12) {
      if (Math.abs(b) < 1e-12) return null;
      const root = -c / b;
      return [root, root];
    }
    const disc = b * b - 4 * a * c;
    if (disc < 0) return null;
    const sqrtDisc = Math.sqrt(disc);
    const inv2a = 0.5 / a;
    return [(-b - sqrtDisc) * inv2a, (-b + sqrtDisc) * inv2a];
  }
};
