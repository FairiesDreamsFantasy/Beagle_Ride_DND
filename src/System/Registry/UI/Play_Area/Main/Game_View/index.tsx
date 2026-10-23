/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { RefObject } from 'react';

export interface GameViewCanvasProps {
  canvasRef?: RefObject<HTMLCanvasElement | null>;
  width?: number;
  height?: number;
  className?: string;
  id?: string;
}

/**
 * Game_View houses a div that holds a canvas element.
 */
export const GameViewCanvasContainer: React.FC<GameViewCanvasProps> = ({
  canvasRef,
  width = 800,
  height = 600,
  className = "relative flex items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl",
  id = "game-view-container"
}) => {
  return (
    <div id={id} className={className}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full object-contain block"
        aria-label="3D POV Simulation Canvas"
      />
    </div>
  );
};

export const GameViewRegistry = {
  defaultWidth: 800,
  defaultHeight: 600,
  containerId: 'game-view-container'
};
