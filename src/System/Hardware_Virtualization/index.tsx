/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './CPU/index';
export * from './RAM/index';
export * from './Video_Card/index';
export * from './Sound_Card/index';

import { cpuUnit } from './CPU/index';
import { ramUnit } from './RAM/index';
import { videoCardUnit, VirtualizedViewportState } from './Video_Card/index';
import { soundCardUnit } from './Sound_Card/index';

export interface HypervisorBudgetReport {
  status: 'HYPERVISOR_ACTIVE';
  mode: 'BOUNDED_VIRTUALIZATION';
  emaFrameMs: number;
  qualityScale: number;
  maxPhysicalPixels: number;
  cpuQueueDepth: number;
  cpuTasksProcessed: number;
  ramPooledBytes: number;
  ramCacheHits: number;
}

/**
 * Hardware Virtualization Hypervisor Facade.
 * Coordinates CPU micro-task slicing, RAM slab pooling, Video Card pixel budgeting,
 * and Sound Card polyphony throttling so the game runs smoothly without overtaking host resources.
 */
export const HardwareVirtualization = {
  status: 'OPTIMIZED',
  mode: 'BOUNDED_VIRTUALIZATION',
  cpu: cpuUnit,
  ram: ramUnit,
  videoCard: videoCardUnit,
  soundCard: soundCardUnit,

  beginFrame(frameStartTime: number, containerWidth: number, containerHeight: number): VirtualizedViewportState {
    cpuUnit.process(frameStartTime);
    return videoCardUnit.computeViewport(containerWidth, containerHeight);
  },

  endFrame(renderDurationMs: number, didRasterizeWorld: boolean = true): void {
    videoCardUnit.adjustForPerformance(renderDurationMs, didRasterizeWorld);
  },

  sweepRAM(): number {
    return ramUnit.sweep();
  },

  getBudgetReport(): HypervisorBudgetReport {
    const ramStats = ramUnit.getStats();
    return {
      status: 'HYPERVISOR_ACTIVE',
      mode: 'BOUNDED_VIRTUALIZATION',
      emaFrameMs: videoCardUnit.getEmaFrameMs(),
      qualityScale: videoCardUnit.getScale(),
      maxPhysicalPixels: videoCardUnit.getRenderDimensions().width * videoCardUnit.getRenderDimensions().height,
      cpuQueueDepth: cpuUnit.getQueueDepth(),
      cpuTasksProcessed: cpuUnit.getProcessedCount(),
      ramPooledBytes: ramStats.totalPooledBytes,
      ramCacheHits: ramStats.cacheHits
    };
  }
};

export default HardwareVirtualization;
