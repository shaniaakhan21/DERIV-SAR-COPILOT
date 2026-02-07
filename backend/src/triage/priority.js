// backend/src/triage/priority.js
// Fraud type prioritization and severity classification

/**
 * Fraud type priority configuration.
 * Higher priority = more severe / regulatory urgency.
 */
const FRAUD_TYPE_PRIORITY = {
  // Critical (Priority 1) - Regulatory filing required
  money_laundering: { priority: 1, severity: "critical", sla_hours: 24 },
  terrorist_financing: { priority: 1, severity: "critical", sla_hours: 24 },
  
  // High (Priority 2) - Immediate investigation
  coordinated_fraud_ring: { priority: 2, severity: "high", sla_hours: 48 },
  account_takeover: { priority: 2, severity: "high", sla_hours: 48 },
  payment_fraud: { priority: 2, severity: "high", sla_hours: 72 },
  
  // Medium (Priority 3) - Standard review
  market_abuse: { priority: 3, severity: "medium", sla_hours: 120 },
  insider_trading: { priority: 3, severity: "medium", sla_hours: 120 },
  
  // Low (Priority 4) - Monitoring
  suspicious_pattern: { priority: 4, severity: "low", sla_hours: 240 },
  behavioral_anomaly: { priority: 4, severity: "low", sla_hours: 240 }
};

/**
 * Map typology tags to fraud types.
 */
const TYPOLOGY_TO_FRAUD_TYPE = {
  rapid_in_out: "money_laundering",
  layering: "money_laundering",
  pass_through: "money_laundering",
  ring_activity: "coordinated_fraud_ring",
  high_withdraw_ratio: "money_laundering",
  burst_velocity: "suspicious_pattern"
};

/**
 * Classify case fraud type and priority.
 * 
 * @param {Object} caseData - Case with typologyTags, score, linkStrength, etc.
 * @returns {Object} - { fraudType, priority, severity, slaHours, deadline }
 */
function classifyFraudType(caseData) {
  const typologyTags = caseData.typologyTags || [];
  const score = Number(caseData.score || 0);
  const linkStrength = Number(caseData.linkStrength || 0);
  const clusterSize = Number(caseData.cluster_size || 1);
  
  // Determine primary fraud type from typologies
  let fraudType = "suspicious_pattern"; // default
  let highestPriority = 4;
  
  for (const tag of typologyTags) {
    const mapped = TYPOLOGY_TO_FRAUD_TYPE[tag];
    if (mapped) {
      const config = FRAUD_TYPE_PRIORITY[mapped];
      if (config && config.priority < highestPriority) {
        fraudType = mapped;
        highestPriority = config.priority;
      }
    }
  }
  
  // Override based on network indicators
  if (clusterSize >= 5 && linkStrength >= 2) {
    fraudType = "coordinated_fraud_ring";
    highestPriority = 2;
  }
  
  // Override for high-risk behavioral anomalies
  if (caseData.predictiveScore > 0.7 && caseData.temporalChange?.hasChange) {
    fraudType = "account_takeover";
    highestPriority = 2;
  }
  
  const config = FRAUD_TYPE_PRIORITY[fraudType] || FRAUD_TYPE_PRIORITY.suspicious_pattern;
  
  // Calculate deadline (from now)
  const deadline = new Date(Date.now() + config.sla_hours * 60 * 60 * 1000);
  
  return {
    fraudType,
    priority: config.priority,
    severity: config.severity,
    slaHours: config.sla_hours,
    deadline: deadline.toISOString(),
    description: getFraudTypeDescription(fraudType)
  };
}

/**
 * Get human-readable fraud type description.
 */
function getFraudTypeDescription(fraudType) {
  const descriptions = {
    money_laundering: "Money Laundering - Suspicious fund movement patterns",
    terrorist_financing: "Terrorist Financing - High-risk jurisdictions or entities",
    coordinated_fraud_ring: "Coordinated Fraud Ring - Multiple linked accounts",
    account_takeover: "Account Takeover - Behavioral change indicators",
    payment_fraud: "Payment Fraud - Stolen cards or chargeback patterns",
    market_abuse: "Market Abuse - Trading manipulation indicators",
    insider_trading: "Insider Trading - Suspicious timing patterns",
    suspicious_pattern: "Suspicious Pattern - Requires investigation",
    behavioral_anomaly: "Behavioral Anomaly - Deviation from baseline"
  };
  
  return descriptions[fraudType] || "Unknown fraud type";
}

/**
 * Sort cases by priority (for dashboard display).
 * Priority 1 (critical) first, then by score descending.
 */
function sortByPriority(cases) {
  return cases.slice().sort((a, b) => {
    const aPriority = a.fraudClassification?.priority || 4;
    const bPriority = b.fraudClassification?.priority || 4;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority; // lower priority number = higher urgency
    }
    
    // Same priority: sort by score descending
    return (b.score || 0) - (a.score || 0);
  });
}

/**
 * Get cases by severity level.
 */
function filterBySeverity(cases, severity) {
  return cases.filter(c => c.fraudClassification?.severity === severity);
}

/**
 * Get overdue cases (past SLA deadline).
 */
function getOverdueCases(cases) {
  const now = Date.now();
  return cases.filter(c => {
    const deadline = c.fraudClassification?.deadline;
    return deadline && new Date(deadline).getTime() < now;
  });
}

module.exports = {
  classifyFraudType,
  sortByPriority,
  filterBySeverity,
  getOverdueCases,
  FRAUD_TYPE_PRIORITY
};
