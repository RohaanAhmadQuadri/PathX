/**
 * MinHeap Implementation
 * 
 * A Binary Min-Heap is a complete binary tree where the value of each node is
 * less than or equal to the values of its children (the heap property).
 * 
 * Stored as a flat 1-dimensional array:
 *   For an element at index i:
 *     - Parent index:      Math.floor((i - 1) / 2)
 *     - Left child index:  2 * i + 1
 *     - Right child index: 2 * i + 2
 * 
 * Time Complexities:
 *   - insert:     O(log N)
 *   - extractMin: O(log N)
 *   - peek:       O(1)
 */
export class MinHeap {
  /**
   * @param {Function} comparator - Custom comparison function.
   * Defaults to comparing the `.priority` property of two elements.
   * If element A should come before B, return a negative number (A < B).
   */
  constructor(comparator = (a, b) => a.priority - b.priority) {
    this.heap = [];
    this.comparator = comparator;
  }

  /**
   * Returns the number of items currently in the heap.
   * @returns {number}
   */
  size() {
    return this.heap.length;
  }

  /**
   * Checks whether the heap has no items.
   * @returns {boolean}
   */
  isEmpty() {
    return this.heap.length === 0;
  }

  /**
   * Returns the minimum element without removing it.
   * @returns {any | null}
   */
  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  /**
   * Inserts a new element into the heap and restores heap order.
   * 1. Push element to the end of array.
   * 2. "Bubble Up" (sift up) the element until it reaches its valid position.
   * 
   * @param {any} item - The item to insert (e.g. { id, priority })
   */
  insert(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  /**
   * Removes and returns the minimum element (root of the heap).
   * 1. Swap root with the last element.
   * 2. Pop the last element (original minimum).
   * 3. "Bubble Down" (sift down) the new root until heap order is restored.
   * 
   * @returns {any | null}
   */
  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    // Move the last element to the root position
    this.heap[0] = this.heap.pop();
    // Sink it down to restore the min-heap invariant
    this._bubbleDown(0);

    return min;
  }

  /**
   * Moves an element up the tree while it is smaller than its parent.
   * @private
   * @param {number} index - Index of element to bubble up
   */
  _bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);

      // If current item is smaller than its parent, swap them
      if (this.comparator(this.heap[index], this.heap[parentIndex]) < 0) {
        [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
        index = parentIndex;
      } else {
        // Invariant satisfied: parent is smaller or equal
        break;
      }
    }
  }

  /**
   * Moves an element down the tree while it is larger than either of its children.
   * @private
   * @param {number} index - Index of element to bubble down
   */
  _bubbleDown(index) {
    const length = this.heap.length;

    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      // Check if left child exists and is smaller than current smallest
      if (
        leftChild < length &&
        this.comparator(this.heap[leftChild], this.heap[smallest]) < 0
      ) {
        smallest = leftChild;
      }

      // Check if right child exists and is smaller than current smallest
      if (
        rightChild < length &&
        this.comparator(this.heap[rightChild], this.heap[smallest]) < 0
      ) {
        smallest = rightChild;
      }

      // If either child was smaller, swap and continue sinking down
      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else {
        // Invariant satisfied: current is smaller than both children
        break;
      }
    }
  }
}
