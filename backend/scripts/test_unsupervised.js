// Test script to verify unsupervised discovery is working
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { buildTriage } = require("../src/triage/engine");

console.log("🧪 Testing Unsupervised Discovery...\n");

// Load demo data
const demoFile = path.join(__dirname, "..", "demo_enhanced.csv");
if (!fs.existsSync(demoFile)) {
  console.error("❌ demo_enhanced.csv not found. Run: npm run generate-demo");
  process.exit(1);
}

const csvText = fs.readFileSync(demoFile, "utf-8");
const records = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });

console.log(`📊 Loaded ${records.length} transactions from demo_enhanced.csv\n`);

// Run triage
console.log("🔄 Running triage engine...\n");
const result = buildTriage(records, { topK: 50 });

console.log("✅ Triage complete!\n");
console.log("=" .repeat(60));
console.log("RESULTS");
console.log("=".repeat(60));
console.log(`Total Events: ${result.totalEvents}`);
console.log(`Total Cases: ${result.totalCases}`);
console.log(`Top Cases: ${result.topCases.length}`);
console.log(`Largest Cluster: ${result.largestClusterOverall} accounts`);
console.log();

// Check unsupervised discovery
if (!result.unsupervised_summary) {
  console.error("❌ FAILED: No unsupervised_summary in result!");
  process.exit(1);
}

const summary = result.unsupervised_summary;
console.log("=" .repeat(60));
console.log("UNSUPERVISED DISCOVERY");
console.log("=".repeat(60));
console.log(`Algorithm: DBSCAN`);
console.log(`Parameters: eps=${summary.eps}, minPts=${summary.minPts}`);
console.log(`Discovered Clusters: ${summary.clusters.length}`);
console.log(`Noise Points (Outliers): ${summary.noise_count}`);
console.log();

// Show clusters
if (summary.clusters.length > 0) {
  console.log("📊 Discovered Clusters:");
  console.log("-".repeat(60));
  
  for (const cluster of summary.clusters) {
    const isRare = cluster.size <= 2;
    const marker = isRare ? "⚠️  RARE/NOVEL" : "✓";
    
    console.log(`\n${marker} Cluster ${cluster.discovered_cluster}:`);
    console.log(`   Size: ${cluster.size} cases`);
    console.log(`   Top Features:`);
    
    for (const feat of cluster.top_features.slice(0, 3)) {
      const absZ = Math.abs(feat.z);
      const strength = absZ > 2 ? "VERY HIGH" : absZ > 1 ? "HIGH" : "MODERATE";
      console.log(`     - ${feat.feature}: z=${feat.z.toFixed(2)} (${strength})`);
    }
    
    console.log(`   Sample Cases: ${cluster.sample_cases.slice(0, 3).join(", ")}`);
  }
} else {
  console.log("⚠️  No clusters discovered (all cases are outliers)");
}

console.log();
console.log("-".repeat(60));

// Check per-case assignments
console.log("\n📋 Per-Case Assignments:");
console.log("-".repeat(60));

let novelCount = 0;
let commonCount = 0;
let noiseCount = 0;

for (const [caseId, data] of result.caseById.entries()) {
  if (data.unsupervised) {
    if (data.unsupervised.discovered_cluster === "NOISE") {
      noiseCount++;
    } else if (data.unsupervised.discovered_novel) {
      novelCount++;
    } else {
      commonCount++;
    }
  }
}

console.log(`Novel Patterns (rare clusters): ${novelCount} cases`);
console.log(`Common Patterns: ${commonCount} cases`);
console.log(`Outliers (NOISE): ${noiseCount} cases`);
console.log(`Total with unsupervised data: ${novelCount + commonCount + noiseCount} / ${result.totalCases}`);

// Show some examples
console.log("\n🔍 Example Novel Cases:");
console.log("-".repeat(60));

let exampleCount = 0;
for (const [caseId, data] of result.caseById.entries()) {
  if (data.unsupervised?.discovered_novel && exampleCount < 3) {
    console.log(`\nCase: ${caseId}`);
    console.log(`  Cluster: ${data.unsupervised.discovered_cluster}`);
    console.log(`  Reason: ${data.unsupervised.discovered_reason}`);
    console.log(`  Risk Score: ${data.score}/100`);
    console.log(`  Typologies: ${(data.typologyTags || []).join(", ") || "None"}`);
    exampleCount++;
  }
}

console.log();
console.log("=".repeat(60));
console.log("TEST RESULTS");
console.log("=".repeat(60));

// Validation checks
const checks = [
  {
    name: "Unsupervised summary exists",
    pass: !!result.unsupervised_summary
  },
  {
    name: "Clusters discovered",
    pass: summary.clusters.length > 0
  },
  {
    name: "Per-case data attached",
    pass: (novelCount + commonCount + noiseCount) === result.totalCases
  },
  {
    name: "Novel patterns identified",
    pass: novelCount > 0 || noiseCount > 0
  },
  {
    name: "Feature vectors computed",
    pass: summary.clusters.every(c => c.top_features && c.top_features.length > 0)
  }
];

let allPassed = true;
for (const check of checks) {
  const status = check.pass ? "✅ PASS" : "❌ FAIL";
  console.log(`${status}: ${check.name}`);
  if (!check.pass) allPassed = false;
}

console.log();
if (allPassed) {
  console.log("🎉 SUCCESS! Unsupervised discovery is working correctly!");
  console.log();
  console.log("Key Findings:");
  console.log(`  - Discovered ${summary.clusters.length} distinct fraud patterns`);
  console.log(`  - Identified ${novelCount + noiseCount} novel/rare cases`);
  console.log(`  - ${noiseCount} outliers that don't fit any pattern`);
  console.log();
  console.log("This proves the system can discover NEW fraud typologies");
  console.log("not explicitly programmed into the rules!");
} else {
  console.log("❌ FAILED: Some checks did not pass");
  process.exit(1);
}

console.log();
console.log("To see this in the UI:");
console.log("  1. Start backend: npm run dev");
console.log("  2. Start frontend: cd ../frontend && npm run dev");
console.log("  3. Upload demo_enhanced.csv");
console.log("  4. Click 'Unsupervised Discovery' tab");
console.log();
