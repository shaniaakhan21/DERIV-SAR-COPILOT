// backend/src/triage/unsupervised.js
// Unsupervised typology discovery using:
//  - case feature vectors
//  - z-score normalization
//  - DBSCAN clustering (finds dense groups + outliers)
//  - "novelty" = outliers or rare clusters

function safeNum(x, d = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : d;
}

function zNormalize(matrix) {
  // matrix: Array<Array<number>>
  if (!matrix.length) return { Z: [], mu: [], sigma: [] };
  const m = matrix.length;
  const d = matrix[0].length;
  const mu = Array(d).fill(0);
  const sigma = Array(d).fill(0);

  // mean
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < d; j++) mu[j] += matrix[i][j];
  }
  for (let j = 0; j < d; j++) mu[j] /= m;

  // std
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < d; j++) {
      const diff = matrix[i][j] - mu[j];
      sigma[j] += diff * diff;
    }
  }
  for (let j = 0; j < d; j++) {
    sigma[j] = Math.sqrt(sigma[j] / Math.max(1, m - 1));
    if (sigma[j] < 1e-6) sigma[j] = 1; // avoid divide-by-zero
  }

  const Z = matrix.map(row => row.map((x, j) => (x - mu[j]) / sigma[j]));
  return { Z, mu, sigma };
}

function dist(a, b) {
  // Euclidean distance
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return Math.sqrt(s);
}

function dbscan(points, eps = 1.2, minPts = 3) {
  // returns labels array: -1 = noise, else clusterId (0..k-1)
  const n = points.length;
  const labels = Array(n).fill(undefined);
  const visited = Array(n).fill(false);
  let clusterId = 0;

  function regionQuery(i) {
    const nbrs = [];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      if (dist(points[i], points[j]) <= eps) nbrs.push(j);
    }
    return nbrs;
  }

  function expandCluster(i, neighbors) {
    labels[i] = clusterId;

    const queue = neighbors.slice();
    while (queue.length) {
      const j = queue.shift();
      if (!visited[j]) {
        visited[j] = true;
        const nbrs2 = regionQuery(j);
        if (nbrs2.length + 1 >= minPts) {
          // density reachable: merge
          for (const k of nbrs2) queue.push(k);
        }
      }
      if (labels[j] === undefined || labels[j] === -1) {
        labels[j] = clusterId;
      }
    }
  }

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    visited[i] = true;

    const neighbors = regionQuery(i);
    const core = neighbors.length + 1 >= minPts;

    if (!core) {
      labels[i] = -1; // noise
    } else {
      expandCluster(i, neighbors);
      clusterId++;
    }
  }

  // Convert any remaining undefined to noise
  for (let i = 0; i < n; i++) {
    if (labels[i] === undefined) labels[i] = -1;
  }

  return labels;
}

function featureNames() {
  return [
    "log_deposit",
    "log_withdraw",
    "withdraw_ratio",
    "events_per_min",
    "rapid_cycle_min",
    "tiny_profit_cycle",
    "in_out_close",
    "link_strength",
    "cluster_size",
    "behavior_anom"
  ];
}

/**
 * Build per-case feature vector. Keep it simple + explainable.
 * You can add more later (unique IP count, device novelty count, etc.)
 */
function buildCaseVector(pack) {
  const dep = safeNum(pack?.totals?.deposit, 0);
  const wd = safeNum(pack?.totals?.withdraw, 0);

  const withdrawRatio =
    dep >= 50 ? wd / Math.max(1e-6, dep) : 0;

  const events = Array.isArray(pack.timeline) ? pack.timeline.length : 0;
  const firstTs = pack.timeline?.[0]?.timestamp ?? 0;
  const lastTs = pack.timeline?.[events - 1]?.timestamp ?? 0;
  const durationMin = Math.max(1, Math.round((lastTs - firstTs) / 60000));
  const epm = events / durationMin;

  const rcm = pack.rapidCycleMinutes != null ? safeNum(pack.rapidCycleMinutes, 0) : 0;

  // You already have this boolean in engine; if not, infer from typology tags
  const tinyProfit = pack.typologyTags?.includes("layering") ? 1 : 0;
  const inOutClose = pack.typologyTags?.includes("pass_through") ? 1 : 0;

  const linkStrength = safeNum(pack.linkStrength, 0);
  const clusterSize = safeNum(pack.cluster_size, pack.member_count || 1);

  const behaviorAnom = safeNum(pack.behaviorAnom, 0);

  return [
    Math.log1p(dep),
    Math.log1p(wd),
    Math.min(10, withdrawRatio),
    Math.min(10, epm),
    Math.min(300, rcm),
    tinyProfit,
    inOutClose,
    Math.min(10, linkStrength),
    Math.min(200, clusterSize),
    Math.min(1, behaviorAnom)
  ];
}

