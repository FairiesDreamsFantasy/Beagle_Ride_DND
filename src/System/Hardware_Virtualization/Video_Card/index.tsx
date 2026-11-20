/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResolutionModule, DynamicViewportMetrics } from '../../Visuals/Resolution/index';
import { InGameAIVisualResolutionEngine } from '../../AI/in-Game/Category/Visuals/Resolution/index';

export interface VirtualizedViewportState extends DynamicViewportMetrics {
  activeTier: string;
  qualityScale: number;
  emaFrameMs: number;
  maxPhysicalPixels: number;
}

/**
 * Video Card Virtualization: Dynamic Viewport & Performance Hypervisor.
 * Adapts to ANY physical screen size without aspect distortion while enforcing
 * strict pixel-throughput and frame-time budgets so rendering never saturates CPU/GPU/RAM.
 */
export class DynamicResolutionManager {
  private currentScale: number = 1.0;
  private emaFrameMs: number = 16.0;
  private readonly emaAlpha: number = 0.15;
  private maxPhysicalPixels: number = 129600; // 480x270 (~506 KiB) optimal minimal-RAM ceiling
  private lastTierName: string = 'Medium-Low';
  private lastContainerWidth: number = 480;
  private lastContainerHeight: number = 270;
  private lastAiEvalW: number = -1;
  private lastAiEvalH: number = -1;
  private lastAiEvalEma: number = -1;
  private lastAiMaxPixels: number = -1;
  private lastViewportScale: number = -1;
  private cachedViewport: VirtualizedViewportState | null = null;
  private overBudgetFrames: number = 0;
  private underBudgetFrames: number = 0;

  public getScale(): number {
    return this.currentScale;
  }

  public getEmaFrameMs(): number {
    return this.emaFrameMs;
  }

  public setMaxPhysicalPixels(pixels: number): void {
    this.maxPhysicalPixels = Math.max(38400, Math.min(230400, Math.floor(pixels)));
    this.cachedViewport = null;
  }

  /**
   * Closed-loop proportional hysteresis scaler using Exponential Moving Average frame timing.
   * Only evaluates resolution scaling on frames that actively rasterized world scanlines so
   * stationary worldCacheCanvas blits never oscillate resolution against moving frames.
   */
  public adjustForPerformance(frameTimeMs: number, didRasterizeWorld: boolean = true): void {
    if (!didRasterizeWorld || !Number.isFinite(frameTimeMs) || frameTimeMs <= 0) return;
    const clampedFrameMs = frameTimeMs > 40 ? 40 : frameTimeMs;
    this.emaFrameMs = this.emaFrameMs * (1 - this.emaAlpha) + clampedFrameMs * this.emaAlpha;

    if (this.emaFrameMs > 20.0) {
      this.underBudgetFrames = 0;
      this.overBudgetFrames++;
      if (this.overBudgetFrames >= 30 && this.currentScale > 0.6) {
        this.currentScale = Math.max(0.6, Math.round((this.currentScale - 0.1) * 100) / 100);
        this.overBudgetFrames = 0;
      }
    } else if (this.emaFrameMs < 10.5) {
      this.overBudgetFrames = 0;
      this.underBudgetFrames++;
      if (this.underBudgetFrames >= 75 && this.currentScale < 1.0) {
        this.currentScale = Math.min(1.0, Math.round((this.currentScale + 0.1) * 100) / 100);
        this.underBudgetFrames = 0;
      }
    } else {
      this.overBudgetFrames = 0;
      this.underBudgetFrames = 0;
    }
  }

  /**
   * Computes dynamic rasterizer dimensions for ANY physical container dimensions.
   * Hysteresis-cached so the 20 AI tier evaluators do not allocate objects/strings every frame.
   */
  public computeViewport(containerWidth: number, containerHeight: number): VirtualizedViewportState {
    const safeW = Math.max(120, Math.floor(containerWidth || this.lastContainerWidth));
    const safeH = Math.max(90, Math.floor(containerHeight || this.lastContainerHeight));
    this.lastContainerWidth = safeW;
    this.lastContainerHeight = safeH;

    const emaDelta = Math.abs(this.emaFrameMs - this.lastAiEvalEma);
    if (
      safeW !== this.lastAiEvalW ||
      safeH !== this.lastAiEvalH ||
      this.maxPhysicalPixels !== this.lastAiMaxPixels ||
      emaDelta > 1.25
    ) {
      const aiSelection = InGameAIVisualResolutionEngine.selectOptimalProfile(
        this.emaFrameMs,
        safeW,
        safeH,
        this.maxPhysicalPixels
      );
      this.lastTierName = aiSelection.tierId;
      this.lastAiEvalW = safeW;
      this.lastAiEvalH = safeH;
      this.lastAiMaxPixels = this.maxPhysicalPixels;
      this.lastAiEvalEma = this.emaFrameMs;
      this.cachedViewport = null;
    }

    if (
      this.cachedViewport &&
      this.lastViewportScale === this.currentScale
    ) {
      this.cachedViewport.emaFrameMs = this.emaFrameMs;
      return this.cachedViewport;
    }

    const metrics = ResolutionModule.calculateDynamicViewport(
      safeW,
      safeH,
      this.maxPhysicalPixels,
      this.currentScale
    );
    this.lastViewportScale = this.currentScale;

    if (!this.cachedViewport) {
      this.cachedViewport = {
        ...metrics,
        activeTier: this.lastTierName,
        qualityScale: this.currentScale,
        emaFrameMs: this.emaFrameMs,
        maxPhysicalPixels: this.maxPhysicalPixels
      };
    } else {
      this.cachedViewport.renderWidth = metrics.renderWidth;
      this.cachedViewport.renderHeight = metrics.renderHeight;
      this.cachedViewport.displayWidth = metrics.displayWidth;
      this.cachedViewport.displayHeight = metrics.displayHeight;
      this.cachedViewport.aspectRatio = metrics.aspectRatio;
      this.cachedViewport.virtualScaleX = metrics.virtualScaleX;
      this.cachedViewport.virtualScaleY = metrics.virtualScaleY;
      this.cachedViewport.uniformSpriteScale = metrics.uniformSpriteScale;
      this.cachedViewport.pixelBudgetUsed = metrics.pixelBudgetUsed;
      this.cachedViewport.activeTier = this.lastTierName;
      this.cachedViewport.qualityScale = this.currentScale;
      this.cachedViewport.emaFrameMs = this.emaFrameMs;
      this.cachedViewport.maxPhysicalPixels = this.maxPhysicalPixels;
    }

    return this.cachedViewport;
  }

  public getRenderDimensions(): { width: number; height: number } {
    const viewport = this.computeViewport(this.lastContainerWidth, this.lastContainerHeight);
    return {
      width: viewport.renderWidth,
      height: viewport.renderHeight
    };
  }
}

export const videoCardUnit = new DynamicResolutionManager();
export default videoCardUnit;
