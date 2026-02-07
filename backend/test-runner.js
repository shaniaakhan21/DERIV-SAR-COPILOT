/**
 * Simple Test Runner for SAR Copilot
 * 
 * Run: node test-runner.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 SAR Copilot Test Runner\n');
console.log('='.repeat(50));

// Test 1: Check if demo data exists
function testDemoDataExists() {
  console.log('\n📋 Test 1: Demo Data Exists');
  const demoPath = path.join(__dirname, 'demo_enhanced.csv');
  
  if (fs.existsSync(demoPath)) {
    const stats = fs.statSync(demoPath);
    const lines = fs.readFileSync(demoPath, 'utf-8').split('\n').length;
    console.log(`  ✅ PASS: demo_enhanced.csv found`);
    console.log(`     Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`     Lines: ${lines}`);
    return true;
  } else {
    console.log(`  ❌ FAIL: demo_enhanced.csv not found`);
    console.log(`     Run: node scripts/generate_enhanced_demo.js`);
    return false;
  }
}

// Test 2: Check if required modules exist
function testRequiredModules() {
  console.log('\n📦 Test 2: Required Modules');
  const requiredModules = [
    'express',
    'cors',
    'multer',
    'csv-parse',
    'openai'
  ];
  
  let allFound = true;
  for (const mod of requiredModules) {
    try {
      require.resolve(mod);
      console.log(`  ✅ ${mod} installed`);
    } catch (e) {
      console.log(`  ❌ ${mod} missing`);
      allFound = false;
    }
  }
  
  if (!allFound) {
    console.log(`\n  Run: npm install`);
  }
  
  return allFound;
}

// Test 3: Check if source files exist
function testSourceFiles() {
  console.log('\n📁 Test 3: Source Files');
  const requiredFiles = [
    'src/index.js',
    'src/dsu.js',
    'src/triage/engine.js',
    'src/triage/scoring.js',
    'src/triage/behavior.js',
    'src/llm/sar.js'
  ];
  
  let allFound = true;
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} missing`);
      allFound = false;
    }
  }
  
  return allFound;
}

// Test 4: Check environment variables
function testEnvironment() {
  console.log('\n🔐 Test 4: Environment Variables');
  const envPath = path.join(__dirname, 'src/.env');
  
  if (!fs.existsSync(envPath)) {
    console.log(`  ⚠️  WARNING: .env file not found`);
    console.log(`     Copy src/.env.example to src/.env`);
    console.log(`     Add your OPENAI_API_KEY`);
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  if (envContent.includes('OPENAI_API_KEY=sk-')) {
    console.log(`  ✅ OPENAI_API_KEY configured`);
    return true;
  } else if (envContent.includes('OPENAI_API_KEY=')) {
    console.log(`  ⚠️  WARNING: OPENAI_API_KEY may not be set`);
    console.log(`     SAR generation will not work without valid key`);
    return false;
  } else {
    console.log(`  ❌ OPENAI_API_KEY not found in .env`);
    return false;
  }
}

// Test 5: Test CSV parsing
function testCSVParsing() {
  console.log('\n📊 Test 5: CSV Parsing');
  const demoPath = path.join(__dirname, 'demo_enhanced.csv');
  
  if (!fs.existsSync(demoPath)) {
    console.log(`  ⏭️  SKIP: demo_enhanced.csv not found`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(demoPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());
    const header = lines[0].split(',');
    
    const requiredColumns = [
      'account_id',
      'timestamp',
      'event_type',
      'amount'
    ];
    
    let allFound = true;
    for (const col of requiredColumns) {
      if (header.includes(col)) {
        console.log(`  ✅ Column: ${col}`);
      } else {
        console.log(`  ❌ Missing column: ${col}`);
        allFound = false;
      }
    }
    
    console.log(`  ℹ️  Total rows: ${lines.length - 1}`);
    return allFound;
  } catch (error) {
    console.log(`  ❌ FAIL: ${error.message}`);
    return false;
  }
}

// Test 6: Test DSU algorithm
function testDSU() {
  console.log('\n🔗 Test 6: DSU Algorithm');
  
  try {
    const DSU = require('./src/dsu');
    const dsu = new DSU();
    
    // Test basic operations
    dsu.union('A', 'B');
    dsu.union('B', 'C');
    
    const rootA = dsu.find('A');
    const rootC = dsu.find('C');
    
    if (rootA === rootC) {
      console.log(`  ✅ Union/Find works correctly`);
      console.log(`  ✅ A and C are in same set`);
      return true;
    } else {
      console.log(`  ❌ Union/Find not working`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ FAIL: ${error.message}`);
    return false;
  }
}

// Test 7: Test MinHeap
function testMinHeap() {
  console.log('\n📈 Test 7: MinHeap');
  
  try {
    const MinHeap = require('./src/dsa/minHeap');
    const heap = new MinHeap((a, b) => a.score - b.score);
    
    heap.push({ id: 1, score: 50 });
    heap.push({ id: 2, score: 30 });
    heap.push({ id: 3, score: 70 });
    
    const min = heap.peek();
    
    if (min.score === 30) {
      console.log(`  ✅ MinHeap works correctly`);
      console.log(`  ✅ Min element: ${min.score}`);
      return true;
    } else {
      console.log(`  ❌ MinHeap not working correctly`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ FAIL: ${error.message}`);
    return false;
  }
}

// Test 8: Test scoring logic
function testScoring() {
  console.log('\n🎯 Test 8: Scoring Logic');
  
  try {
    const { scoreCase } = require('./src/triage/scoring');
    
    const testCase = {
      events: [
        {
          event_type: 'deposit',
          amount: 5000,
          timestamp: '2024-01-01T10:00:00Z'
        },
        {
          event_type: 'withdrawal',
          amount: 4900,
          timestamp: '2024-01-01T10:30:00Z'
        }
      ],
      cluster_size: 5,
      linkStrength: 3
    };
    
    const score = scoreCase(testCase);
    
    if (typeof score === 'number' && score >= 0 && score <= 100) {
      console.log(`  ✅ Scoring works correctly`);
      console.log(`  ℹ️  Test case score: ${score}`);
      return true;
    } else {
      console.log(`  ❌ Invalid score: ${score}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ FAIL: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0
  };
  
  const tests = [
    { name: 'Demo Data', fn: testDemoDataExists, critical: true },
    { name: 'Modules', fn: testRequiredModules, critical: true },
    { name: 'Source Files', fn: testSourceFiles, critical: true },
    { name: 'Environment', fn: testEnvironment, critical: false },
    { name: 'CSV Parsing', fn: testCSVParsing, critical: true },
    { name: 'DSU', fn: testDSU, critical: true },
    { name: 'MinHeap', fn: testMinHeap, critical: true },
    { name: 'Scoring', fn: testScoring, critical: true }
  ];
  
  for (const test of tests) {
    const result = test.fn();
    if (result === true) {
      results.passed++;
    } else if (result === false && test.critical) {
      results.failed++;
    } else {
      results.warnings++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All critical tests passed!');
    console.log('✅ System is ready to run');
    console.log('\nNext steps:');
    console.log('  1. Start backend: npm run dev');
    console.log('  2. Start frontend: cd ../frontend && npm run dev');
    console.log('  3. Open: http://localhost:5173');
  } else {
    console.log('\n❌ Some tests failed');
    console.log('⚠️  Fix the issues above before running');
  }
  
  console.log('\n' + '='.repeat(50));
}

// Run tests
runAllTests().catch(console.error);
