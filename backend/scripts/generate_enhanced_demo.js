// Generate enhanced demo data with realistic fraud scenarios
const fs = require("fs");
const path = require("path");

const OUTPUT = path.join(__dirname, "..", "demo_enhanced.csv");

// Helper functions
function randomId(prefix) {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

function randomAmount(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function formatTimestamp(date) {
  return date.toISOString();
}

const countries = ["US", "UK", "SG", "MY", "TH"];
const devices = ["mobile", "desktop", "tablet"];
const merchants = ["credit_card", "bank_transfer", "ewallet", "crypto"];

let txId = 1;
const rows = [];

function addRow(userId, timestamp, amount, type, deviceId, ip, affiliate, country, merchant, deviceUsed, profit = 0) {
  rows.push({
    transaction_id: `tx_${String(txId++).padStart(6, "0")}`,
    user_id: userId,
    timestamp: formatTimestamp(timestamp),
    amount,
    transaction_type: type,
    device_id: deviceId || "",
    ip_address: ip || "",
    affiliate_id: affiliate || "",
    country: country || countries[Math.floor(Math.random() * countries.length)],
    merchant_category: merchant || merchants[Math.floor(Math.random() * merchants.length)],
    device_used: deviceUsed || devices[Math.floor(Math.random() * devices.length)],
    profit: profit || 0
  });
}

// ============================================
// SCENARIO 1: $0.01 Profit Laundering (Critical)
// ============================================
console.log("Generating Scenario 1: $0.01 Profit Laundering...");
const launderer = "user_launder_001";
const launderDevice = "dev_launder_shared";
const launderIP = "203.45.67.89";
let ts = new Date("2024-02-01T10:00:00Z");

addRow(launderer, ts, 5000, "deposit", launderDevice, launderIP, "aff_001", "MY", "bank_transfer", "desktop");
ts = addMinutes(ts, 5);
addRow(launderer, ts, 100, "trade", launderDevice, launderIP, "aff_001", "MY", "bank_transfer", "desktop", 0.01);
ts = addMinutes(ts, 3);
addRow(launderer, ts, 100, "trade", launderDevice, launderIP, "aff_001", "MY", "bank_transfer", "desktop", 0.01);
ts = addMinutes(ts, 7);
addRow(launderer, ts, 5000.02, "withdraw", launderDevice, launderIP, "aff_001", "MY", "bank_transfer", "desktop");

// ============================================
// SCENARIO 2: 47-Account Fraud Ring (Critical)
// ============================================
console.log("Generating Scenario 2: 47-Account Fraud Ring...");
const ringDevice1 = "dev_ring_alpha";
const ringDevice2 = "dev_ring_beta";
const ringIP1 = "45.123.45.67";
const ringIP2 = "45.123.45.68";
const ringAff = "aff_ring_master";

ts = new Date("2024-02-02T08:00:00Z");

for (let i = 1; i <= 47; i++) {
  const userId = `user_ring_${String(i).padStart(3, "0")}`;
  const device = i % 2 === 0 ? ringDevice1 : ringDevice2;
  const ip = i % 3 === 0 ? ringIP1 : ringIP2;
  
  addRow(userId, ts, randomAmount(500, 2000), "deposit", device, ip, ringAff, "TH", "ewallet", "mobile");
  ts = addMinutes(ts, 2);
  
  if (i % 5 === 0) {
    addRow(userId, ts, randomAmount(100, 500), "trade", device, ip, ringAff, "TH", "ewallet", "mobile", randomAmount(-10, 10));
    ts = addMinutes(ts, 1);
  }
  
  if (i % 3 === 0) {
    addRow(userId, ts, randomAmount(400, 1800), "withdraw", device, ip, ringAff, "TH", "ewallet", "mobile");
    ts = addMinutes(ts, 1);
  }
}

// ============================================
// SCENARIO 3: Temporal Behavior Change (High Risk)
// ============================================
console.log("Generating Scenario 3: Temporal Behavior Change...");
const temporal = "user_temporal_001";
const temporalDevice1 = "dev_temporal_old";
const temporalDevice2 = "dev_temporal_new";
const temporalIP1 = "100.200.50.10";
const temporalIP2 = "100.200.50.99";

ts = new Date("2024-02-03T09:00:00Z");

// First 72 hours: normal behavior
for (let i = 0; i < 10; i++) {
  addRow(temporal, ts, randomAmount(50, 200), "deposit", temporalDevice1, temporalIP1, "aff_002", "US", "credit_card", "desktop");
  ts = addMinutes(ts, 120);
  addRow(temporal, ts, randomAmount(20, 100), "trade", temporalDevice1, temporalIP1, "aff_002", "US", "credit_card", "desktop", randomAmount(-5, 15));
  ts = addMinutes(ts, 60);
}

// After 72 hours: behavior changes dramatically
ts = addMinutes(ts, 72 * 60);
addRow(temporal, ts, 10000, "deposit", temporalDevice2, temporalIP2, "aff_002", "SG", "crypto", "mobile");
ts = addMinutes(ts, 10);
addRow(temporal, ts, 500, "trade", temporalDevice2, temporalIP2, "aff_002", "SG", "crypto", "mobile", 1);
ts = addMinutes(ts, 5);
addRow(temporal, ts, 9500, "withdraw", temporalDevice2, temporalIP2, "aff_002", "SG", "crypto", "mobile");

// ============================================
// SCENARIO 4: Predictive Early Warning (High Risk)
// ============================================
console.log("Generating Scenario 4: Predictive Early Warning...");
const predictive = "user_predict_001";
const predDevice1 = "dev_pred_1";
const predDevice2 = "dev_pred_2";
const predDevice3 = "dev_pred_3";
const predIP1 = "88.77.66.55";
const predIP2 = "88.77.66.56";

ts = new Date("2024-02-04T14:00:00Z");

// Multiple devices before first trade (account takeover indicator)
addRow(predictive, ts, 3000, "deposit", predDevice1, predIP1, "aff_003", "UK", "bank_transfer", "desktop");
ts = addMinutes(ts, 5);
addRow(predictive, ts, 100, "deposit", predDevice2, predIP1, "aff_003", "UK", "bank_transfer", "mobile");
ts = addMinutes(ts, 3);
addRow(predictive, ts, 50, "deposit", predDevice3, predIP2, "aff_003", "UK", "bank_transfer", "tablet");
ts = addMinutes(ts, 10);

// Rapid withdrawal attempt (< 24h)
addRow(predictive, ts, 50, "trade", predDevice3, predIP2, "aff_003", "UK", "bank_transfer", "tablet", 0.5);
ts = addMinutes(ts, 5);
addRow(predictive, ts, 3000, "withdraw", predDevice3, predIP2, "aff_003", "UK", "bank_transfer", "tablet");

// ============================================
// SCENARIO 5: Legitimate High-Volume Trader (Low Risk)
// ============================================
console.log("Generating Scenario 5: Legitimate High-Volume Trader...");
const legit = "user_legit_001";
const legitDevice = "dev_legit_stable";
const legitIP = "192.168.1.100";

ts = new Date("2024-02-05T08:00:00Z");

addRow(legit, ts, 50000, "deposit", legitDevice, legitIP, "aff_004", "US", "bank_transfer", "desktop");
ts = addMinutes(ts, 60);

// Regular trading over several days
for (let day = 0; day < 5; day++) {
  for (let i = 0; i < 20; i++) {
    addRow(legit, ts, randomAmount(100, 1000), "trade", legitDevice, legitIP, "aff_004", "US", "bank_transfer", "desktop", randomAmount(-50, 100));
    ts = addMinutes(ts, 30);
  }
  ts = addMinutes(ts, 12 * 60); // overnight gap
}

// Legitimate withdrawal after trading
addRow(legit, ts, 15000, "withdraw", legitDevice, legitIP, "aff_004", "US", "bank_transfer", "desktop");

// ============================================
// SCENARIO 6: Pass-Through Laundering (Critical)
// ============================================
console.log("Generating Scenario 6: Pass-Through Laundering...");
const passThrough = "user_passthrough_001";
const passDevice = "dev_pass_001";
const passIP = "77.88.99.100";

ts = new Date("2024-02-06T11:00:00Z");

addRow(passThrough, ts, 8000, "deposit", passDevice, passIP, "aff_005", "MY", "ewallet", "mobile");
ts = addMinutes(ts, 15);
addRow(passThrough, ts, 200, "trade", passDevice, passIP, "aff_005", "MY", "ewallet", "mobile", 5);
ts = addMinutes(ts, 10);
addRow(passThrough, ts, 8005, "withdraw", passDevice, passIP, "aff_005", "MY", "ewallet", "mobile");

// ============================================
// SCENARIO 7: Burst Velocity Attack (High Risk)
// ============================================
console.log("Generating Scenario 7: Burst Velocity Attack...");
const burst = "user_burst_001";
const burstDevice = "dev_burst_001";
const burstIP = "55.44.33.22";

ts = new Date("2024-02-07T16:00:00Z");

addRow(burst, ts, 2000, "deposit", burstDevice, burstIP, "aff_006", "SG", "credit_card", "desktop");
ts = addMinutes(ts, 1);

// 10 trades in 5 minutes (burst)
for (let i = 0; i < 10; i++) {
  addRow(burst, ts, randomAmount(50, 200), "trade", burstDevice, burstIP, "aff_006", "SG", "credit_card", "desktop", randomAmount(-5, 5));
  ts = addMinutes(ts, 0.5);
}

addRow(burst, ts, 1900, "withdraw", burstDevice, burstIP, "aff_006", "SG", "credit_card", "desktop");

// ============================================
// SCENARIO 8: Normal Users (Low Risk) - Add variety
// ============================================
console.log("Generating Scenario 8: Normal Users...");

for (let u = 1; u <= 20; u++) {
  const userId = `user_normal_${String(u).padStart(3, "0")}`;
  const device = randomId("dev");
  const ip = `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  const aff = `aff_normal_${Math.floor(Math.random() * 5) + 1}`;
  
  ts = new Date(`2024-02-${String(Math.floor(Math.random() * 7) + 1).padStart(2, "0")}T${String(Math.floor(Math.random() * 12) + 8).padStart(2, "0")}:00:00Z`);
  
  addRow(userId, ts, randomAmount(100, 5000), "deposit", device, ip, aff, countries[u % countries.length], merchants[u % merchants.length], devices[u % devices.length]);
  ts = addMinutes(ts, 60 + Math.random() * 120);
  
  const tradeCount = Math.floor(Math.random() * 10) + 3;
  for (let t = 0; t < tradeCount; t++) {
    addRow(userId, ts, randomAmount(10, 500), "trade", device, ip, aff, countries[u % countries.length], merchants[u % merchants.length], devices[u % devices.length], randomAmount(-20, 50));
    ts = addMinutes(ts, 30 + Math.random() * 180);
  }
  
  if (Math.random() > 0.3) {
    addRow(userId, ts, randomAmount(50, 3000), "withdraw", device, ip, aff, countries[u % countries.length], merchants[u % merchants.length], devices[u % devices.length]);
  }
}

// ============================================
// Write CSV
// ============================================
console.log(`\nWriting ${rows.length} transactions to ${OUTPUT}...`);

const headers = Object.keys(rows[0]);
const csv = [
  headers.join(","),
  ...rows.map(row => headers.map(h => row[h]).join(","))
].join("\n");

fs.writeFileSync(OUTPUT, csv, "utf-8");

console.log("✓ Enhanced demo data generated successfully!");
console.log("\nScenarios included:");
console.log("  1. $0.01 Profit Laundering (1 account, critical)");
console.log("  2. 47-Account Fraud Ring (47 accounts, critical)");
console.log("  3. Temporal Behavior Change (1 account, high risk)");
console.log("  4. Predictive Early Warning (1 account, high risk)");
console.log("  5. Legitimate High-Volume Trader (1 account, low risk)");
console.log("  6. Pass-Through Laundering (1 account, critical)");
console.log("  7. Burst Velocity Attack (1 account, high risk)");
console.log("  8. Normal Users (20 accounts, low risk)");
console.log(`\nTotal: ${rows.length} transactions across ~73 accounts`);
console.log("\nUpload demo_enhanced.csv to see all scenarios in action!");
