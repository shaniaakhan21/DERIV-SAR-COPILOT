require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { parse } = require("csv-parse/sync");
const crypto = require("crypto");

const { batches, pruneBatches } = require("./triage/store");
const { buildTriage } = require("./triage/engine");
const { generateSarWithLLM } = require("./llm/sar");
const feedbackStore = require("./triage/feedbackStore");
const { sortByPriority } = require("./triage/priority");
const { explainCase, explainNetwork, explainNextSteps } = require("./triage/explainer");

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  pruneBatches();
  next();
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.get("/health", (req, res) => res.json({ ok: true }));

// ── Metrics endpoint ──
app.get("/metrics", (req, res) => {
  const { batchId } = req.query;
  if (!batchId || !batches.has(batchId)) return res.status(404).json({ error: "Invalid batchId" });

  const b = batches.get(batchId);
  const allCases = b.topCases || [];
  
  // Alert reduction metrics
  const totalEvents = b.totalEvents || 0;
  const totalCases = b.totalCases || 0;
  const highConfidenceCases = allCases.filter(c => c.score >= 60).length;
  const mediumCases = allCases.filter(c => c.score >= 40 && c.score < 60).length;
  const lowCases = allCases.filter(c => c.score < 40).length;
  
  // Feedback metrics
  const labeledCases = allCases.filter(c => c.feedback);
  const tpCount = labeledCases.filter(c => c.feedback === "TP").length;
  const fpCount = labeledCases.filter(c => c.feedback === "FP").length;
  const precision = labeledCases.length > 0 ? (tpCount / labeledCases.length) : null;
  
  // Typology distribution
  const typologyCount = new Map();
  for (const c of allCases) {
    for (const tag of c.typologyTags || []) {
      typologyCount.set(tag, (typologyCount.get(tag) || 0) + 1);
    }
  }
  
  // Network metrics
  const clusteredCases = allCases.filter(c => c.cluster_size > 1).length;
  const avgClusterSize = allCases.reduce((s, c) => s + (c.cluster_size || 1), 0) / Math.max(1, allCases.length);
  const maxLinkStrength = Math.max(0, ...allCases.map(c => c.linkStrength || 0));
  
  // Intervention metrics
  const wouldBlockCount = allCases.filter(c => c.would_block).length;
  
  // Unsupervised discovery
  const novelCases = allCases.filter(c => c.unsupervised?.discovered_novel).length;
  const discoveredClusters = new Set(
    allCases
      .filter(c => c.unsupervised?.discovered_cluster && c.unsupervised.discovered_cluster !== "NOISE")
      .map(c => c.unsupervised.discovered_cluster)
  ).size;
  
  return res.json({
    batchId,
    alert_reduction: {
      total_events: totalEvents,
      total_cases: totalCases,
      high_confidence: highConfidenceCases,
      medium_confidence: mediumCases,
      low_confidence: lowCases,
      reduction_rate: totalEvents > 0 ? ((totalEvents - highConfidenceCases) / totalEvents * 100).toFixed(1) + "%" : "N/A",
      target_achieved: highConfidenceCases <= 50 && highConfidenceCases > 0
    },
    feedback_learning: {
      labeled_cases: labeledCases.length,
      true_positives: tpCount,
      false_positives: fpCount,
      precision: precision !== null ? (precision * 100).toFixed(1) + "%" : "N/A",
      learning_active: labeledCases.length >= 10
    },
    typology_detection: {
      unique_typologies: typologyCount.size,
      distribution: Object.fromEntries(typologyCount)
    },
    network_analysis: {
      clustered_cases: clusteredCases,
      avg_cluster_size: avgClusterSize.toFixed(1),
      max_link_strength: maxLinkStrength,
      largest_cluster: b.largestClusterOverall || 1
    },
    intervention: {
      would_block_count: wouldBlockCount,
      intervention_rate: allCases.length > 0 ? (wouldBlockCount / allCases.length * 100).toFixed(1) + "%" : "N/A"
    },
    unsupervised_discovery: {
      novel_patterns: novelCases,
      discovered_clusters: discoveredClusters,
      novelty_rate: allCases.length > 0 ? (novelCases / allCases.length * 100).toFixed(1) + "%" : "N/A"
    }
  });
});

