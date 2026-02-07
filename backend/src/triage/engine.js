// backend/src/triage/engine.js
const { Deque } = require("../dsa/deque");
const { MinHeap } = require("../dsa/minHeap");
const { scoreCase } = require("./scoring");
const { buildBehaviorProfile, computeClusterBehavior, detectTemporalChange } = require("./behavior");
const { computePredictiveRisk } = require("./predictive");
const { discoverTypologies } = require("./unsupervised");
const { classifyFraudType } = require("./priority");

const DSU = require("../dsu");

function normalizeRow(r) {
  const get = (k) => r[k] ?? r[k.toUpperCase()] ?? r[k.toLowerCase()];

  // Normalize dataset types -> engine types
  let tt = String(get("transaction_type") ?? get("type") ?? "").toLowerCase();
  if (tt === "withdrawal") tt = "withdraw";
  if (tt === "transfer" || tt === "payment") tt = "trade"; // demo mapping

  return {
    transaction_id: String(get("transaction_id") ?? get("tx_id") ?? get("id") ?? ""),
    user_id: String(get("user_id") ?? get("client_id") ?? get("account_id") ?? ""),
    timestamp: new Date(get("timestamp") ?? get("time") ?? get("created_at") ?? Date.now()).getTime(),
    amount: Number(get("amount") ?? 0),
    transaction_type: tt,

    country: String(get("country") ?? get("location") ?? ""),

    device_id: String(get("device_id") ?? get("device_hash") ?? ""),
    ip_address: String(get("ip_address") ?? get("ip") ?? ""),
    affiliate_id: String(get("affiliate_id") ?? ""),

    profit: Number(get("profit") ?? 0),

    merchant_category: String(get("merchant_category") ?? get("category") ?? ""),
    device_used: String(get("device_used") ?? "")
  };
}

/**
 * Aggregate link evidence across ALL users in a cluster,
 * instead of only one member.
 */
function buildAggregatedLinkEvidence(uf, users, limit = 10) {
  const seen = new Set();
  const out = [];

  for (const u of users) {
    const reasons = uf.explainPath(u) || [];
    for (const r of reasons) {
      if (!r || !r.by) continue;

      const key = `${r.by}|${r.key || ""}|${r.a || ""}|${r.b || ""}`;

      if (seen.has(key)) continue;
      seen.add(key);

      out.push({
        by: r.by,
        key: r.key,
        a: r.a,
        b: r.b,
        ts: r.ts
      });

      if (out.length >= limit) return out;
    }
  }

  return out;
}

