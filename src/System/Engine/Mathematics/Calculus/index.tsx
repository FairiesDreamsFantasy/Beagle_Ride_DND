/** @license SPDX-License-Identifier: Apache-2.0 */ export const CalculusModule = { derivative: (f: (x: number) => number, x: number, h: number = 1e-5): number => (f(x + h) - f(x)) / h };
