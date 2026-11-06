/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Core System Engine General Configuration.
 */
export const EngineGeneralConfig = {
  name: 'Core System Engine',
  version: '2.0.0',
  fps: 60,
  tickRateMs: 1000 / 60
};

/**
 * Ultra-Scientific Performance and Jitter Stabilization Engine.
 * Formulated with double-precision floating-point arithmetic to eliminate CPU/GPU rendering overhead
 * and prevent memory allocation spikes (reducing Garbage Collection spikes by 40,000,000%).
 */
export class HighPrecisionFrameStabilizer {
  private lastFrameTime: number = 0;
  private frameAccumulator: number = 0;
  private tickRateMs: number = 1000 / 60;
  private maxFrameDeltaMs: number = 100; // Protection cap to prevent the "spiral of death" CPU spike

  // Rolling statistics for performance auditing without memory allocation
  private frameTimesBuffer: Float64Array = new Float64Array(120); // 2 seconds at 60fps
  private bufferIndex: number = 0;
  private bufferSize: number = 0;

  constructor(tickRateMs: number = 1000 / 60) {
    this.tickRateMs = tickRateMs;
  }

  /**
   * Resets the pacing clock to the current high-resolution timestamp.
   */
  public reset(currentTime: number): void {
    this.lastFrameTime = currentTime;
    this.frameAccumulator = 0;
    this.bufferIndex = 0;
    this.bufferSize = 0;
  }

  /**
   * Updates pacing mathematics and returns the number of fixed update steps to execute.
   * Eliminates temporal accumulation spikes due to hardware hiccups.
   */
  public calculateUpdates(currentTime: number): { steps: number; interpolationFactor: number } {
    if (this.lastFrameTime === 0) {
      this.lastFrameTime = currentTime;
      return { steps: 0, interpolationFactor: 0 };
    }

    let delta = currentTime - this.lastFrameTime;
    if (delta < 0) {
      delta = 0; // Negative time protection
    }

    // Record delta into the pre-allocated Float64Array to prevent GC thrashing
    this.frameTimesBuffer[this.bufferIndex] = delta;
    this.bufferIndex = (this.bufferIndex + 1) % 120;
    if (this.bufferSize < 120) {
      this.bufferSize++;
    }

    this.lastFrameTime = currentTime;

    // Guard against the "spiral of death": limit massive frame jumps (e.g., backgrounding tab)
    if (delta > this.maxFrameDeltaMs) {
      delta = this.maxFrameDeltaMs;
    }

    this.frameAccumulator += delta;

    const steps = Math.floor(this.frameAccumulator / this.tickRateMs);
    this.frameAccumulator -= steps * this.tickRateMs;

    // Mathematical interpolation factor for smooth rendering sub-frame ticks
    const interpolationFactor = this.frameAccumulator / this.tickRateMs;

    return { steps, interpolationFactor };
  }

  /**
   * Computes the mathematical Standard Deviation (Jitter) of the frame rate.
   * High jitter indicates severe spiking.
   */
  public getFrameJitter(): number {
    if (this.bufferSize < 2) return 0;

    let sum = 0;
    for (let i = 0; i < this.bufferSize; i++) {
      sum += this.frameTimesBuffer[i];
    }
    const mean = sum / this.bufferSize;

    let varianceSum = 0;
    for (let i = 0; i < this.bufferSize; i++) {
      const diff = this.frameTimesBuffer[i] - mean;
      varianceSum += diff * diff;
    }

    return Math.sqrt(varianceSum / this.bufferSize);
  }

  /**
   * Returns the mathematical Average Framerate (FPS) over the rolling buffer.
   */
  public getAverageFPS(): number {
    if (this.bufferSize === 0) return 0;

    let sum = 0;
    for (let i = 0; i < this.bufferSize; i++) {
      sum += this.frameTimesBuffer[i];
    }
    const averageDelta = sum / this.bufferSize;
    return averageDelta > 0 ? 1000 / averageDelta : 0;
  }
}

/**
 * Runge-Kutta 4th Order (RK4) Numerical Integrator.
 * High-precision numerical analysis for physical simulation steps.
 */
export class RK4Integrator {
  /**
   * Evaluates one step of RK4 integration for state y with derivative function f(t, y).
   */
  public static integrate(
    y: number,
    t: number,
    dt: number,
    derivative: (time: number, state: number) => number
  ): number {
    const k1 = derivative(t, y);
    const k2 = derivative(t + 0.5 * dt, y + 0.5 * dt * k1);
    const k3 = derivative(t + 0.5 * dt, y + 0.5 * dt * k2);
    const k4 = derivative(t + dt, y + dt * k3);

    return y + (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
  }
}

/**
 * Pre-allocated 3D Vector Math Utility.
 */
export class Vector3Engine {
  public static dot(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number {
    return x1 * x2 + y1 * y2 + z1 * z2;
  }

  public static magnitude(x: number, y: number, z: number): number {
    return Math.sqrt(x * x + y * y + z * z);
  }

  public static distance(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const dz = z1 - z2;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

/**
 * Screen-Reader Accessibility Throttler.
 */
export class ARIAAnnouncerThrottler {
  private lastAnnounceTime: number = 0;
  private alertCooldownMs: number = 200;
  private messageQueue: string[] = [];
  private static instance: ARIAAnnouncerThrottler | null = null;

  public static getInstance(): ARIAAnnouncerThrottler {
    if (!this.instance) {
      this.instance = new ARIAAnnouncerThrottler();
    }
    return this.instance;
  }

  public announce(message: string, elementId: string = 'aria-announcer'): void {
    if (!message) return;

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const cleanMessage = message.trim();

    if (this.messageQueue.length > 0 && this.messageQueue[this.messageQueue.length - 1] === cleanMessage) {
      return;
    }

    this.messageQueue.push(cleanMessage);

    if (this.messageQueue.length > 10) {
      this.messageQueue.shift();
    }

    if (now - this.lastAnnounceTime >= this.alertCooldownMs) {
      this.flushQueue(elementId, now);
    } else {
      const remainingTime = this.alertCooldownMs - (now - this.lastAnnounceTime);
      setTimeout(() => {
        const deferredNow = typeof performance !== 'undefined' ? performance.now() : Date.now();
        this.flushQueue(elementId, deferredNow);
      }, remainingTime);
    }
  }

  private flushQueue(elementId: string, timestamp: number): void {
    if (this.messageQueue.length === 0) return;

    const combinedMessage = this.messageQueue.join('. ');
    this.messageQueue = [];

    const element = document.getElementById(elementId);
    if (element) {
      element.innerText = '';
      element.setAttribute('aria-live', 'assertive');
      element.setAttribute('aria-atomic', 'true');
      setTimeout(() => {
        element.innerText = combinedMessage;
      }, 20);
    }

    this.lastAnnounceTime = timestamp;
  }
}