function buildTriage(rows, { topK = 5, windowMs = 15 * 60 * 1000 } = {}) {
  const norm = rows.map(normalizeRow).filter((r) => r.user_id && r.transaction_id);
  norm.sort((a, b) => a.timestamp - b.timestamp);

  // Build behavioral profiles once (before cluster loop)
  const behaviorProfiles = buildBehaviorProfile(norm);

  // DSU
  const uf = new DSU();

  // ── HARD link maps ──
  const deviceToUser = new Map();

  const MAX_IP_LINKS = 5;
  const ipSeenCount = new Map();
  const ipToUser = new Map();

  const MAX_AFF_LINKS = 10;
  const affSeenCount = new Map();
  const affiliateToUser = new Map();

  // Track which user_ids have participated in at least one hard union.
  // Used to gate soft-link unions.
  const hardLinkedUsers = new Set();

  // ── SOFT link support ──
  const netKeySeen = new Set();

  const MAX_MERCHANT_LINKS = 3;
  const merchantSeenCount = new Map();
  const merchantToUser = new Map(); // mk -> first user_id that had this key

  // ── Windows / timelines ──
  const userDepositWin = new Map();
  const userWithdrawWin = new Map();
  const userPeakDepositWin = new Map();
  const userPeakWithdrawWin = new Map();
  const timelineByUser = new Map();

  function getDeque(map, key) {
    if (!map.has(key)) map.set(key, new Deque());
    return map.get(key);
  }

  // ────────────────────────────────────────
  // Pass 1: unions + windows + timeline
  // ────────────────────────────────────────
  for (const e of norm) {
    // ─── HARD link: device_id (always) ───
    if (e.device_id) {
      if (deviceToUser.has(e.device_id)) {
        const other = deviceToUser.get(e.device_id);
        uf.union(e.user_id, other, { by: "device", key: e.device_id });
        hardLinkedUsers.add(e.user_id);
        hardLinkedUsers.add(other);
      } else {
        deviceToUser.set(e.device_id, e.user_id);
      }
    }

    // ─── HARD link: ip_address (capped) ───
    if (e.ip_address) {
      const c = (ipSeenCount.get(e.ip_address) || 0) + 1;
      ipSeenCount.set(e.ip_address, c);

      if (c <= MAX_IP_LINKS) {
        if (ipToUser.has(e.ip_address)) {
          const other = ipToUser.get(e.ip_address);
          uf.union(e.user_id, other, { by: "ip", key: e.ip_address });
          hardLinkedUsers.add(e.user_id);
          hardLinkedUsers.add(other);
        } else {
          ipToUser.set(e.ip_address, e.user_id);
        }
      }
    }

    // ─── HARD link: affiliate_id (ignore aff_demo, capped) ───
    if (e.affiliate_id && e.affiliate_id !== "aff_demo") {
      const c = (affSeenCount.get(e.affiliate_id) || 0) + 1;
      affSeenCount.set(e.affiliate_id, c);

      if (c <= MAX_AFF_LINKS) {
        if (affiliateToUser.has(e.affiliate_id)) {
          const other = affiliateToUser.get(e.affiliate_id);
          uf.union(e.user_id, other, { by: "affiliate", key: e.affiliate_id });
          hardLinkedUsers.add(e.user_id);
          hardLinkedUsers.add(other);
        } else {
          affiliateToUser.set(e.affiliate_id, e.user_id);
        }
      }
    }

    // ─── SOFT prerequisite: netKey (NOT a union — only tracked) ───
    let netKey = "";
    if (e.ip_address) {
      const parts = String(e.ip_address).split(".");
      const ipPrefix2 = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : "";
      netKey = ipPrefix2 ? `${ipPrefix2}|${e.country || "NA"}|${e.device_used || "NA"}` : "";
    }
    const netKeyExists = netKey !== "" && netKeySeen.has(netKey);
    if (netKey) netKeySeen.add(netKey);

    // ─── SOFT link: merchantKey (guarded by netKey + hard corroboration) ───
    if (e.merchant_category || e.device_used) {
      const mk = `${e.merchant_category || "NA"}|${e.device_used || "NA"}|${e.country || "NA"}`;

      const c = (merchantSeenCount.get(mk) || 0) + 1;
      merchantSeenCount.set(mk, c);

      if (!merchantToUser.has(mk)) merchantToUser.set(mk, e.user_id);
      const targetUser = merchantToUser.get(mk);

      if (
        c <= MAX_MERCHANT_LINKS &&
        targetUser !== e.user_id &&
        netKeyExists &&
        (hardLinkedUsers.has(e.user_id) || hardLinkedUsers.has(targetUser))
      ) {
        uf.union(e.user_id, targetUser, { by: "merchant+net", key: mk });
      }
    }

    // ─── Timeline ───
    if (!timelineByUser.has(e.user_id)) timelineByUser.set(e.user_id, []);
    timelineByUser.get(e.user_id).push(e);

    // ─── Windows (velocity) ───
    if (e.transaction_type === "deposit") {
      const dq = getDeque(userDepositWin, e.user_id);
      dq.pushBack(e.timestamp);
      while (dq.size() && e.timestamp - dq.front() > windowMs) dq.popFront();
      userPeakDepositWin.set(e.user_id, Math.max(userPeakDepositWin.get(e.user_id) || 0, dq.size()));
    }

    if (e.transaction_type === "withdraw") {
      const dq = getDeque(userWithdrawWin, e.user_id);
      dq.pushBack(e.timestamp);
      while (dq.size() && e.timestamp - dq.front() > windowMs) dq.popFront();
      userPeakWithdrawWin.set(e.user_id, Math.max(userPeakWithdrawWin.get(e.user_id) || 0, dq.size()));
    }
  }

  // ────────────────────────────────────────
  // Pass 2: build clusters (root -> users/events)
  // ────────────────────────────────────────
  const clusters = new Map();
  for (const [userId, timeline] of timelineByUser.entries()) {
    const root = uf.find(userId);
    if (!clusters.has(root)) clusters.set(root, { users: [], events: [] });
    const c = clusters.get(root);
    c.users.push(userId);
    c.events.push(...timeline);
  }

  // ────────────────────────────────────────
  // Pass 3: score per cluster + Top-K heap
  // ────────────────────────────────────────
  const heap = new MinHeap((a, b) => a.score - b.score);
  const casePacks = [];

  for (const [root, cluster] of clusters.entries()) {
    const users = cluster.users;
    const events = cluster.events;
    events.sort((a, b) => a.timestamp - b.timestamp);

    const totalDeposit = events.filter((x) => x.transaction_type === "deposit").reduce((s, x) => s + x.amount, 0);
    const totalWithdraw = events.filter((x) => x.transaction_type === "withdraw").reduce((s, x) => s + x.amount, 0);
    const totalProfit = events.reduce((s, x) => s + (Number(x.profit) || 0), 0);

    // activity rate
    const firstTs = events[0]?.timestamp ?? 0;
    const lastTs = events[events.length - 1]?.timestamp ?? 0;
    const durationMin = Math.max(1, Math.round((lastTs - firstTs) / 60000));
    const eventsPerMin = events.length / durationMin;

    // withdraw ratio
    const MIN_DEPOSIT_FOR_RATIO = 50;
    const withdrawRatio = totalDeposit >= MIN_DEPOSIT_FOR_RATIO ? (totalWithdraw / totalDeposit) : null;
    const inOutClose = totalDeposit > 0 && Math.abs(totalDeposit - totalWithdraw) / totalDeposit < 0.01;

    // rapid cycle
    let rapidCycleMinutes = null;
    let lastD = null;
    let lastT = null;
    for (const ev of events) {
      if (ev.transaction_type === "deposit") lastD = ev.timestamp;
      if (ev.transaction_type === "trade" && lastD != null) lastT = ev.timestamp;
      if (
        ev.transaction_type === "withdraw" &&
        lastD != null &&
        lastT != null &&
        lastD <= lastT &&
        lastT <= ev.timestamp
      ) {
        rapidCycleMinutes = Math.round((ev.timestamp - lastD) / 60000);
        break;
      }
    }

    const tinyProfitCycle =
      rapidCycleMinutes != null &&
      rapidCycleMinutes <= 60 &&
      totalDeposit > 0 &&
      totalWithdraw > 0 &&
      Math.abs(totalProfit) <= Math.max(0.01, 0.0005 * totalDeposit);

    // link strength / types
    const linkTypes = new Set();
    for (const u of users) {
      const reasons = uf.explainPath(u) || [];
      for (const r of reasons) if (r && r.by) linkTypes.add(r.by);
    }
    const linkStrength = linkTypes.size;

    // velocity max across users
    let maxDepCount15m = 0;
    let maxWdCount15m = 0;
    for (const u of users) {
      maxDepCount15m = Math.max(maxDepCount15m, userPeakDepositWin.get(u) || 0);
      maxWdCount15m = Math.max(maxWdCount15m, userPeakWithdrawWin.get(u) || 0);
    }

    // typology tags
    const typologyTags = [];
    if (rapidCycleMinutes != null && rapidCycleMinutes <= 60) typologyTags.push("rapid_in_out");
    if (users.length >= 3 && linkStrength >= 2) typologyTags.push("ring_activity");
    if (withdrawRatio != null && withdrawRatio >= 1.5) typologyTags.push("high_withdraw_ratio");
    if (tinyProfitCycle) typologyTags.push("layering");
    if (eventsPerMin >= 2) typologyTags.push("burst_velocity");
    if (inOutClose) typologyTags.push("pass_through");

    // behavior
    const { behaviorAnom, behaviorEvidence } = computeClusterBehavior(events, users, behaviorProfiles);

    // temporal change detection
    const temporalChange = detectTemporalChange(events, 72);

    // predictive risk (early warning signals)
    const userProfiles = users.map(u => behaviorProfiles.get(u)).filter(Boolean);
    const predictiveResults = users.map(u => {
      const userEvents = timelineByUser.get(u) || [];
      const userProfile = behaviorProfiles.get(u);
      return computePredictiveRisk(userEvents, userProfile);
    });
    const maxPredictiveScore = Math.max(0, ...predictiveResults.map(r => r.predictiveScore));
    const allPredictiveWarnings = predictiveResults.flatMap(r => r.earlyWarnings || []);

    const signals = {
      depositCount15m: maxDepCount15m,
      withdrawCount15m: maxWdCount15m,
      rapidCycleMinutes,
      tinyProfitCycle,
      amountSpike: false,
      clusterSize: users.length,
      eventsPerMin,
      withdrawRatio,
      inOutClose,
      linkStrength,
      typologyTags,
      behaviorAnom,
      temporalChange: temporalChange.changeScore,
      predictiveScore: maxPredictiveScore
    };

    // score
    const scored = scoreCase(signals);
    const score = Number(scored.score || 0);
    const reasons = scored.reasons || [];
    const score_breakdown = Array.isArray(scored.score_breakdown) ? scored.score_breakdown : [];

    // evidence_signals
    const evidence_signals = [];
    for (const e of score_breakdown) {
      evidence_signals.push({
        type: "scoring",
        key: e.key,
        detail: e.reason,
        points: e.points,
        severity: e.priority === 1 ? "error" : e.priority === 2 ? "warning" : "info",
      });
    }
    for (const be of behaviorEvidence || []) {
      evidence_signals.push({
        type: "behavior",
        key: "behavior_anom",
        detail: be.detail,
        points: null,
        severity: be.value >= 0.7 ? "error" : "warning",
      });
    }
    for (const te of temporalChange.evidence || []) {
      evidence_signals.push({
        type: "temporal",
        key: "temporal_change",
        detail: te.detail,
        points: null,
        severity: te.value >= 0.7 ? "error" : "warning",
      });
    }
    for (const pw of allPredictiveWarnings.slice(0, 5)) {
      evidence_signals.push({
        type: "predictive",
        key: "predictive_risk",
        detail: pw.detail,
        points: null,
        severity: pw.severity || "warning",
      });
    }

    // would_block
    const hasWithdraw = events.some((x) => x.transaction_type === "withdraw");
    const would_block = hasWithdraw && score >= 60;

    const caseId = `case_cluster_${root}`;
    const linkEvidence = buildAggregatedLinkEvidence(uf, users, 10);

    // Fraud type classification
    const fraudClassification = classifyFraudType({
      typologyTags,
      score,
      linkStrength,
      cluster_size: users.length,
      predictiveScore: maxPredictiveScore,
      temporalChange
    });

    const pack = {
      case_id: caseId,
      user_id: `cluster_${root}`,
      members: users.slice(0, 50),
      member_count: users.length,
      score,
      reasons,
      score_breakdown,
      evidence_signals,

      behaviorAnom,
      temporalChange: temporalChange.hasChange ? temporalChange : null,
      predictiveScore: maxPredictiveScore,
      would_block,

      cluster_size: users.length,
      linkStrength,
      linkTypes: [...linkTypes],

      typologyTags,

      // IMPORTANT for unsupervised feature extraction
      rapidCycleMinutes,

      totals: { deposit: totalDeposit, withdraw: totalWithdraw, profit: totalProfit },
      timeline: events.slice(0, 100),
      link_evidence: linkEvidence,
      feedback: null,

      // fraud classification
      fraudClassification,

      // will be attached after unsupervised pass
      unsupervised: null
    };

    casePacks.push(pack);

    heap.pushTopK(
      {
        case_id: caseId,
        user_id: `cluster_${root}`,
        score,
        reasons,
        cluster_size: users.length,
        linkStrength,
        typologyTags,
        would_block,
        feedback: null,
        unsupervised: null,
        fraudClassification
      },
      topK
    );
  }

  // ────────────────────────────────────────
  // Pass 4: UNSUPERVISED typology discovery
  // ────────────────────────────────────────
  const discovered = discoverTypologies(casePacks, {
    eps: Number(process.env.UC_EPS || 1.2),
    minPts: Number(process.env.UC_MINPTS || 3),
    rareK: Number(process.env.UC_RAREK || 2),
  });

  // attach per-pack unsupervised results
  for (const p of casePacks) {
    const u = discovered?.perCase?.get(p.case_id);
    if (u) p.unsupervised = u;
  }

  // attach into topCases list too (so dashboard can show)
  const largestClusterOverall = Math.max(1, ...[...clusters.values()].map((c) => c.users.length));
  console.log("clusters:", clusters.size, "largest_cluster:", largestClusterOverall);

  const topCases = heap.toSortedDesc();
  const perCase = discovered?.perCase;

  for (const c of topCases) {
    if (perCase && perCase.has(c.case_id)) c.unsupervised = perCase.get(c.case_id);
  }

  const caseById = new Map(casePacks.map((p) => [p.case_id, p]));

  return {
    topCases,
    caseById,
    totalCases: casePacks.length,
    totalEvents: norm.length,
    largestClusterOverall,
    unsupervised_summary: discovered?.summary || null
  };
}

module.exports = { buildTriage };
