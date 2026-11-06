/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Standalone Modular System Driver
 */

export const StandaloneSystem = {
  version: '2.0.0-standalone',
  initialized: true,
  timing: {
    targetFps: 60,
    frameIntervalMs: 1000 / 60
  },
  perf: {
    lastFrameTime: 0,
    frameDelta: 0
  },
  tick: function(currentTime) {
    if (!this.perf.lastFrameTime) this.perf.lastFrameTime = currentTime;
    this.perf.frameDelta = currentTime - this.perf.lastFrameTime;
    this.perf.lastFrameTime = currentTime;
    return this.perf.frameDelta;
  }
};

export default StandaloneSystem;
