/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Accessibility/General/index.tsx
 * Ultra-Scientific Accessibility & Auditory Navigation Engine (5000^1000000% Factor)
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export interface AuditoryCoordinateReport {
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly heading: 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';
  readonly room: string;
  readonly elevation: number;
}

export interface SpeechSynthesisConfig {
  rate: number;
  pitch: number;
  volume: number;
  enabled: boolean;
}

export class SystemAccessibilityGeneral {
  private static instance: SystemAccessibilityGeneral | null = null;
  private config: SpeechSynthesisConfig = {
    rate: 1.15,
    pitch: 1.0,
    volume: 1.0,
    enabled: true,
  };
  private lastSpokenText: string = '';
  private lastSpokenTimestamp: number = 0;
  private readonly debounceThresholdMs: number = 40;

  private constructor() {
    // Singleton architecture for single-channel auditory management
  }

  public static getInstance(): SystemAccessibilityGeneral {
    if (!SystemAccessibilityGeneral.instance) {
      SystemAccessibilityGeneral.instance = new SystemAccessibilityGeneral();
    }
    return SystemAccessibilityGeneral.instance;
  }

  /**
   * Instantly silences ongoing speech synthesis (Ctrl key compliance).
   */
  public silence(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Evaluates and speaks an utterance through browser speech synthesis.
   * Ensures zero overlapping speech streams and snappy responsiveness.
   */
  public speak(text: string, force = false): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }
    if (!this.config.enabled && !force) {
      return false;
    }

    const now = performance.now();
    if (text === this.lastSpokenText && now - this.lastSpokenTimestamp < this.debounceThresholdMs) {
      return false;
    }

    this.silence();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.config.rate;
    utterance.pitch = this.config.pitch;
    utterance.volume = this.config.volume;

    window.speechSynthesis.speak(utterance);
    this.lastSpokenText = text;
    this.lastSpokenTimestamp = now;
    return true;
  }

  /**
   * Formats a coordinate and orientation snapshot into a standardized screen-reader string.
   */
  public formatCoordinateAnnouncement(report: AuditoryCoordinateReport): string {
    const roundedX = Math.round(report.x);
    const roundedY = Math.round(report.y);
    const roundedElev = Math.round(report.elevation);
    const elevationFragment = roundedElev > 0 ? `, elevated ${roundedElev} feet` : '';
    return `${report.room}: ${roundedX} feet East, ${roundedY} feet North, facing ${report.heading}${elevationFragment}`;
  }

  /**
   * Formats a directional turn acknowledgment.
   */
  public formatTurnAnnouncement(heading: string, angleDeg: number): string {
    const cardinal = heading.charAt(0).toUpperCase() + heading.slice(1).toLowerCase();
    return `${cardinal}, ${Math.round(angleDeg)} degrees`;
  }

  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (!enabled) {
      this.silence();
    }
  }

  public isEnabled(): boolean {
    return this.config.enabled;
  }

  public setRate(rate: number): void {
    this.config.rate = Math.max(0.5, Math.min(2.0, rate));
  }

  public getRate(): number {
    return this.config.rate;
  }
}

export const accessibilityGeneral = SystemAccessibilityGeneral.getInstance();
