/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Accessibility/General/index.tsx
 * Accessibility & Auditory Navigation Engine
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
  private readonly debounceThresholdMs: number = 180; // High-precision 180ms window prevents OS IPC thrashing
  private isSpeaking: boolean = false;
  private pendingSpeakTimer: ReturnType<typeof setTimeout> | null = null;

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
   * Instantly silences ongoing speech synthesis with zero-redundancy cancellation check.
   */
  public silence(): void {
    if (this.pendingSpeakTimer !== null) {
      clearTimeout(this.pendingSpeakTimer);
      this.pendingSpeakTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Only invoke OS speech cancel if actively speaking or pending to prevent redundant IPC context switches
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Graceful fallback for non-blocking browser threads
        }
      }
      this.isSpeaking = false;
    }
  }

  /**
   * Evaluates and speaks an utterance through browser speech synthesis.
   * Uses debounce, rate limiting, and micro-coalesced dispatch after cancel() to prevent speech IPC stalls.
   */
  public speak(text: string, force = false): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }
    if (!this.config.enabled && !force) {
      return false;
    }

    const now = performance.now();
    // Intelligent rate limiting: suppress duplicate announcements within debounce window
    if (!force && text === this.lastSpokenText && now - this.lastSpokenTimestamp < this.debounceThresholdMs) {
      return false;
    }
    // High-frequency throttle: prevent more than one non-forced message per 90ms
    if (!force && now - this.lastSpokenTimestamp < 90) {
      return false;
    }

    const wasBusy = window.speechSynthesis.speaking || window.speechSynthesis.pending;
    this.silence();
    this.lastSpokenText = text;
    this.lastSpokenTimestamp = now;

    const dispatchUtterance = () => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.config.rate;
        utterance.pitch = this.config.pitch;
        utterance.volume = this.config.volume;

        utterance.onstart = () => {
          this.isSpeaking = true;
        };
        utterance.onend = () => {
          this.isSpeaking = false;
        };
        utterance.onerror = () => {
          this.isSpeaking = false;
        };

        window.speechSynthesis.speak(utterance);
      } catch {
        this.isSpeaking = false;
      }
    };

    // Deferring speak by 16ms after cancel() prevents Chromium synchronous cancel()+speak() queue deadlock
    if (wasBusy) {
      this.pendingSpeakTimer = setTimeout(() => {
        this.pendingSpeakTimer = null;
        dispatchUtterance();
      }, 16);
    } else {
      dispatchUtterance();
    }

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
