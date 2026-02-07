# 🧪 Testing the Live Demo Feature

## Automated Tests (30 seconds)

### Run Test Suite
```bash
cd backend
node test-runner.js
```

This automatically checks:
- ✅ Demo data exists
- ✅ All modules installed  
- ✅ Source files present
- ✅ Environment configured
- ✅ CSV parsing works
- ✅ Algorithms work (DSU, MinHeap, Scoring)

**Expected Output:**
```
✅ Passed: 7
❌ Failed: 0
⚠️  Warnings: 1
🎉 All critical tests passed!
```

---

## Quick Test (2 Minutes)

### Prerequisites
1. Backend running: `cd backend && npm run dev`
2. Frontend running: `cd frontend && npm run dev`
3. Browser: http://localhost:5173

### Steps

**1. Upload Data**
- Click "Choose File"
- Select `backend/demo_enhanced.csv`
- Wait 2-3 seconds

**2. Start Simulation**
- Click purple "▶️ Start Live Demo" button (top-left of filters)
- Button should turn red and say "Stop Demo"
- Progress bar should appear

**3. Watch for 45 Seconds**
Check these elements appear:

✅ **Button**: Purple → Red (pulsing) → Purple
✅ **Progress Bar**: 0% → 100% with gradient
✅ **Notifications**: Red alerts in top-right every 10s
✅ **Activity Feed**: Right sidebar with live updates
✅ **Success**: Green notification at end

**4. Check Console**
- Press F12
- No red errors should appear

---

## What You Should See

### Timeline
```
0s   → Click button (turns red)
5s   → First activity logged
10s  → First high-risk notification
20s  → Second notification
30s  → Third notification
40s  → Fourth notification
45s  → Success notification (button turns purple)
```

### Visual Layout
```
┌─────────────────────────────────────────────────────┐
│  [Stop Demo] ← RED, PULSING                         │
│  Processing transactions... 67%                     │
│  ████████████████░░░░░░░░░░░░░░░░░░                │
└─────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────┐
│  Cases Table         │  🔔 Live Activity (5)        │
│  C-0  [85] CRITICAL  │  C-0  [85]                   │
│  C-1  [78] HIGH      │  Blocked withdrawal          │
│  ...                 │  14:23:45                    │
└──────────────────────┴──────────────────────────────┘

                    ┌──────────────────────────┐
                    │ 🚨 High-Risk Alert:      │
                    │ C-0 (Score: 85)          │
                    └──────────────────────────┘
                           ↑ TOP-RIGHT
```

---

## Troubleshooting

### Button Not Visible
- Upload CSV data first
- Check you're on "Cases" tab (not Metrics)
- Scroll to top of page

### No Notifications
- Use `demo_enhanced.csv` (has high-risk cases)
- Wait until 20 seconds
- Check top-right corner of screen

### Progress Bar Stuck
- Check console (F12) for errors
- Click "Stop Demo" and try again
- Refresh page (Ctrl+R)

### Activity Feed Missing
- Make window wider (> 1200px)
- Ensure simulation is running
- Check console for errors

---

## Success Criteria

### ✅ PASS If:
- Button changes color (purple → red → purple)
- Progress bar fills to 100%
- At least 2 notifications appear
- Activity feed shows items
- No console errors

### ❌ FAIL If:
- Button doesn't respond
- Progress bar doesn't move
- No notifications appear
- Console shows errors

---

## Browser Console Test

Open console (F12) and run these commands:

```javascript
// 1. Check if button exists
Array.from(document.querySelectorAll('button')).find(b => 
  b.textContent.includes('Live Demo')
)

// 2. Check for cases
document.querySelectorAll('tbody tr').length

// 3. Check for high-risk cases
Array.from(document.querySelectorAll('.MuiChip-root'))
  .filter(c => parseInt(c.textContent) >= 70).length

// 4. Manually trigger simulation
Array.from(document.querySelectorAll('button'))
  .find(b => b.textContent.includes('Start Live Demo'))?.click()
```

---

## Testing Checklist

Print and check off:

```
□ Backend running (port 3000)
□ Frontend running (port 5173)
□ CSV uploaded successfully
□ Cases table visible

SIMULATION:
□ Button visible and purple
□ Button turns red when clicked
□ Button has pulsing animation
□ Progress bar appears
□ Progress fills to 100%
□ Notifications appear (every 10s)
□ Activity feed appears (right side)
□ Success notification at end
□ Button returns to purple
□ No console errors

RESULT: PASS / FAIL
```

---

## Video Recording

Best way to verify:

**Windows**: Win+G (Game Bar)
**Mac**: Cmd+Shift+5
**Linux**: Kazam or SimpleScreenRecorder

Record the 45-second simulation and review:
- Button color changes
- Progress bar animation
- Notifications appearing
- Activity feed updates
- Smooth performance

---

## Performance Check

### CPU Usage
- Open Task Manager / Activity Monitor
- Should be < 10% during simulation

### Memory
- Open DevTools → Memory tab
- Should increase < 5MB during simulation

### Network
- Open DevTools → Network tab
- Should see no new requests during simulation

---

## Quick Commands

```bash
# Check backend
curl http://localhost:3000/health

# Check frontend
curl http://localhost:5173

# Restart backend
cd backend && npm run dev

# Restart frontend
cd frontend && npm run dev

# Hard refresh browser
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

---

## Ready for Demo?

If all checks pass:
- ✅ Feature is working
- ✅ Ready to present
- ✅ Practice demo script
- ✅ You're good to go!

**Time to win! 🏆**


---

## Stress Testing

For comprehensive stress testing, see **[STRESS_TEST_GUIDE.md](STRESS_TEST_GUIDE.md)**

### Quick Stress Tests

**1. Large File Test**
```bash
# Create 10x larger file (3,880 rows)
cd backend
head -1 demo_enhanced.csv > large_test.csv
for i in {1..10}; do tail -n +2 demo_enhanced.csv >> large_test.csv; done
```
Upload `large_test.csv` and verify it processes successfully.

**2. Rapid Upload Test**
- Upload `demo_enhanced.csv`
- Wait 2 seconds
- Upload again
- Repeat 5 times
- Check: No errors, memory stable

**3. Multiple Simulations**
- Start simulation
- Wait for completion
- Start again immediately
- Repeat 5 times
- Check: No memory leaks

**4. Concurrent Users**
- Open 3 browser tabs
- Upload data in each
- Start simulation in all 3
- Check: All work independently

**5. Memory Leak Test**
- Open DevTools → Memory
- Take snapshot
- Run simulation 5 times
- Take snapshot again
- Check: Memory increase < 10MB

### Automated Test Runner

```bash
cd backend
node test-runner.js
```

Tests:
- ✅ Demo data exists
- ✅ Modules installed
- ✅ Source files present
- ✅ Environment configured
- ✅ CSV parsing
- ✅ DSU algorithm
- ✅ MinHeap
- ✅ Scoring logic

---

**Ready to test!** 🚀
