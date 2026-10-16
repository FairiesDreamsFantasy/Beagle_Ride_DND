/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
export * from './General/index';
export * from './Engine/index';

export const GameView: React.FC = () => {
  return (
    <div className="relative border border-slate-800 bg-slate-950 rounded-2xl p-4 shadow-2xl">
      <canvas aria-label="Beagle Ride D&D" className="w-full h-auto aspect-video rounded-lg bg-slate-900"></canvas>
    </div>
  );
};
