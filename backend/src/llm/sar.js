const OpenAI = require("openai");

// Tune these thresholds for demo
const SAR_THRESHOLD = Number(process.env.SAR_THRESHOLD || 35);

function buildSarPrompt(pack, draft) {
  const reasons = (pack.reasons || []).filter(Boolean);
  const typologies = (pack.typologyTags || []).filter(Boolean);
  const linkTypes = (pack.linkTypes || []).filter(Boolean);

  return `
You are a financial crime compliance analyst. Rewrite the SAR narrative in clear, regulator-ready language.

Rules:
- Do not invent facts.
- Only use the evidence provided.
- Keep it concise (120–220 words).
- Mention timeframe, total deposits/withdrawals, key typologies, and network links (device/IP/affiliate) if present.
- Provide EXACTLY 3 sections in this order:
  (1) Narrative
  (2) Bullet Indicators
  (3) Recommended action
- IMPORTANT: If the case does NOT meet the SAR threshold (risk score < ${SAR_THRESHOLD}) OR there are no suspicious indicators,
  DO NOT call it "suspicious". Instead, write it as a "Case Review Note" stating it appears normal and does not warrant SAR filing.

EVIDENCE (facts):
Case ID: ${pack.case_id}
Risk score: ${pack.score}/100
Members: ${pack.member_count}
Reasons: ${reasons.length ? reasons.join("; ") : "None"}
Typologies: ${typologies.length ? typologies.join(", ") : "None"}
Totals: deposits=${pack.totals?.deposit || 0}, withdrawals=${pack.totals?.withdraw || 0}, profit=${pack.totals?.profit || 0}
Link types: ${linkTypes.length ? linkTypes.join(", ") : "None"}
Cluster size: ${pack.cluster_size}

Timeline sample (first 12):
${(pack.timeline || []).slice(0, 12).map(e =>
  `${e.timestamp} | ${e.user_id} | ${e.transaction_type} | ${e.amount} | ${e.country} | ${e.device_id} | ${e.ip_address}`
).join("\n")}

CURRENT DRAFT (for reference):
${draft?.narrative || "N/A"}
`;
}

async function generateSarWithLLM(pack, deterministicDraft) {
  // Initialize OpenAI client
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const prompt = buildSarPrompt(pack, deterministicDraft);

  const response = await client.chat.completions.create({
    model: modelName,
    messages: [
      { role: "system", content: "You write Suspicious Activity Reports for financial regulators." },
      { role: "user", content: prompt }
    ],
    temperature: 0.2,
    max_tokens: 2048,
  });

  return response.choices?.[0]?.message?.content?.trim() || "";
}

module.exports = { generateSarWithLLM };
