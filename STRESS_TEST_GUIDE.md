# 🔥 Stress Testing Guide

## Quick Stress Tests

### Test 1: Large File Upload (2 minutes)

**Goal:** Test system with large dataset

**Steps:**
```bash
# 1. Generate large dataset
cd backend
node scripts/generate_enhanced_demo.js

# This creates demo_enhanced.csv with 388 rows
# For stress test, let's create a bigger file
```

**Create Large Test File:**
```bash
# Windows PowerShell
Get-Content demo_enhanced.csv | Select-Object -First 1 > large_test.csv
for ($i=1; $i -le 10; $i++) {
    Get-Content demo_enhanced.csv | Select-Object -Skip 1 >> large_test.csv
}

# Mac/Linux
head -1 demo_enhanced.csv > large_test.csv
for i in {1..10}; do
    tail -n +2 demo_enhanced.csv >> large_test.csv
done
```

This creates ~3,880 rows (10x the original)

**Test:**
1. Start backend and frontend
2. Upload `large_test.csv`
3. Measure:
   - Upload time (should be < 10 seconds)
   - Processing time (should be < 5 seconds)
   - Memory usage (should be < 500MB)
   - No errors in console

**Expected Results:**
- ✅ Processes successfully
- ✅ Dashboard loads
- ✅ Cases table shows results
- ✅ No browser freeze

---

### Test 2: Rapid Uploads (1 minute)

**Goal:** Test multiple rapid uploads

**Steps:**
1. Upload `demo_enhanced.csv`
2. Wait 2 seconds
3. Upload again (same file)
4. Wait 2 seconds
5. Upload again
6. Repeat 5 times

**Expected Results:**
- ✅ Each upload creates new batchId
- ✅ No memory leaks
- ✅ No errors
- ✅ Dashboard updates correctly

---

### Test 3: Simulation Stress (2 minutes)

**Goal:** Test simulation multiple times

**Steps:**
1. Upload data
2. Start simulation
3. Wait for completion
4. Immediately start again
5. Repeat 5 times

**Expected Results:**
- ✅ Each simulation completes
- ✅ No memory leaks
- ✅ Notifications work every time
- ✅ Activity feed resets properly

---

### Test 4: Concurrent Users (5 minutes)

**Goal:** Simulate multiple users

**Setup:**
```bash
# Open 3 browser windows/tabs
# Window 1: http://localhost:5173
# Window 2: http://localhost:5173
# Window 3: http://localhost:5173
```

**Test:**
1. Upload data in Window 1
2. Upload data in Window 2 (different batchId)
3. Upload data in Window 3 (different batchId)
4. Start simulation in all 3 windows simultaneously

**Expected Results:**
- ✅ Each window has independent state
- ✅ Backend handles concurrent requests
- ✅ No cross-contamination of data
- ✅ All simulations complete

---

### Test 5: Memory Leak Test (5 minutes)

**Goal:** Check for memory leaks

**Steps:**
1. Open DevTools (F12) → Memory tab
2. Take heap snapshot (baseline)
3. Upload data
4. Start simulation
5. Wait for completion
6. Take heap snapshot
7. Repeat steps 3-6 five times
8. Compare snapshots

**Expected Results:**
- ✅ Memory increases < 10MB per cycle
- ✅ Garbage collection works
- ✅ No retained objects growing indefinitely

---

### Test 6: Network Stress (3 minutes)

**Goal:** Test with slow network

**Steps:**
1. Open DevTools (F12) → Network tab
2. Set throttling to "Slow 3G"
3. Upload data
4. Start simulation

**Expected Results:**
- ✅ Upload completes (may take longer)
- ✅ Simulation works
- ✅ No timeouts
- ✅ UI remains responsive

---

### Test 7: Browser Stress (2 minutes)

**Goal:** Test with many tabs open

**Steps:**
1. Open 20+ browser tabs (any websites)
2. Open app in new tab
3. Upload data
4. Start simulation

**Expected Results:**
- ✅ App loads
- ✅ Simulation works
- ✅ No crashes
- ✅ Reasonable performance

---

## Advanced Stress Tests

### Test 8: API Stress Test

**Create test script:**

```javascript
// stress-test-api.js
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function stressTest() {
  const concurrentRequests = 10;
  const iterations = 5;
  
  console.log(`Starting stress test: ${concurrentRequests} concurrent requests, ${iterations} iterations`);
  
  for (let i = 0; i < iterations; i++) {
    console.log(`\nIteration ${i + 1}/${iterations}`);
    
    const promises = [];
    for (let j = 0; j < concurrentRequests; j++) {
      const formData = new FormData();
      formData.append('file', fs.createReadStream('./demo_enhanced.csv'));
      
      const promise = fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        console.log(`  Request ${j + 1}: Success (${data.stats.totalEvents} events)`);
        return data;
      })
      .catch(err => {
        console.error(`  Request ${j + 1}: Failed - ${err.message}`);
      });
      
      promises.push(promise);
    }
    
    await Promise.all(promises);
    console.log(`Iteration ${i + 1} complete`);
    
    // Wait 2 seconds between iterations
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\nStress test complete!');
}

stressTest();
```

**Run:**
```bash
cd backend
npm install node-fetch form-data
node stress-test-api.js
```

**Expected Results:**
- ✅ All requests succeed
- ✅ Response time < 5 seconds per request
- ✅ No 500 errors
- ✅ Backend remains stable

---

### Test 9: Long-Running Session

**Goal:** Test app stability over time

**Steps:**
1. Start app
2. Upload data
3. Leave browser open for 1 hour
4. Periodically (every 10 min):
   - Start simulation
   - Navigate to case detail
   - Navigate back
   - Check metrics tab