// ── Upload CSV and run triage ──
app.post("/triage/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Missing file (field name must be 'file')" });
  }

  const csvText = req.file.buffer.toString("utf-8");
  const records = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });

  const batchId = `batch_${crypto.randomUUID()}`;
  const { topCases, caseById, totalCases, totalEvents, largestClusterOverall, unsupervised_summary } =
    buildTriage(records, { topK: 50 });

  batches.set(batchId, {
    caseById,
    topCases,
    totalCases,
    totalEvents,
    largestClusterOverall,
    unsupervised_summary,
    builtAt: Date.now()
  });
  pruneBatches();

  const avgEventsPerCase = Math.round(totalEvents / Math.max(1, totalCases));
  const largestClusterInTopK = Math.max(1, ...topCases.map((c) => c.cluster_size || 1));
  const highRiskCount = topCases.filter((c) => c.score >= 60).length;

  return res.json({
    batchId,
    rows: totalEvents,
    cases: totalCases,
    topK: topCases.length,
    stats: {
      avgEventsPerCase,
      largestClusterInTopK,
      largestClusterOverall: largestClusterOverall || 1,
      highRiskCount
    },
    unsupervised_summary: unsupervised_summary || null
  });
});

app.delete("/batches/:batchId", (req, res) => {
  const existed = batches.delete(req.params.batchId);
  res.json({ ok: true, deleted: existed });
});

// ── Get unsupervised discovery summary ──
app.get("/unsupervised/:batchId", (req, res) => {
  const { batchId } = req.params;
  if (!batchId || !batches.has(batchId)) return res.status(404).json({ error: "Invalid batchId" });

  const b = batches.get(batchId);
  const summary = b.unsupervised_summary || null;
  
  if (!summary) {
    return res.json({
      message: "No unsupervised discovery data available",
      clusters: [],
      noise_count: 0
    });
  }

  return res.json(summary);
});

// ── List cases with optional filters ──
app.get("/cases", (req, res) => {
  const { batchId } = req.query;
  const k = Number(req.query.k || 50);
  const minScore = Number(req.query.minScore || 0);
  const sortBy = req.query.sortBy || "score"; // "score" or "priority"
  
  if (!batchId || !batches.has(batchId)) return res.status(404).json({ error: "Invalid batchId" });

  const b = batches.get(batchId);
  let top = (b.topCases || []).slice(0, Math.max(1, Math.min(200, k)));

  if (minScore > 0) {
    top = top.filter((c) => c.score >= minScore);
  }

  // Sort by priority if requested
  if (sortBy === "priority") {
    top = sortByPriority(top);
  }

  res.json({
    batchId,
    totalEvents: b.totalEvents,
    totalCases: b.totalCases,
    largestClusterOverall: b.largestClusterOverall || 1,
    topCases: top
  });
});

// ── Single case detail ──
app.get("/cases/:caseId", (req, res) => {
  const { batchId } = req.query;
  const { explain } = req.query; // ?explain=true for plain language
  
  if (!batchId || !batches.has(batchId)) return res.status(404).json({ error: "Invalid batchId" });

  const b = batches.get(batchId);
  const pack = b.caseById.get(req.params.caseId);
  if (!pack) return res.status(404).json({ error: "Case not found" });

  if (explain === "true") {
    return res.json({
      ...pack,
      plainLanguage: {
        summary: explainCase(pack),
        network: explainNetwork(pack),
        nextSteps: explainNextSteps(pack)
      }
    });
  }

  res.json(pack);
});

// ── Feedback: label case as TP or FP ──
app.post("/cases/:caseId/feedback", (req, res) => {
  const { batchId } = req.body;
  const { label } = req.body;
  if (!batchId || !batches.has(batchId)) return res.status(404).json({ error: "Invalid batchId" });
  if (!label || !["TP", "FP"].includes(label)) return res.status(400).json({ error: "label must be 'TP' or 'FP'" });

  const b = batches.get(batchId);
  const pack = b.caseById.get(req.params.caseId);
  if (!pack) return res.status(404).json({ error: "Case not found" });

  pack.feedback = label;

  // Also update in topCases array
  const topEntry = b.topCases.find((c) => c.case_id === req.params.caseId);
  if (topEntry) topEntry.feedback = label;

  // Record feedback for learning (adjusts future signal weights)
  const signalKeys = (pack.score_breakdown || []).map((e) => e.key).filter(Boolean);
  if (signalKeys.length > 0) {
    feedbackStore.recordFeedback(label, signalKeys);
  }

  res.json({ ok: true, case_id: req.params.caseId, feedback: label });
});

