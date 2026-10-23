/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Accessibility/Engine/index.tsx
 * Accessibility Computation Engine.
 * Manages token-bucket rate limiting, screen-reader text formatting, and auditory state.
 */

export interface AuditoryReport {
  x: number;
  y: number;
  heading: string;
  room: string;
}

export class AccessibilityEngineClass {
  private lastSpoken: string = '';
  private lastTimestamp: number = 0;
  private minIntervalMs: number = 180;

  public evaluateSpeech(text: string, force = false): boolean {
    const now = performance.now();
    if (!force && text === this.lastSpoken && now - this.lastTimestamp < this.minIntervalMs) {
      return false;
    }
    this.lastSpoken = text;
    this.lastTimestamp = now;
    return true;
  }

  public formatCoordinates(report: AuditoryReport): string {
    return `${report.room}: Position X ${Math.round(report.x)}, Y ${Math.round(report.y)}, facing ${report.heading}`;
  }
}

export const accessibilityEngine = new AccessibilityEngineClass();
export default accessibilityEngine;
