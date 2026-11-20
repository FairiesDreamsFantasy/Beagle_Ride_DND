/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CPU Virtualization Unit: Deterministic O(1) Ring-Buffer Micro-Task Scheduler.
 * Eliminates Array.shift() O(n) latency spikes and bounds main-thread work per frame.
 */
export class MicroTaskScheduler {
  private readonly capacity: number = 256;
  private readonly ringBuffer: Array<(() => void) | undefined>;
  private head: number = 0;
  private tail: number = 0;
  private count: number = 0;
  private budgetMs: number = 2.0;
  private totalProcessed: number = 0;
  private droppedTasks: number = 0;

  constructor(capacity: number = 256, budgetMs: number = 2.0) {
    this.capacity = Math.max(16, capacity);
    this.ringBuffer = new Array<(() => void) | undefined>(this.capacity);
    this.budgetMs = Math.max(0.25, budgetMs);
  }

  public setBudgetMs(ms: number): void {
    this.budgetMs = Math.max(0.25, Math.min(8.0, ms));
  }

  public getBudgetMs(): number {
    return this.budgetMs;
  }

  public getQueueDepth(): number {
    return this.count;
  }

  public getProcessedCount(): number {
    return this.totalProcessed;
  }

  public getDroppedCount(): number {
    return this.droppedTasks;
  }

  /**
   * Enqueues a task in strict O(1) time without reallocating array storage.
   */
  public schedule(task: () => void): boolean {
    if (this.count >= this.capacity) {
      this.droppedTasks++;
      return false;
    }
    this.ringBuffer[this.tail] = task;
    this.tail = (this.tail + 1) % this.capacity;
    this.count++;
    return true;
  }

  /**
   * Executes queued tasks within the remaining per-frame CPU budget relative to frameStartTime.
   */
  public process(frameStartTime: number = performance.now()): number {
    let executed = 0;
    while (this.count > 0) {
      const elapsed = performance.now() - frameStartTime;
      if (elapsed >= this.budgetMs) {
        break;
      }
      const task = this.ringBuffer[this.head];
      this.ringBuffer[this.head] = undefined;
      this.head = (this.head + 1) % this.capacity;
      this.count--;
      if (task) {
        task();
        executed++;
        this.totalProcessed++;
      }
    }
    return executed;
  }

  public clear(): void {
    this.ringBuffer.fill(undefined);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }
}

export const cpuUnit = new MicroTaskScheduler();
export default cpuUnit;
