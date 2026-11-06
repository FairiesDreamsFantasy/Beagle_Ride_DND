/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DRM-Free Architecture Core Specifications.
 * Guarantees unencumbered digital content delivery across all hardware configurations.
 */
export interface DRMFreeConfig {
  isDRMFree: true;
  allowCaptureCards: true;
  allowScreenshots: true;
  allowBuiltInCapture: true;
  hdcpEnforced: false;
  openSourceStandard: 'LBDCD-1.0';
}

export const DRM_FREE_SETTINGS: Readonly<DRMFreeConfig> = Object.freeze({
  isDRMFree: true,
  allowCaptureCards: true,
  allowScreenshots: true,
  allowBuiltInCapture: true,
  hdcpEnforced: false,
  openSourceStandard: 'LBDCD-1.0'
});
