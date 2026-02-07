// backend/src/triage/predictive.js
// Predictive risk scoring: flag accounts as high-risk BEFORE fraud occurs

/**
 * Compute early warning signals for an account based on setup patterns.
 * 
 * @param {Array} events — account timeline (sorted)
 * @param {Object} profile — behavioral profile from behavior.js
 * @returns {{ predictiveScore: number, earlyWarnings: Array }}
 */
function computePredictiveRisk(events, profile) {
  if (!events || events.length === 0) {
    return { predictiveScore: 0, earlyWarnings: [] };
  }

  const warnings = [];
  let score = 0;

  const firstTs = events[0].timestamp;
  const lastTs = events[events.length - 1].timestamp;
  const accountAgeHours = (lastTs - firstTs) / (60 * 60 * 1000);
  const accountAgeDays = accountAgeHours / 24;

  // 1. Rapid setup pattern: KYC → deposit → minimal activity → withdrawal attempt
  const deposits = events.filter(e => e.transaction_type === "deposit");
  const withdrawals = events.filter(e => e.transaction_type === "withdraw");
  const trades = events.filter(e => e.transaction_type === "trade");

  if (accountAgeDays < 3 && deposits.length > 0 && withdrawals.length > 0 && trades.length < 5) {
    score += 0.6;
    warnings.push({
      type: "predictive",
      detail: `Rapid setup pattern: account ${accountAgeDays.toFixed(1)} days old with deposit → minimal trading (${trades.length}) → withdrawal attempt`,
      value: 0.6,
      severity: "warning"
    });
  }

  // 2. Multiple devices before first trade (account takeover indicator)
  const deviceCount = profile?.devices?.size || 0;
  const firstTradeIdx = events.findIndex(e => e.transaction_type === "trade");
  
  if (firstTradeIdx > 0 && deviceCount >= 3) {
    const eventsBeforeTrade = events.slice(0, firstTradeIdx);
    const devicesBeforeTrade = new Set(eventsBeforeTrade.map(e => e.device_id).filter(Boolean));
    
    if (devicesBeforeTrade.size >= 3) {
      score += 0.5;
      warnings.push({
        type: "predictive",
        detail: `Multiple devices (${devicesBeforeTrade.size}) used before first trade — possible account takeover`,
        value: 0.5,
        severity: "warning"
      });
    }
  }

  // 3. Deposit-only pattern with no trading (setup for laundering)
  if (accountAgeDays < 7 && deposits.length >= 3 && trades.length === 0 && withdrawals.length === 0) {
    score += 0.4;
    warnings.push({
      type: "predictive",
      detail: `Deposit-only pattern: ${deposits.length} deposits with no trading activity in ${accountAgeDays.toFixed(1)} days`,
      value: 0.4,
      severity: "info"
    });
  }

  // 4. Unusual first transaction amount (significantly higher than segment baseline)
  if (profile?._segment && deposits.length > 0) {
    const firstDeposit = deposits[0].amount;
    const segmentStats = profile._segment.amountStats?.get("deposit");
    
    if (segmentStats && segmentStats.n >= 10) {
      const logAmt = Math.log(Math.max(1, firstDeposit));
      const z = segmentStats.zScore(logAmt);
      
      if (z > 3) {
        score += 0.5;
        warnings.push({
          type: "predictive",
          detail: `First deposit amount (${firstDeposit.toFixed(2)}) unusually high for segment (z=${z.toFixed(1)})`,
          value: 0.5,
          severity: "warning"
        });
      }
    }
  }

  // 5. Rapid deposit → withdrawal with no profit motive
  if (deposits.length > 0 && withdrawals.length > 0) {
    const totalDeposit = deposits.reduce((s, e) => s + e.amount, 0);
    const totalWithdraw = withdrawals.reduce((s, e) => s + e.amount, 0);
    const totalProfit = events.reduce((s, e) => s + (Number(e.profit) || 0), 0);
    
    const firstDepositTs = deposits[0].timestamp;
    const firstWithdrawTs = withdrawals[0].timestamp;
    const cycleHours = (firstWithdrawTs - firstDepositTs) / (60 * 60 * 1000);
    
    if (cycleHours < 24 && Math.abs(totalProfit) < 0.01 * totalDeposit) {
      score += 0.7;
      warnings.push({
        type: "predictive",
        detail: `Rapid deposit → withdrawal cycle (${cycleHours.toFixed(1)}h) with minimal profit (${totalProfit.toFixed(2)}) — laundering indicator`,
        value: 0.7,
        severity: "error"
      });
    }
  }

  // 6. IP/device novelty in early transactions (account testing)
  if (accountAgeDays < 2 && events.length >= 5) {
    const uniqueIPs = new Set(events.slice(0, 5).map(e => e.ip_address).filter(Boolean));
    const uniqueDevices = new Set(events.slice(0, 5).map(e => e.device_id).filter(Boolean));
    
    if (uniqueIPs.size >= 3 || uniqueDevices.size >= 3) {
      score += 0.4;
      warnings.push({
        type: "predictive",
        detail: `High IP/device diversity in first 5 transactions (${uniqueIPs.size} IPs, ${uniqueDevices.size} devices) — testing behavior`,
        value: 0.4,
        severity: "info"
      });
    }
  }

  // 7. Weekend/off-hours setup (fraud rings often operate outside business hours)
  if (accountAgeDays < 1) {
    const setupHour = new Date(firstTs).getUTCHours();
    const setupDay = new Date(firstTs).getUTCDay();
    
    if ((setupDay === 0 || setupDay === 6) || (setupHour < 6 || setupHour > 22)) {
      score += 0.3;
      warnings.push({
        type: "predictive",
        detail: `Account setup during off-hours (${setupDay === 0 || setupDay === 6 ? 'weekend' : 'late night'}) — elevated risk`,
        value: 0.3,
        severity: "info"
      });
    }
  }

  return {
    predictiveScore: Math.min(1, score),
    earlyWarnings: warnings.slice(0, 5)
  };
}

