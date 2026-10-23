/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CPU Virtualization Unit: Micro-Task Scheduler.
 * Implements deterministic task slicing to prevent main-thread starvation.
 */
export class MicroTaskScheduler {
  private taskQueue: (() => void)[] = [];
  private budgetMs: number = 2.0; // 2ms per-frame budget for non-critical tasks

  public schedule(task: () => void): void {
    this.taskQueue.push(task);
  }

  public process(frameStartTime: number): void {
    const now = performance.now();
    while (this.taskQueue.length > 0 && (performance.now() - now) < this.budgetMs) {
      const task = this.taskQueue.shift();
      if (task) task();
    }
  }
}

export const cpuUnit = new MicroTaskScheduler();
export default cpuUnit;
