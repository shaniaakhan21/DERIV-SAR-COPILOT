// backend/src/triage/scoring.js

const feedbackStore = require("./feedbackStore");

/**
 * Score a triage case from computed signals.
 *
 * Strategy:
 *   1. Accumulate {key, points, reason, priority} entries.
 *   2. Apply learned feedback weight per key.
 *   3. Sum weighted points -> raw score, cap at 100.
 *   4. Sort entries by priority (lower = more informative), then by points desc.
 *   5. Return top 5 reasons + full score_breakdown.
 *
 * Priority tiers:
 *   1 = network / cycle / ratio  (strongest fraud indicators)
 *   2 = behavioral patterns       (supporting evidence)
 *   3 = velocity / generic         (context)
 */
function scoreCase(signals) {
  const entries = [];

  const clusterSize = Number(signals.clusterSize || 1);
  const linkStrength = Number(signals.linkStrength || 0);
  const typologyTags = Array.isArray(signals.typologyTags) ? signals.typologyTags : [];

  // -- 1) Cluster / network size --
  if (clusterSize >= 10) {
    entries.push({ key: "cluster_large", points: 20, reason: `Large linked network: ${clusterSize} accounts`, priority: 1 });
  } else if (clusterSize >= 5) {
    entries.push({ key: "cluster_medium", points: 12, reason: `Linked network: ${clusterSize} accounts`, priority: 1 });
  } else if (clusterSize >= 3) {
    entries.push({ key: "cluster_small", points: 6, reason: `Linked network: ${clusterSize} accounts`, priority: 2 });
  }

  // -- 2) Link-type diversity (multi-vector corroboration) --
  if (linkStrength >= 3) {
    entries.push({ key: "link_multi", points: 14, reason: `Multi-vector links: ${linkStrength} distinct link types`, priority: 1 });
  } else if (linkStrength === 2) {
    entries.push({ key: "link_cross", points: 8, reason: `Cross-corroborated links: ${linkStrength} link types`, priority: 1 });
  }

  // -- 3) Events-per-minute burstiness --
  const epm = typeof signals.eventsPerMin === "number" ? signals.eventsPerMin : null;
  if (epm != null) {
    if (epm >= 2) {
      entries.push({ key: "burst_activity", points: 15, reason: `Burst activity: ${epm.toFixed(2)} events/min`, priority: 2 });
    } else if (epm >= 1) {
      entries.push({ key: "elevated_activity", points: 8, reason: `Elevated activity: ${epm.toFixed(2)} events/min`, priority: 3 });
    }
  }

  // -- 4) Withdrawal ratio --
  const rawRatio = typeof signals.withdrawRatio === "number" ? signals.withdrawRatio : null;
  if (rawRatio != null) {
    const pct = Math.round(Math.min(rawRatio, 10) * 100);
    if (rawRatio >= 3) {
      entries.push({ key: "withdraw_ratio_very_high", points: 18, reason: `Very high withdrawal ratio: ${pct}% of deposits`, priority: 1 });
    } else if (rawRatio >= 1.2) {
      entries.push({ key: "withdraw_ratio_high", points: 12, reason: `High withdrawal ratio: ${pct}% of deposits`, priority: 2 });
    }
  }

  // -- 5) In ~ Out (pass-through indicator) --
  if (signals.inOutClose) {
    entries.push({ key: "pass_through", points: 10, reason: "Near 1:1 in/out value (possible pass-through)", priority: 2 });
  }

  // -- 6) Rapid deposit->trade->withdraw cycle --
  const rcm = signals.rapidCycleMinutes;
  if (rcm != null) {
    if (rcm <= 30) {
      entries.push({ key: "rapid_cycle", points: 18, reason: `Rapid deposit\u2192trade\u2192withdraw cycle (${rcm} min)`, priority: 1 });
    } else if (rcm <= 60) {
      entries.push({ key: "quick_cycle", points: 10, reason: `Quick deposit\u2192trade\u2192withdraw cycle (${rcm} min)`, priority: 2 });
    }
  }

  // -- 7) Tiny-profit cycling --
  if (signals.tinyProfitCycle === true) {
    entries.push({ key: "tiny_profit", points: 15, reason: "Tiny-profit cycling (possible layering/laundering)", priority: 1 });
  }

  // -- 8) Per-user velocity --
  if ((signals.depositCount15m || 0) >= 3) {
    entries.push({ key: "deposit_velocity", points: 10, reason: `High deposit velocity: ${signals.depositCount15m} deposits in 15m`, priority: 3 });
  }
  if ((signals.withdrawCount15m || 0) >= 2) {
    entries.push({ key: "withdraw_velocity", points: 8, reason: `High withdrawal velocity: ${signals.withdrawCount15m} withdrawals in 15m`, priority: 3 });
  }

  // -- 9) Typology tag bonus --
  const tagPoints = Math.min(15, typologyTags.length * 5);
  if (tagPoints > 0) {
    entries.push({ key: "typology_bonus", points: tagPoints, reason: `Typologies detected: ${typologyTags.join(", ")}`, priority: 2 });
  }

  // -- 10) Behavioral anomaly (from behavior.js) --
  const behaviorAnom = Number(signals.behaviorAnom || 0);
  if (behaviorAnom > 0.3) {
    const pts = Math.round(Math.min(15, behaviorAnom * 15));
    entries.push({ key: "behavior_anom", points: pts, reason: `Behavioral anomaly detected (score ${behaviorAnom.toFixed(2)})`, priority: 2 });
  }

  // -- 11) Temporal pattern change --
  const temporalChange = Number(signals.temporalChange || 0);
  if (temporalChange > 0.5) {
    const pts = Math.round(Math.min(12, temporalChange * 12));
    entries.push({ key: "temporal_change", points: pts, reason: `Behavior changed significantly after account creation (score ${temporalChange.toFixed(2)})`, priority: 1 });
  }

  // -- 12) Predictive risk (early warning) --
  const predictiveScore = Number(signals.predictiveScore || 0);
  if (predictiveScore > 0.4) {
    const pts = Math.round(Math.min(15, predictiveScore * 15));
    entries.push({ key: "predictive_risk", points: pts, reason: `Early warning signals detected (score ${predictiveScore.toFixed(2)})`, priority: 1 });
  }

  // -- Apply feedback weights + build breakdown --
  const breakdown = entries.map((e) => {
    const weight = feedbackStore.getWeight(e.key);
    const weightedPoints = Math.round(e.points * weight);
    return {
      key: e.key,
      rawPoints: e.points,
      weight,
      points: weightedPoints,
      priority: e.priority,
      reason: e.reason,
    };
  });

  // -- Aggregate --
  let score = breakdown.reduce((s, e) => s + e.points, 0);
  score = Math.min(100, score);

  breakdown.sort((a, b) => a.priority - b.priority || b.points - a.points);
  const reasons = breakdown.slice(0, 5).map((e) => e.reason);

  return { score, reasons, score_breakdown: breakdown };
}

module.exports = { scoreCase };