/**
 * Compute account-level risk score (not case-level).
 * Used for proactive monitoring before clustering.
 * 
 * @param {string} userId
 * @param {Array} events — user's timeline
 * @param {Object} profile — from buildBehaviorProfile
 * @returns {{ accountRisk: number, riskLevel: string, warnings: Array }}
 */
function computeAccountRisk(userId, events, profile) {
  const { predictiveScore, earlyWarnings } = computePredictiveRisk(events, profile);
  
  // Combine predictive signals with basic activity metrics
  const deposits = events.filter(e => e.transaction_type === "deposit");
  const withdrawals = events.filter(e => e.transaction_type === "withdraw");
  const totalDeposit = deposits.reduce((s, e) => s + e.amount, 0);
  const totalWithdraw = withdrawals.reduce((s, e) => s + e.amount, 0);
  
  let accountRisk = predictiveScore * 100;
  
  // Boost risk if high-value with predictive signals
  if (totalDeposit > 10000 && predictiveScore > 0.5) {
    accountRisk = Math.min(100, accountRisk * 1.2);
  }
  
  // Boost risk if withdrawal pending with signals
  const hasWithdrawal = withdrawals.length > 0;
  if (hasWithdrawal && predictiveScore > 0.6) {
    accountRisk = Math.min(100, accountRisk * 1.3);
  }
  
  const riskLevel = 
    accountRisk >= 70 ? "critical" :
    accountRisk >= 50 ? "high" :
    accountRisk >= 30 ? "medium" : "low";
  
  return {
    userId,
    accountRisk: Math.round(accountRisk),
    riskLevel,
    warnings: earlyWarnings,
    recommendedAction: 
      accountRisk >= 70 ? "Block withdrawal and escalate for review" :
      accountRisk >= 50 ? "Enhanced monitoring and step-up verification" :
      accountRisk >= 30 ? "Standard monitoring" : "Normal processing"
  };
}

module.exports = {
  computePredictiveRisk,
  computeAccountRisk
};
