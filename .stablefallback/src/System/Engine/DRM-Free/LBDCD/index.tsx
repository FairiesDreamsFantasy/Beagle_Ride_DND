/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';
export * from './Accessibility_First/index';
export * from './Analog/index';
export * from './HDMI/index';
export * from './Keyboard_First/index';
export * from './USB/index';
export * from './PS2/index';
export * from './COM/index';
export * from './Works_Offline/index';
export * from './Low-RAM/index';

import { LBDCDPortStatus, SUPPORTED_LBDCD_PORTS } from './General/index';
import { analogOutputSubsystem } from './Analog/index';
import { hdmiOutputController } from './HDMI/index';
import { usbOutputController } from './USB/index';
import { ps2OutputController } from './PS2/index';
import { comPortOutputController } from './COM/index';
import { worksOfflineController } from './Works_Offline/index';
import { lowRAMBufferManager } from './Low-RAM/index';

/**
 * Low-Bandwidth Digital Content Delivery (LBDCD) Main Controller.
 * Open-source alternative to HDCP providing unrestricted display/audio delivery across all output interfaces.
 */
export class LBDCDController {
  public getActiveDeliveryPorts(): LBDCDPortStatus[] {
    return SUPPORTED_LBDCD_PORTS.map((port) => ({
      portType: port,
      isActive: true,
      bandwidthKbps: 1048576,
      captureCardSupported: true,
      screenshotPermitted: true
    }));
  }

  public isCaptureAllowed(): boolean {
    return true; // DRM-Free open streaming guarantee
  }

  public isOfflineReady(): boolean {
    return worksOfflineController.verifyOfflineCapability();
  }

  public getMemoryProfile() {
    return lowRAMBufferManager.getMemoryStrategy();
  }
}

export const lbdcdController = new LBDCDController();
