/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HardwareVirtualization } from '../../../../../Hardware_Virtualization/index';

export const TextBasedHUD: React.FC = () => {
  const report = HardwareVirtualization.getBudgetReport();
  return (
    <div className="w-full bg-black/80 text-green-500 font-mono text-[10px] py-1 px-4 flex justify-between border-b border-green-900/30">
      <span>SYSTEM: {report.status} ({report.mode})</span>
      <span>VRAM BUDGET: {Math.round(report.maxPhysicalPixels / 1024)} KiB | RAM POOLED: {Math.round(report.ramPooledBytes / 1024)} KiB</span>
      <span>FRAME TIME: {report.emaFrameMs.toFixed(1)}ms | SCALE: {(report.qualityScale * 100).toFixed(0)}%</span>
    </div>
  );
};
