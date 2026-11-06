/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

export const GraphicalRendererEngine = {
  renderFrame: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
  }
};
