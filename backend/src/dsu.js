class DSU {
  constructor() {
    this.parent = new Map();
    this.sz = new Map();
    // Optional: store a compact reason why a root absorbed another root
    // key: childRoot -> { by: "device"|"ip"|"affiliate", key: "D123" }
    this.linkReason = new Map();
  }

  _make(x) {
    this.parent.set(x, x);
    this.sz.set(x, 1);
  }

  find(x) {
    if (!this.parent.has(x)) {
      this._make(x);
      return x;
    }
    let p = this.parent.get(x);
    if (p !== x) {
      p = this.find(p);
      this.parent.set(x, p);
    }
    return p;
  }

  // Returns the new root after union
  union(a, b, reason = null) {
    let ra = this.find(a);
    let rb = this.find(b);
    if (ra === rb) return ra;

    const sa = this.sz.get(ra) || 1;
    const sb = this.sz.get(rb) || 1;

    // union by size
    if (sa < sb) [ra, rb] = [rb, ra];

    // attach rb -> ra
    this.parent.set(rb, ra);
    this.sz.set(ra, sa + sb);

    if (reason) this.linkReason.set(rb, reason); // why rb got attached

    return ra;
  }

  size(x) {
    return this.sz.get(this.find(x)) || 1;
  }

  connected(a, b) {
    return this.find(a) === this.find(b);
  }

  // Build clusters: Map<root, Array<member>>
  clusters(keysIterable) {
    const m = new Map();
    for (const x of keysIterable) {
      const r = this.find(x);
      if (!m.has(r)) m.set(r, []);
      m.get(r).push(x);
    }
    return m;
  }

  // Optional: explain why two nodes are in same cluster (best-effort)
  // This is a cheap “audit trail” for demo narratives.
  explainPath(x) {
    // walks from x up to root collecting reasons
    const out = [];
    let cur = x;
    let safety = 0;
    while (safety++ < 50) {
      const p = this.parent.get(cur);
      if (!p || p === cur) break;
      const r = this.linkReason.get(cur) || this.linkReason.get(p); // best-effort
      if (r) out.push(r);
      cur = p;
    }
    return out;
  }
}

module.exports = DSU;
