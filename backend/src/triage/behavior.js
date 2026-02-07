// backend/src/triage/behavior.js
// Behavioral anomaly detection using Welford's online algorithm

class WelfordStats {
  constructor() { this.n = 0; this.mean = 0; this.M2 = 0; }

  update(x) {
    this.n++;
    const delta = x - this.mean;
    this.mean += delta / this.n;
    this.M2 += delta * (x - this.mean);
  }

  variance() { return this.n < 2 ? 0 : this.M2 / (this.n - 1); }
  stddev() { return Math.sqrt(this.variance()); }

  zScore(x) {
    const s = this.stddev();
    return s > 0.01 ? Math.abs(x - this.mean) / s : 0;
  }
}

/**
 * Build per-user behavioral profiles from normalized events.
 * Also builds segment baselines for cold-start fallback.
 *
 * @param {Array} norm — sorted normalized events
 * @returns {Map<string, Object>} userId → profile
 */
function buildBehaviorProfile(norm) {
  const profiles = new Map();
  const segments = new Map(); // segmentKey → { amountStats: Map<type, WelfordStats> }

  for (const e of norm) {
    // ── Per-user profile ──
    if (!profiles.has(e.user_id)) {
      profiles.set(e.user_id, {
        amountStats: new Map(),  // txType → WelfordStats on log(amount+1)
        gapStats: new WelfordStats(),
        lastTs: null,
        devices: new Set(),
        ips: new Set(),
        eventCount: 0,
        segmentKey: null,
      });
    }
    const p = profiles.get(e.user_id);
    p.eventCount++;

    // Segment key (set once from first event)
    if (!p.segmentKey) {
      p.segmentKey = `${e.country || "NA"}|${e.device_used || "NA"}|${e.merchant_category || "NA"}`;
    }

    // Amount stats per type
    const logAmt = Math.log(Math.max(1, e.amount));
    if (!p.amountStats.has(e.transaction_type)) {
      p.amountStats.set(e.transaction_type, new WelfordStats());
    }
    p.amountStats.get(e.transaction_type).update(logAmt);

    // Inter-arrival gap
    if (p.lastTs != null) {
      const gapMin = (e.timestamp - p.lastTs) / 60000;
      if (gapMin >= 0) p.gapStats.update(gapMin);
    }
    p.lastTs = e.timestamp;

    // Device/IP tracking
    if (e.device_id) p.devices.add(e.device_id);
    if (e.ip_address) p.ips.add(e.ip_address);

    // ── Segment baseline (cold-start) ──
    const segKey = p.segmentKey;
    if (!segments.has(segKey)) {
      segments.set(segKey, { amountStats: new Map() });
    }
    const seg = segments.get(segKey);
    if (!seg.amountStats.has(e.transaction_type)) {
      seg.amountStats.set(e.transaction_type, new WelfordStats());
    }
    seg.amountStats.get(e.transaction_type).update(logAmt);
  }

  // Attach segment reference to each profile for cold-start lookup
  for (const p of profiles.values()) {
    p._segment = segments.get(p.segmentKey) || null;
  }

  return profiles;
}

/**
 * Compute cluster-level behavioral anomaly score.
 *
 * @param {Array} events — cluster events (sorted by timestamp)
 * @param {Array} users  — cluster user ids
 * @param {Map} profiles — from buildBehaviorProfile
 * @returns {{ behaviorAnom: number, behaviorEvidence: Array }}
 */
