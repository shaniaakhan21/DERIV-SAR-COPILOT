class MinHeap {
  constructor(compare) {
    this.data = [];
    this.compare = compare; // compare(a,b) < 0 means a is "smaller"
  }
  size() { return this.data.length; }
  peek() { return this.data[0]; }

  push(x) {
    this.data.push(x);
    this._siftUp(this.data.length - 1);
  }

  pop() {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last;
      this._siftDown(0);
    }
    return top;
  }

  pushTopK(x, k) {
    if (k <= 0) return;
    if (this.size() < k) return this.push(x);
    if (this.compare(this.peek(), x) < 0) { // x bigger than min
      this.pop();
      this.push(x);
    }
  }

  toSortedDesc() {
    // clone then pop all
    const clone = new MinHeap(this.compare);
    clone.data = this.data.slice();
    const out = [];
    while (clone.size()) out.push(clone.pop());
    // popped gives ascending by heap min; reverse
    return out.reverse();
  }

  _siftUp(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.compare(this.data[p], this.data[i]) <= 0) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }

  _siftDown(i) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = i * 2 + 1, r = i * 2 + 2;
      if (l < n && this.compare(this.data[l], this.data[smallest]) < 0) smallest = l;
      if (r < n && this.compare(this.data[r], this.data[smallest]) < 0) smallest = r;
      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
      i = smallest;
    }
  }
}

module.exports = { MinHeap };
