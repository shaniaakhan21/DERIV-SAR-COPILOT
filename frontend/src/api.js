const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${BASE}/triage/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function getCases(batchId, { k = 50, minScore = 0, sortBy = "score" } = {}) {
  const params = new URLSearchParams({ batchId, k, minScore, sortBy });
  const res = await fetch(`${BASE}/cases?${params}`);
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function getCaseDetail(batchId, caseId) {
  const res = await fetch(`${BASE}/cases/${caseId}?batchId=${batchId}`);
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function generateSar(batchId, caseId) {
  const res = await fetch(`${BASE}/sar/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ batchId, caseId }),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function submitFeedback(batchId, caseId, label) {
  const res = await fetch(`${BASE}/cases/${caseId}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ batchId, label }),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}
