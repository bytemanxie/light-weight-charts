/**
 * CircularBuffer - A generic fixed-size buffer that automatically discards oldest items when full
 * 
 * This data structure is useful for maintaining a fixed-size collection of items
 * where only the most recent N items need to be kept in memory. When the buffer
 * reaches its capacity and a new item is added, the oldest item is automatically removed.
 */
export class CircularBuffer<T> {
  private buffer: T[];
  private size: number;
  private head: number = 0;
  private tail: number = 0;
  private count: number = 0;

  /**
   * Creates a new CircularBuffer with the specified capacity
   * @param size Maximum number of items the buffer can hold
   */
  constructor(size: number) {
    this.size = size;
    this.buffer = new Array<T>(size);
  }

  /**
   * Adds an item to the buffer, potentially overwriting the oldest item if the buffer is full
   * @param item The item to add to the buffer
   */
  push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.size;
    
    if (this.count === this.size) {
      // Buffer is full, move tail pointer
      this.tail = (this.tail + 1) % this.size;
    } else {
      // Buffer is not full yet, increment count
      this.count++;
    }
  }

  /**
   * Returns all items currently in the buffer in chronological order (oldest to newest)
   * @returns Array of all items in the buffer
   */
  getAll(): T[] {
    const result: T[] = [];
    let current = this.tail;
    
    for (let i = 0; i < this.count; i++) {
      result.push(this.buffer[current]);
      current = (current + 1) % this.size;
    }
    
    return result;
  }

  /**
   * Returns the most recent n items from the buffer
   * @param n Number of recent items to return
   * @returns Array of the n most recent items
   */
  getLatest(n: number): T[] {
    const count = Math.min(n, this.count);
    const result: T[] = [];
    
    for (let i = 0; i < count; i++) {
      const index = (this.head - i - 1 + this.size) % this.size;
      result.unshift(this.buffer[index]);
    }
    
    return result;
  }

  /**
   * Empties the buffer
   */
  clear(): void {
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }

  /**
   * Returns the current number of items in the buffer
   */
  get length(): number {
    return this.count;
  }
}
