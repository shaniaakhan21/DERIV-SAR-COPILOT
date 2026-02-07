class Deque {
  constructor() {
    this.arr = [];
    this.head = 0;
  }
  pushBack(x) { this.arr.push(x); }
  popFront() {
    if (this.size() === 0) return undefined;
    const x = this.arr[this.head++];
    // occasional compaction
    if (this.head > 1024 && this.head * 2 > this.arr.length) {
      this.arr = this.arr.slice(this.head);
      this.head = 0;
    }
    return x;
  }
  front() { return this.size() === 0 ? undefined : this.arr[this.head]; }
  back() { return this.size() === 0 ? undefined : this.arr[this.arr.length - 1]; }
  size() { return this.arr.length - this.head; }
  toArray() { return this.arr.slice(this.head); }
}

module.exports = { Deque };
