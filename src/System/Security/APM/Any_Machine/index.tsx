/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APMMachineClassification, APMDeviceFormFactor } from '../General/index';

/**
 * System-Level Machine Classification Metrics and Device Form-Factor Detector.
 * Determines whether the executing environment is desktop, mobile, tablet, arcade cabinet, or console.
 */
export class AnyMachineClassifier {
  private static instance: AnyMachineClassifier | null = null;

  public static getInstance(): AnyMachineClassifier {
    if (!AnyMachineClassifier.instance) {
      AnyMachineClassifier.instance = new AnyMachineClassifier();
    }
    return AnyMachineClassifier.instance;
  }

  public classifyMachine(): APMMachineClassification {
    const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
    const ua = isBrowser ? (navigator.userAgent || '') : 'Headless-Node-Runtime';
    const platform = isBrowser ? (navigator.platform || '') : 'Server';

    let formFactor: APMDeviceFormFactor = 'DESKTOP';
    const isTouchCapable = isBrowser && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const isHighDPI = isBrowser && window.devicePixelRatio > 1.5;

    if (/Mobi|Android|iPhone|iPod/i.test(ua)) {
      formFactor = 'MOBILE';
    } else if (/iPad|Tablet/i.test(ua) || (isTouchCapable && isBrowser && window.innerWidth >= 768 && window.innerWidth <= 1024)) {
      formFactor = 'TABLET';
    } else if (/Nintendo|PlayStation|Xbox/i.test(ua)) {
      formFactor = 'EMBEDDED_CONSOLE';
    } else if (!isBrowser) {
      formFactor = 'HEADLESS_SERVER';
    } else if (isBrowser && window.innerWidth >= 1920 && isTouchCapable) {
      formFactor = 'ARCADE_CABINET';
    } else {
      formFactor = 'DESKTOP';
    }

    return {
      formFactor,
      isTouchCapable,
      isHighDPI,
      isBatteryPowered: isTouchCapable && (formFactor === 'MOBILE' || formFactor === 'TABLET'),
      platformName: platform,
      userAgentSnapshot: ua.substring(0, 120)
    };
  }
}

export const anyMachineClassifier = AnyMachineClassifier.getInstance();
export default anyMachineClassifier;
