/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const CalculusModule = {
  derivative: (f: (x: number) => number, x: number, h: number = 1e-5): number => (f(x + h) - f(x)) / h,
  centralDerivative: (f: (x: number) => number, x: number, h: number = 1e-5): number => (f(x + h) - f(x - h)) / (2 * h),
  integrateRK4: (state: number, vel: number, accel: number, dt: number): { pos: number; vel: number } => {
    const k1v = accel;
    const k1x = vel;
    const k2v = accel;
    const k2x = vel + 0.5 * dt * k1v;
    const k3v = accel;
    const k3x = vel + 0.5 * dt * k2v;
    const k4v = accel;
    const k4x = vel + dt * k3v;
    return {
      pos: state + (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x),
      vel: vel + (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v)
    };
  },
  integrateVerlet: (pos: number, vel: number, accel: number, nextAccel: number, dt: number): { pos: number; vel: number } => {
    const nextPos = pos + vel * dt + 0.5 * accel * dt * dt;
    const nextVel = vel + 0.5 * (accel + nextAccel) * dt;
    return { pos: nextPos, vel: nextVel };
  },
  simpsonIntegrate: (f: (x: number) => number, a: number, b: number, intervals: number = 16): number => {
    const n = intervals % 2 === 0 ? Math.max(2, intervals) : intervals + 1;
    const h = (b - a) / n;
    let sum = f(a) + f(b);
    for (let i = 1; i < n; i++) {
      sum += (i % 2 === 0 ? 2 : 4) * f(a + i * h);
    }
    return (sum * h) / 3;
  }
};
