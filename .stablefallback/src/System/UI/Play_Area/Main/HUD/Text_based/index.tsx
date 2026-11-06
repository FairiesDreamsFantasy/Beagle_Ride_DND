/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const TextBasedHUD: React.FC = () => {
  return (
    <div className="w-full bg-black/80 text-green-500 font-mono text-[10px] py-1 px-4 flex justify-between border-b border-green-900/30">
      <span>SYSTEM: STABLE</span>
      <span>LATENCY: 12ms</span>
      <span>64-BIT PRECISION ENABLED</span>
    </div>
  );
};
