// backend/src/triage/explainer.js
// Plain-language explanations for non-technical compliance officers

/**
 * Convert technical signal to plain language.
 */
function explainSignal(signal) {
  const detail = signal.detail || "";
  const type = signal.type || "";
  
  // Technical term replacements
  const replacements = {
    "z-score": "statistical deviation",
    "z=": "deviation level: ",
    "DBSCAN": "pattern clustering",
    "Welford": "statistical analysis",
    "Bayesian": "probability-based",
    "anomaly": "unusual pattern",
    "typology": "fraud pattern",
    "cluster": "linked group",
    "DSU": "network analysis",
    "velocity": "transaction speed",
    "behavioral": "activity pattern"
  };
  
  let plain = detail;
  for (const [tech, simple] of Object.entries(replacements)) {
    plain = plain.replace(new RegExp(tech, "gi"), simple);
  }
  
  return {
    original: detail,
    plain,
    type,
    severity: signal.severity
  };
}

/**
 * Generate plain-language case summary.
 */
function explainCase(pack) {
  const score = Number(pack.score || 0);
  const clusterSize = Number(pack.cluster_size || 1);
  const linkStrength = Number(pack.linkStrength || 0);
  const typologyTags = pack.typologyTags || [];
  
  const parts = [];
  
  // Risk level
  if (score >= 70) {
    parts.push("This is a **critical risk** case requiring immediate investigation.");
  } else if (score >= 40) {
    parts.push("This is a **high risk** case that should be reviewed promptly.");
  } else {
    parts.push("This is a **medium risk** case for standard monitoring.");
  }
  
  // Network
  if (clusterSize > 1) {
    parts.push(`We found **${clusterSize} accounts** that appear to be connected.`);
    
    if (linkStrength >= 3) {
      parts.push("These accounts share multiple connection points (devices, IP addresses, and affiliates), which is highly suspicious.");
    } else if (linkStrength === 2) {
      parts.push("These accounts share at least two connection points (like devices or IP addresses).");
    } else {
      parts.push("These accounts share at least one connection point.");
    }
  } else {
    parts.push("This is a single account with no detected network connections.");
  }
  
  // Typologies
  if (typologyTags.length > 0) {
    parts.push("\n**Suspicious patterns detected:**");
    
    const explanations = {
      rapid_in_out: "Money moves in and out very quickly (within an hour), which is common in money laundering.",
      layering: "Tiny profits suggest the goal isn't trading but moving money through the system to hide its origin.",
      pass_through: "Nearly all deposited money is withdrawn, suggesting the account is being used to transfer funds.",
      ring_activity: "Multiple accounts working together in a coordinated pattern.",
      high_withdraw_ratio: "Withdrawals are much higher than deposits, which is unusual for legitimate trading.",
      burst_velocity: "Transactions happen very rapidly in a short time window."
    };
    
    for (const tag of typologyTags) {
      const exp = explanations[tag] || tag.replace(/_/g, " ");
      parts.push(`- ${exp}`);
    }
  }
  
  // Temporal changes
  if (pack.temporalChange?.hasChange) {
    parts.push("\n**Behavior changed over time:** The account's activity pattern shifted significantly after it was created, which can indicate account takeover or planned fraud.");
  }
  
  // Predictive signals
  if (pack.predictiveScore > 0.5) {
    parts.push("\n**Early warning signs:** This account showed suspicious setup patterns before any major fraud occurred, suggesting premeditated activity.");
  }
  
  // Intervention
  if (pack.would_block) {
    parts.push("\n**Recommended action:** Hold any pending withdrawals and escalate for enhanced due diligence before releasing funds.");
  } else {
    parts.push("\n**Recommended action:** Continue monitoring. No immediate intervention required.");
  }
  
  return parts.join("\n");
}

/**
 * Explain network relationships in simple terms.
 */
function explainNetwork(pack) {
  const linkEvidence = pack.link_evidence || [];
  const clusterSize = Number(pack.cluster_size || 1);
  
  if (clusterSize === 1) {
    return "This is a single account with no detected connections to other accounts.";
  }
  
  const parts = [`This group contains ${clusterSize} accounts that are connected through:`];
  
  const byType = new Map();
  for (const ev of linkEvidence) {
    if (!byType.has(ev.by)) byType.set(ev.by, []);
    byType.get(ev.by).push(ev.key);
  }
  
  const explanations = {
    device: "**Shared devices:** Multiple accounts logged in from the same device, suggesting one person controls them all.",
    ip: "**Shared IP addresses:** Multiple accounts accessed from the same internet connection.",
    affiliate: "**Shared referral codes:** Accounts were created using the same affiliate or referral link.",
    "merchant+net": "**Similar payment patterns:** Accounts use similar payment methods from the same network location."
  };
  
  for (const [type, keys] of byType.entries()) {
    const exp = explanations[type] || `Shared ${type}`;
    parts.push(`\n${exp}`);
    parts.push(`  Examples: ${keys.slice(0, 3).join(", ")}${keys.length > 3 ? ` (+${keys.length - 3} more)` : ""}`);
  }
  
  parts.push("\n**Why this matters:** When accounts share multiple connection points, it's a strong indicator of coordinated fraud or money laundering.");
  
  return parts.join("\n");
}

/**
 * Explain what to do next (investigator guidance).
 */
function explainNextSteps(pack) {
  const score = Number(pack.score || 0);
  const steps = [];
  
  if (score >= 70) {
    steps.push("1. **Immediate action:** Hold any pending withdrawals and freeze account activity.");
    steps.push("2. **Enhanced due diligence:** Request additional KYC documents and source of funds verification.");
    steps.push("3. **Cross-reference:** Check if any linked accounts have prior fraud history or regulatory flags.");
    steps.push("4. **SAR filing:** Prepare Suspicious Activity Report for regulatory submission within 24 hours.");
  } else if (score >= 40) {
    steps.push("1. **Review transaction history:** Look for patterns that explain the suspicious signals.");
    steps.push("2. **Contact customer:** Request clarification on transaction purpose and source of funds.");
    steps.push("3. **Monitor closely:** Set up alerts for any new activity on this account or linked accounts.");
    steps.push("4. **Document findings:** Record your investigation notes for audit trail.");
  } else {
    steps.push("1. **Standard monitoring:** Continue normal oversight procedures.");
    steps.push("2. **Periodic review:** Check back in 30 days to see if patterns persist or escalate.");
    steps.push("3. **Update risk profile:** Adjust customer risk rating if new information emerges.");
  }
  
  if (pack.cluster_size > 1) {
    steps.push(`\n**Network investigation:** Review all ${pack.cluster_size} linked accounts for similar patterns. Fraud rings often have a mix of "mule" accounts and controller accounts.`);
  }
  
  if (pack.typologyTags?.includes("rapid_in_out") || pack.typologyTags?.includes("layering")) {
    steps.push("\n**Money laundering focus:** This pattern is consistent with placement/layering stages of money laundering. Verify the source of deposited funds and destination of withdrawals.");
  }
  
  return steps.join("\n");
}

module.exports = {
  explainSignal,
  explainCase,
  explainNetwork,
  explainNextSteps
};