function computeClusterBehavior(events, users, profiles) {
  const MIN_OBS = 3; // need at least 3 observations for meaningful stats
  const userMaxAnom = new Map();
  const evidence = [];

  // Track per-user state during this pass
  const seen = new Map(); // userId → { devices: Set, ips: Set, lastTs }
  for (const u of users) {
    seen.set(u, { devices: new Set(), ips: new Set(), lastTs: null });
  }

  for (const e of events) {
    const p = profiles.get(e.user_id);
    if (!p) continue;
    const s = seen.get(e.user_id);
    if (!s) continue;

    let maxAnom = userMaxAnom.get(e.user_id) || 0;

    // 1) Amount z-score
    const logAmt = Math.log(Math.max(1, e.amount));
    let amountZ = 0;
    const userStats = p.amountStats.get(e.transaction_type);
    if (userStats && userStats.n >= MIN_OBS) {
      amountZ = userStats.zScore(logAmt);
    } else if (p._segment) {
      // Cold-start: use segment baseline
      const segStats = p._segment.amountStats.get(e.transaction_type);
      if (segStats && segStats.n >= MIN_OBS) {
        amountZ = segStats.zScore(logAmt);
      }
    }
    const amountScore = Math.min(1, amountZ / 3);

    if (amountScore > 0.5) {
      evidence.push({
        type: "behavior",
        detail: `Unusual ${e.transaction_type} amount $${e.amount.toFixed(2)} for ${e.user_id} (z=${amountZ.toFixed(1)})`,
        value: amountScore,
      });
    }

    // 2) Inter-arrival gap z-score
    let gapScore = 0;
    if (s.lastTs != null && p.gapStats.n >= MIN_OBS) {
      const gapMin = (e.timestamp - s.lastTs) / 60000;
      const gapZ = p.gapStats.zScore(gapMin);
      gapScore = Math.min(1, gapZ / 3);

      if (gapScore > 0.5) {
        evidence.push({
          type: "behavior",
          detail: `Unusual timing gap ${gapMin.toFixed(1)}min for ${e.user_id} (z=${gapZ.toFixed(1)})`,
          value: gapScore,
        });
      }
    }
    s.lastTs = e.timestamp;

    // 3) Device novelty
    let deviceNovelty = 0;
    if (e.device_id && s.devices.size > 0 && !s.devices.has(e.device_id)) {
      deviceNovelty = 1;
      evidence.push({
        type: "behavior",
        detail: `New device ${e.device_id.slice(0, 12)} for ${e.user_id}`,
        value: 1,
      });
    }
    if (e.device_id) s.devices.add(e.device_id);

    // 4) IP novelty
    let ipNovelty = 0;
    if (e.ip_address && s.ips.size > 0 && !s.ips.has(e.ip_address)) {
      ipNovelty = 1;
      evidence.push({
        type: "behavior",
        detail: `New IP ${e.ip_address} for ${e.user_id}`,
        value: 1,
      });
    }
    if (e.ip_address) s.ips.add(e.ip_address);

    // Composite per-event anomaly
    const eventAnom = Math.min(1, Math.max(amountScore, gapScore, deviceNovelty, ipNovelty));
    maxAnom = Math.max(maxAnom, eventAnom);
    userMaxAnom.set(e.user_id, maxAnom);
  }

  // Cluster anomaly = mean of per-user max anomalies
  const anomValues = [...userMaxAnom.values()];
  const behaviorAnom = anomValues.length > 0
    ? anomValues.reduce((a, b) => a + b, 0) / anomValues.length
    : 0;

  // Dedupe and limit evidence
  const uniqueEvidence = [];
  const evSet = new Set();
  for (const ev of evidence) {
    const k = ev.detail;
    if (!evSet.has(k)) {
      evSet.add(k);
      uniqueEvidence.push(ev);
    }
    if (uniqueEvidence.length >= 10) break;
  }

  return {
    behaviorAnom: Math.round(behaviorAnom * 100) / 100,
    behaviorEvidence: uniqueEvidence,
  };
}

/**
 * Detect temporal behavior changes (e.g., "behavior changed 72h after KYC").
 * Compares early period vs. later period statistics.
 *
 * @param {Array} events — sorted timeline
 * @param {number} splitHours — hours to split early/late (default 72)
 * @returns {{ hasChange: boolean, changeScore: number, evidence: Array }}
 */