app.post("/sar/generate", async (req, res) => {
  try {
    const { batchId, caseId } = req.body;
    if (!batchId || !batches.has(batchId)) return res.status(404).json({ error: "Invalid batchId" });

    const b = batches.get(batchId);
    const pack = b.caseById.get(caseId);
    if (!pack) return res.status(404).json({ error: "Case not found" });

    const deterministic = buildSarDraft(pack);

    const llmNarrative = await generateSarWithLLM(pack, deterministic);

    return res.json({
      ...deterministic,
      narrative: llmNarrative || deterministic.narrative,
      llm_used: Boolean(llmNarrative),
    });
  } catch (e) {
    console.error("SAR LLM error:", e);
    return res.status(500).json({ error: "Failed to generate SAR via LLM" });
  }
});


function buildSarDraft(pack) {
  const isLowRisk = pack.score < 35 && !(pack.reasons?.length) && !(pack.typologyTags?.length);

  const typologyLine = pack.typologyTags && pack.typologyTags.length
    ? `Detected typologies: ${pack.typologyTags.join(", ")}.`
    : "";

  const linkLine = pack.linkStrength
    ? `Cluster linked by ${pack.linkStrength} distinct mechanism(s): ${(pack.linkTypes || []).join(", ")}.`
    : "";

  return {
    subject: isLowRisk
      ? `Case Review Note — ${pack.case_id}`
      : `Suspicious Activity Report Draft — ${pack.case_id}`,
    riskScore: pack.score,
    typologyTags: pack.typologyTags || [],
    summary: [
      `This case involves ${pack.member_count} linked account(s) flagged with a risk score of ${pack.score}/100.`,
      `Key findings: ${pack.reasons.join("; ")}.`,
      typologyLine,
      linkLine
    ].filter(Boolean).join(" "),
    key_metrics: pack.totals,
    network: {
      cluster_size: pack.cluster_size,
      linkStrength: pack.linkStrength || 0,
      linkTypes: pack.linkTypes || [],
      sample_members: pack.members ? pack.members.slice(0, 10) : []
    },
    evidence: {
      link_evidence: pack.link_evidence || [],
      timeline_sample: (pack.timeline || []).slice(0, 20)
    },
    narrative: buildNarrative(pack),
    investigator_next_steps: [
      "Verify source of funds against customer profile and KYC.",
      "Check shared infrastructure indicators (IP/device patterns) across linked accounts.",
      "Review withdrawal destination details and velocity.",
      "Cross-reference typology tags with known fraud patterns in your jurisdiction.",
      "Escalate for enhanced due diligence if pattern repeats."
    ]
  };
}

function buildNarrative(pack) {
  const isLowRisk = pack.score < 35 && !(pack.reasons?.length) && !(pack.typologyTags?.length);
  const lines = [];
  lines.push(`Between ${fmtTs(pack.timeline[0]?.timestamp)} and ${fmtTs(pack.timeline[pack.timeline.length - 1]?.timestamp)}, ` +
    `a cluster of ${pack.member_count} account(s) exhibited ${isLowRisk ? "routine transactional activity" : "suspicious transactional behavior"}.`);

  if (pack.totals.deposit > 0) {
    lines.push(`Total deposits: $${fmt(pack.totals.deposit)}. Total withdrawals: $${fmt(pack.totals.withdraw)}.`);
  }

  if (pack.typologyTags && pack.typologyTags.length) {
    const tagDescs = {
      rapid_in_out: "rapid deposit-trade-withdraw cycling",
      ring_activity: "multi-account ring coordination",
      high_withdraw_ratio: "disproportionately high withdrawals relative to deposits",
      layering: "tiny-profit layering consistent with money laundering",
      burst_velocity: "burst transaction velocity exceeding normal patterns",
      pass_through: "near 1:1 pass-through of funds"
    };
    const descs = pack.typologyTags.map((t) => tagDescs[t] || t);
    lines.push(`The activity pattern is consistent with: ${descs.join("; ")}.`);
  }

  lines.push("This narrative is auto-generated and should be reviewed by a compliance officer before filing.");
  return lines.join("\n\n");
}

function fmt(n) { return Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtTs(ts) { return ts ? new Date(ts).toISOString().slice(0, 19).replace("T", " ") : "N/A"; }

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
