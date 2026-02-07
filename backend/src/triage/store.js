const batches = new Map(); // batchId -> { caseById, topCases, totalCases, totalEvents, largestClusterOverall, builtAt }

const MAX_BATCH_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_BATCHES = 20;

function pruneBatches(now = Date.now()) {
  for (const [batchId, batch] of batches.entries()) {
    if (!batch || !batch.builtAt || now - batch.builtAt > MAX_BATCH_AGE_MS) {
      batches.delete(batchId);
    }
  }

  if (batches.size <= MAX_BATCHES) return;

  const ordered = [...batches.entries()].sort(
    (a, b) => (a[1]?.builtAt || 0) - (b[1]?.builtAt || 0)
  );
  const overflow = batches.size - MAX_BATCHES;
  for (let i = 0; i < overflow; i++) {
    batches.delete(ordered[i][0]);
  }
}

module.exports = { batches, pruneBatches, MAX_BATCH_AGE_MS, MAX_BATCHES };