function detectTemporalChange(events, splitHours = 72) {
  if (!events || events.length < 10) {
    return { hasChange: false, changeScore: 0, evidence: [] };
  }

  const splitMs = splitHours * 60 * 60 * 1000;
  const firstTs = events[0].timestamp;
  const splitPoint = firstTs + splitMs;

  const early = events.filter(e => e.timestamp < splitPoint);
  const late = events.filter(e => e.timestamp >= splitPoint);

  if (early.length < 3 || late.length < 3) {
    return { hasChange: false, changeScore: 0, evidence: [] };
  }

  const evidence = [];
  let maxChange = 0;

  // Compare amount distributions
  const earlyAmounts = early.map(e => Math.log(Math.max(1, e.amount)));
  const lateAmounts = late.map(e => Math.log(Math.max(1, e.amount)));

  const earlyStats = new WelfordStats();
  earlyAmounts.forEach(a => earlyStats.update(a));

  const lateStats = new WelfordStats();
  lateAmounts.forEach(a => lateStats.update(a));

  const meanDiff = Math.abs(lateStats.mean - earlyStats.mean);
  const pooledStd = Math.sqrt((earlyStats.variance() + lateStats.variance()) / 2);
  const amountChangeZ = pooledStd > 0.01 ? meanDiff / pooledStd : 0;

  if (amountChangeZ > 2) {
    const changeScore = Math.min(1, amountChangeZ / 4);
    maxChange = Math.max(maxChange, changeScore);
    evidence.push({
      type: "temporal_change",
      detail: `Transaction amounts changed significantly ${splitHours}h after account creation (z=${amountChangeZ.toFixed(1)})`,
      value: changeScore,
      period: `${splitHours}h`
    });
  }

  // Compare transaction frequency
  const earlyDuration = Math.max(1, (early[early.length - 1].timestamp - early[0].timestamp) / 60000);
  const lateDuration = Math.max(1, (late[late.length - 1].timestamp - late[0].timestamp) / 60000);
  const earlyRate = early.length / earlyDuration;
  const lateRate = late.length / lateDuration;
  const rateRatio = Math.max(earlyRate, lateRate) / Math.max(0.01, Math.min(earlyRate, lateRate));

  if (rateRatio > 3) {
    const changeScore = Math.min(1, rateRatio / 5);
    maxChange = Math.max(maxChange, changeScore);
    evidence.push({
      type: "temporal_change",
      detail: `Transaction frequency changed ${rateRatio.toFixed(1)}x after ${splitHours}h (${earlyRate.toFixed(2)} → ${lateRate.toFixed(2)} events/min)`,
      value: changeScore,
      period: `${splitHours}h`
    });
  }

  // Compare transaction type mix
  const earlyTypes = new Map();
  early.forEach(e => earlyTypes.set(e.transaction_type, (earlyTypes.get(e.transaction_type) || 0) + 1));

  const lateTypes = new Map();
  late.forEach(e => lateTypes.set(e.transaction_type, (lateTypes.get(e.transaction_type) || 0) + 1));

  const earlyWithdrawPct = (earlyTypes.get("withdraw") || 0) / early.length;
  const lateWithdrawPct = (lateTypes.get("withdraw") || 0) / late.length;

  if (earlyWithdrawPct < 0.1 && lateWithdrawPct > 0.4) {
    const changeScore = 0.8;
    maxChange = Math.max(maxChange, changeScore);
    evidence.push({
      type: "temporal_change",
      detail: `Withdrawal pattern emerged after ${splitHours}h: ${(earlyWithdrawPct * 100).toFixed(0)}% → ${(lateWithdrawPct * 100).toFixed(0)}% of transactions`,
      value: changeScore,
      period: `${splitHours}h`
    });
  }

  return {
    hasChange: maxChange > 0.5,
    changeScore: maxChange,
    evidence: evidence.slice(0, 5)
  };
}

module.exports = { buildBehaviorProfile, computeClusterBehavior, detectTemporalChange };