**Expected Results:**
- ✅ No memory leaks
- ✅ No performance degradation
- ✅ All features still work
- ✅ No errors accumulate

---

### Test 10: Edge Cases

**Test with malformed data:**

```csv
# Create bad_data.csv
account_id,timestamp,event_type,amount
ACC001,invalid-date,deposit,1000
ACC002,2024-01-01T00:00:00Z,unknown_type,500
ACC003,2024-01-01T00:00:00Z,deposit,-1000
,2024-01-01T00:00:00Z,deposit,1000
ACC005,2024-01-01T00:00:00Z,deposit,
```

**Test:**
1. Upload `bad_data.csv`
2. Check error handling

**Expected Results:**
- ✅ Graceful error message
- ✅ No crash
- ✅ Clear error description

---

## Performance Benchmarks

### Target Metrics

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Upload time (388 rows) | < 2s | < 5s | > 5s |
| Processing time | < 1s | < 3s | > 3s |
| Dashboard load | < 500ms | < 1s | > 1s |
| Simulation (45s) | Smooth | Minor lag | Freezes |
| Memory usage | < 100MB | < 200MB | > 300MB |
| CPU usage | < 10% | < 20% | > 30% |

### How to Measure

**Upload Time:**
```javascript
// In browser console
console.time('upload');
// Upload file
// After upload completes:
console.timeEnd('upload');
```

**Memory Usage:**
```
1. Open Task Manager (Windows) or Activity Monitor (Mac)
2. Find browser process
3. Note memory before upload
4. Upload and process
5. Note memory after
6. Difference = memory used
```

**CPU Usage:**
```
1. Open Task Manager or Activity Monitor
2. Watch CPU % during simulation
3. Should stay < 10%
```

---

## Automated Test Suite

**Create comprehensive test:**

```javascript
// test-suite.js
const tests = [
  {
    name: 'Upload Test',
    run: async () => {
      // Test upload functionality
      console.log('Testing upload...');
      // Add test logic
    }
  },
  {
    name: 'Simulation Test',
    run: async () => {
      // Test simulation
      console.log('Testing simulation...');
      // Add test logic
    }
  },
  {
    name: 'Memory Test',
    run: async () => {
      // Test memory usage
      console.log('Testing memory...');
      // Add test logic
    }
  }
];

async function runTests() {
  console.log('Starting test suite...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      await test.run();
      console.log(`✅ ${test.name} PASSED\n`);
      passed++;
    } catch (error) {
      console.error(`❌ ${test.name} FAILED: ${error.message}\n`);
      failed++;
    }
  }
  
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

runTests();
```

---

## Quick Checklist

### Before Demo
```
□ Upload test (demo_enhanced.csv)
□ Simulation test (start/stop/complete)
□ Navigation test (dashboard ↔ case detail)
□ Metrics tab test
□ Console check (no errors)
□ Memory check (< 200MB)
□ CPU check (< 20%)
```

### Stress Test
```
□ Large file test (3,880 rows)
□ Rapid uploads (5x)
□ Multiple simulations (5x)
□ Concurrent users (3 windows)
□ Memory leak test (5 cycles)
□ Network throttling test
□ Browser stress test (20+ tabs)
```

### Edge Cases
```
□ Malformed CSV
□ Empty file
□ Very large file (10,000+ rows)
□ Special characters in data
□ Missing columns
```

---

## Common Issues & Fixes

### Issue: Upload takes too long
**Diagnosis:** Large file or slow backend
**Fix:**
- Check file size (should be < 1MB)
- Check backend CPU usage
- Restart backend if needed

### Issue: Simulation freezes
**Diagnosis:** Memory issue or infinite loop
**Fix:**
- Check console for errors
- Refresh page
- Check memory usage

### Issue: Memory keeps growing
**Diagnosis:** Memory leak
**Fix:**
- Check for event listeners not cleaned up
- Check for intervals not cleared
- Refresh page periodically

### Issue: Backend crashes
**Diagnosis:** Out of memory or unhandled error
**Fix:**
- Check backend logs
- Restart backend
- Check for error handling

---

## Performance Optimization Tips

### Frontend
1. Use React.memo for expensive components
2. Debounce rapid state updates
3. Lazy load heavy components
4. Optimize re-renders

### Backend
1. Add request rate limiting
2. Implement caching
3. Use streaming for large files
4. Add connection pooling

### Database (if added)
1. Add indexes
2. Use connection pooling
3. Implement pagination
4. Cache frequent queries

---

## Monitoring During Demo

**Keep these open:**
1. Browser DevTools (F12) → Console
2. Browser DevTools → Network
3. Task Manager / Activity Monitor
4. Backend terminal (watch for errors)

**Watch for:**
- ❌ Red errors in console
- ❌ Failed network requests
- ❌ Memory > 300MB
- ❌ CPU > 30%
- ❌ Backend errors

---

## Emergency Procedures

### If app crashes during demo:
1. Stay calm
2. Refresh browser (Ctrl+R)
3. If still broken, restart backend
4. If still broken, restart both
5. Have backup: screenshots/video

### If simulation won't start:
1. Check console for errors
2. Refresh page
3. Upload data again
4. Try again

### If backend is slow:
1. Check CPU usage
2. Restart backend
3. Use smaller dataset
4. Continue with what works

---

## Success Criteria

### ✅ PASS if:
- All basic tests pass
- Upload works reliably
- Simulation completes
- No crashes
- Memory stable
- Performance acceptable

### ⚠️ WARNING if:
- Occasional errors
- Slow but works
- High memory but stable
- Minor UI glitches

### ❌ FAIL if:
- Frequent crashes
- Cannot upload
- Simulation broken
- Memory leaks
- Unusable performance

---

**Ready to stress test!** Start with Quick Tests, then move to Advanced if needed. 🔥
