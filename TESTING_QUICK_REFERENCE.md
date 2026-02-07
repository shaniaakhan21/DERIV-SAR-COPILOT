# 🎯 Testing Quick Reference

## 1-Minute Test

```bash
# Run automated tests
cd backend && node test-runner.js

# Start servers
npm run dev                    # Terminal 1 (backend)
cd ../frontend && npm run dev  # Terminal 2 (frontend)

# Open browser
http://localhost:5173

# Upload & test
1. Upload backend/demo_enhanced.csv
2. Click "▶️ Start Live Demo"
3. Watch for 45 seconds
4. ✅ Success if no errors
```

---

## Test Types

### 🤖 Automated Tests
```bash
cd backend
node test-runner.js
```
**Time:** 5 seconds  
**Checks:** 8 critical components

### 🎬 Live Demo Test
```bash
1. Upload CSV
2. Start simulation
3. Watch completion
```
**Time:** 2 minutes  
**Checks:** UI, notifications, activity feed

### 🔥 Stress Test
```bash
1. Large file (3,880 rows)
2. Rapid uploads (5x)
3. Multiple simulations (5x)
4. Concurrent users (3 tabs)
5. Memory leak check
```
**Time:** 10 minutes  
**Checks:** Performance, stability, memory

---

## Quick Commands

### Automated Tests
```bash
cd backend
node test-runner.js
```

### Start Backend
```bash
cd backend
npm run dev
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Generate Large Test File
```bash
cd backend
head -1 demo_enhanced.csv > large_test.csv
for i in {1..10}; do tail -n +2 demo_enhanced.csv >> large_test.csv; done
```

### Check Backend Health
```bash
curl http://localhost:3000/health
```

### Check Frontend
```bash
curl http://localhost:5173
```

---

## What to Check

### ✅ Must Work
- [ ] Upload CSV
- [ ] Cases table appears
- [ ] Start simulation button
- [ ] Simulation completes
- [ ] No console errors

### ⚠️ Should Work
- [ ] Notifications appear
- [ ] Activity feed updates
- [ ] Progress bar smooth
- [ ] Memory < 200MB
- [ ] CPU < 20%

### 🎯 Nice to Have
- [ ] Fast upload (< 3s)
- [ ] Smooth animations
- [ ] No lag
- [ ] Works on mobile
- [ ] Works in all browsers

---

## Common Issues

### Upload fails
```bash
# Check backend running
curl http://localhost:3000/health

# Restart backend
cd backend && npm run dev
```

### Simulation won't start
```bash
# Check console (F12)
# Refresh page (Ctrl+R)
# Upload data again
```

### Memory high
```bash
# Refresh page
# Close other tabs
# Restart browser
```

### Backend slow
```bash
# Check CPU usage
# Restart backend
# Use smaller file
```

---

## Performance Targets

| Metric | Target | Max |
|--------|--------|-----|
| Upload time | < 2s | < 5s |
| Processing | < 1s | < 3s |
| Dashboard load | < 500ms | < 1s |
| Memory | < 100MB | < 200MB |
| CPU | < 10% | < 20% |

---

## Test Checklist

### Before Demo
```
□ Run test-runner.js (all pass)
□ Upload demo_enhanced.csv (works)
□ Start simulation (completes)
□ Check console (no errors)
□ Check memory (< 200MB)
```

### During Demo
```
□ Backend running
□ Frontend running
□ Browser ready
□ CSV file ready
□ Console clean
```

### After Demo
```
□ All features worked
□ No crashes
□ No errors
□ Good performance
```

---

## Emergency Fixes

### App crashed
```
1. Refresh browser (Ctrl+R)
2. If broken, restart backend
3. If still broken, restart both
```

### Simulation frozen
```
1. Check console
2. Refresh page
3. Upload again
4. Try again
```

### Backend error
```
1. Check terminal
2. Restart: npm run dev
3. Check .env file
4. Check port 3000 free
```

---

## Test Results

### ✅ PASS
- All automated tests pass
- Upload works
- Simulation completes
- No errors
- Good performance

### ⚠️ WARNING
- Some warnings
- Slow but works
- High memory but stable
- Minor glitches

### ❌ FAIL
- Tests fail
- Cannot upload
- Simulation broken
- Crashes
- Unusable

---

## Quick Links

- **Full Testing Guide:** [HOW_TO_TEST.md](HOW_TO_TEST.md)
- **Stress Testing:** [STRESS_TEST_GUIDE.md](STRESS_TEST_GUIDE.md)
- **Demo Script:** [DEMO_SCRIPT.md](DEMO_SCRIPT.md)
- **Quick Start:** [QUICKSTART.md](QUICKSTART.md)

---

**Test fast, demo confidently!** 🚀