function centroid(vectors) {
  if (!vectors.length) return [];
  const d = vectors[0].length;
  const c = Array(d).fill(0);
  for (const v of vectors) for (let j = 0; j < d; j++) c[j] += v[j];
  for (let j = 0; j < d; j++) c[j] /= vectors.length;
  return c;
}

function topFeatureContrib(cent, featureLabels, topN = 4) {
  // cent is already z-space if you pass z-centroid
  const pairs = cent.map((v, i) => ({ name: featureLabels[i], val: v }));
  pairs.sort((a, b) => Math.abs(b.val) - Math.abs(a.val));
  return pairs.slice(0, topN);
}

/**
 * Discover typologies:
 * - clusters from DBSCAN
 * - novelty: noise points + rare clusters (size <= rareK)
 *
 * returns:
 *  - perCase: Map(case_id -> { discovered_cluster, discovered_novel, discovered_features })
 *  - summary: cluster summaries for UI + LLM naming
 */
function discoverTypologies(casePacks, { eps = 1.2, minPts = 3, rareK = 2 } = {}) {
  const feats = featureNames();

  const ids = casePacks.map(p => p.case_id);
  const X = casePacks.map(buildCaseVector);

  const { Z } = zNormalize(X);
  const labels = dbscan(Z, eps, minPts);

  // group by cluster id
  const clusters = new Map(); // id -> indices
  const noiseIdx = [];
  for (let i = 0; i < labels.length; i++) {
    const lab = labels[i];
    if (lab === -1) noiseIdx.push(i);
    else {
      if (!clusters.has(lab)) clusters.set(lab, []);
      clusters.get(lab).push(i);
    }
  }

  // cluster z-centroids + summaries
  const summaries = [];
  for (const [cid, idxs] of clusters.entries()) {
    const zVecs = idxs.map(i => Z[i]);
    const zCent = centroid(zVecs);
    const top = topFeatureContrib(zCent, feats, 5);

    summaries.push({
      discovered_cluster: `UC${cid}`,
      size: idxs.length,
      top_features: top.map(t => ({ feature: t.name, z: Number(t.val.toFixed(2)) })),
      sample_cases: idxs.slice(0, 5).map(i => ids[i])
    });
  }

  // Mark novelty:
  // - noise points are "novel"
  // - clusters with small size are "rare/novel"
  const rareClusters = new Set(
    summaries.filter(s => s.size <= rareK).map(s => s.discovered_cluster)
  );

  const perCase = new Map();
  for (let i = 0; i < casePacks.length; i++) {
    const lab = labels[i];
    if (lab === -1) {
      perCase.set(ids[i], {
        discovered_cluster: "NOISE",
        discovered_novel: true,
        discovered_reason: "Outlier pattern (does not match any dense cluster)",
      });
    } else {
      const dc = `UC${lab}`;
      perCase.set(ids[i], {
        discovered_cluster: dc,
        discovered_novel: rareClusters.has(dc),
        discovered_reason: rareClusters.has(dc) ? "Rare cluster (uncommon behavior signature)" : "Common cluster signature"
      });
    }
  }

  return {
    perCase,
    summary: {
      eps,
      minPts,
      clusters: summaries.sort((a, b) => b.size - a.size),
      noise_count: noiseIdx.length
    }
  };
}

module.exports = {
  discoverTypologies,
  buildCaseVector,
  featureNames
};
