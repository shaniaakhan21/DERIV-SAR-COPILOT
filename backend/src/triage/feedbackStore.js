// backend/src/triage/feedbackStore.js
// FP reduction learning — persists TP/FP counts per signal key to JSON.

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const FILE = path.join(DATA_DIR, "feedback.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function load() {
  ensureDir();
  if (!fs.existsSync(FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return {};
  }
}

function save(data) {
  ensureDir();
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Record analyst feedback for a set of signal keys.
 * @param {"TP"|"FP"} label
 * @param {string[]} signalKeys — keys from score_breakdown entries
 */
function recordFeedback(label, signalKeys) {
  if (!label || !Array.isArray(signalKeys) || signalKeys.length === 0) return;
  const data = load();
  const field = label === "TP" ? "tp" : "fp";

  for (const key of signalKeys) {
    if (!key) continue;
    if (!data[key]) data[key] = { tp: 0, fp: 0 };
    data[key][field]++;
  }

  save(data);
}

/**
 * Bayesian precision weight for a signal key.
 * precision = (tp + 1) / (tp + fp + 2)   (Laplace smoothing)
 * weight    = 0.5 + precision             (range [0.5 .. 1.5])
 *
 * No feedback yet → precision = 0.5 → weight = 1.0 (neutral).
 */
function getWeight(key) {
  const data = load();
  const entry = data[key];
  if (!entry) return 1.0;
  const precision = (entry.tp + 1) / (entry.tp + entry.fp + 2);
  return Math.round((0.5 + precision) * 100) / 100; // two-decimal round
}

module.exports = { load, save, recordFeedback, getWeight };
