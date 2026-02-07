# Demo Checklist - SAR Copilot

Use this checklist to ensure everything is ready for your demo.

## ✅ Pre-Demo Setup (15 minutes before)

### Environment Setup
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] OpenAI API key ready

### Backend Setup
- [ ] Navigate to `backend/` directory
- [ ] Run `npm install` (if first time)
- [ ] Create `src/.env` from `src/.env.example`
- [ ] Add `OPENAI_API_KEY=sk-...` to `.env`
- [ ] Verify demo data exists: `demo_enhanced.csv`
- [ ] Start backend: `npm run dev`
- [ ] Verify backend running: Visit http://localhost:3001/health
- [ ] Should see: `{"ok":true}`

### Frontend Setup
- [ ] Navigate to `frontend/` directory (new terminal)
- [ ] Run `npm install` (if first time)
- [ ] Start frontend: `npm run dev`
- [ ] Verify frontend running: Visit http://localhost:5173
- [ ] Should see: SAR Copilot landing page

### Browser Setup
- [ ] Open Chrome/Firefox (recommended)
- [ ] Navigate to http://localhost:5173
- [ ] Open DevTools (F12) - optional but helpful
- [ ] Clear cache if needed (Ctrl+Shift+Delete)

### Demo Data Ready
- [ ] `backend/demo_enhanced.csv` exists
- [ ] File contains 388 transactions
- [ ] File includes 8 fraud scenarios

---

## 🎬 During Demo Checklist

### Part 1: The Problem (2 min)
- [ ] Explain alert fatigue problem
- [ ] Mention $0.01 profit laundering example
- [ ] State the goal: 2,000 → 50 reduction

### Part 2: Upload & Process (2 min)
- [ ] Click "Choose File"
- [ ] Select `demo_enhanced.csv`
- [ ] Wait for processing (2-3 seconds)
- [ ] Point out KPIs on dashboard
- [ ] Highlight alert reduction

### Part 3: Investigate Case (3 min)
- [ ] Click top high-risk case (score 75+)
- [ ] Show risk score gauge
- [ ] Walk through risk signals panel
- [ ] Expand cluster graph
- [ ] Show transaction timeline
- [ ] Open Investigation Pack accordion
- [ ] Highlight evidence signals

### Part 4: AI Features (2 min)
- [ ] Click "Generate SAR Draft"
- [ ] Show LLM-generated narrative
- [ ] Point out unsupervised discovery (if present)
- [ ] Click "True Positive" for feedback
- [ ] Navigate back to dashboard
- [ ] Switch to "Metrics" tab
- [ ] Walk through key metrics

### Part 5: Impact & Closing (1 min)
- [ ] Recap the 7 value points
- [ ] State the bottom line
- [ ] Open for questions

---

## 🔍 Demo Verification Points

### Before Starting
- [ ] Backend terminal shows "Backend running on http://localhost:3001"
- [ ] Frontend terminal shows "Local: http://localhost:5173"
- [ ] Browser shows SAR Copilot interface
- [ ] No console errors in DevTools

### After Upload
- [ ] Dashboard shows ~73 total cases
- [ ] High-risk count is 8-12 cases
- [ ] Largest cluster shows 47 accounts
- [ ] Cases table is populated

### In Case Detail
- [ ] Risk score gauge displays correctly
- [ ] Risk signals panel shows 5-7 signals
- [ ] Cluster graph renders with nodes/edges
- [ ] Timeline table shows transactions
- [ ] Investigation Pack sections expand

### SAR Generation
- [ ] Button changes to loading state
- [ ] Narrative appears within 5 seconds
- [ ] Narrative includes sections: Narrative, Indicators, Actions
- [ ] No error messages

### Metrics Tab
- [ ] All metric cards display values
- [ ] Alert reduction shows 97%+ reduction
- [ ] Charts/graphs render correctly
- [ ] No "N/A" or missing data

---

## 🚨 Troubleshooting During Demo

### Backend Not Responding
**Symptom:** Upload fails or cases don't load
**Fix:**
1. Check backend terminal for errors
2. Restart backend: Ctrl+C, then `npm run dev`
3. Verify http://localhost:3001/health returns `{"ok":true}`

### Frontend Not Loading
**Symptom:** Blank page or connection error
**Fix:**
1. Check frontend terminal for errors
2. Restart frontend: Ctrl+C, then `npm run dev`
3. Clear browser cache (Ctrl+Shift+Delete)
4. Hard reload (Ctrl+Shift+R)

### SAR Generation Fails
**Symptom:** Error message or no narrative
**Fix:**
1. Check OPENAI_API_KEY in backend/src/.env
2. Verify API quota at https://platform.openai.com/usage
3. Fallback: System uses deterministic draft (still works!)

### No Cases Detected
**Symptom:** "No cases found" message
**Fix:**
1. Verify demo_enhanced.csv is selected
2. Check backend terminal for parsing errors
3. Try uploading again
4. Restart backend if needed

### Cluster Graph Not Rendering
**Symptom:** Empty graph or "No graph data"
**Fix:**
1. Click a different case with cluster_size > 1
2. Refresh page (F5)
3. Check browser console for errors

---

## 📋 Key Talking Points

### Opening
- "Financial crime teams get 2,000 alerts per week. 95% are false positives."
- "Real fraud hides in the noise while analysts burn out."

### During Upload
- "System is clustering accounts, detecting anomalies, discovering patterns."
- "388 events → 12 high-confidence cases. 97% reduction."

### In Case Detail
- "Complete investigation pack in 30 seconds. No clicking through 5 systems."
- "47 accounts, 2 devices, 2 IPs. This is a coordinated fraud ring."

### SAR Generation
- "GPT-4 writes regulator-ready narrative. Minimal human editing required."

### Metrics
- "These metrics prove it works. We're catching fraud that rules miss."

### Closing
- "This solves the core problem: turns noise into signal."
- "Analysts focus on real crime, not false positives."

---

## 🎯 Success Criteria

### Demo is Successful If:
- [ ] System processes demo data without errors
- [ ] High-risk cases are clearly identified
- [ ] Cluster graph visualizes network connections
- [ ] SAR generation produces readable narrative
- [ ] Metrics show 97%+ alert reduction
- [ ] Audience understands the value proposition

### Bonus Points If:
- [ ] Show temporal behavior change case
- [ ] Show predictive early warning case
- [ ] Demonstrate feedback learning
- [ ] Explain unsupervised discovery
- [ ] Show fraud type prioritization
- [ ] Display plain-language explanations

---

## 📞 Emergency Contacts

### If Demo Fails Completely
**Backup Plan:**
1. Use screenshots/video recording (prepare beforehand)
2. Walk through code in IDE
3. Show architecture diagrams
4. Explain algorithms on whiteboard

### Technical Questions to Prepare For
- "How do you handle false positives?" → Feedback learning
- "What about new customers?" → Segment baselines
- "Can it find new fraud types?" → Unsupervised learning
- "How fast is it?" → Real-time, sub-second scoring
- "Does it explain decisions?" → Full evidence packs + plain language

---

## 📸 Screenshots to Prepare (Optional)

If demo environment fails, have these ready:
1. Dashboard with cases loaded
2. High-risk case detail with cluster graph
3. SAR generated narrative
4. Metrics dashboard showing reduction
5. Feedback learning in action

---

## ⏱️ Time Management

- **Part 1 (Problem):** 2 minutes - Don't go over!
- **Part 2 (Upload):** 2 minutes - Processing is fast
- **Part 3 (Investigate):** 3 minutes - Most important part
- **Part 4 (AI Features):** 2 minutes - Show the magic
- **Part 5 (Closing):** 1 minute - Strong finish
- **Total:** 10 minutes
- **Buffer:** 2-3 minutes for questions

---

## 🎓 Post-Demo Actions

### If Demo Goes Well
- [ ] Share GitHub repo link
- [ ] Offer to answer technical questions
- [ ] Provide contact information
- [ ] Mention production roadmap

### If Asked for Follow-Up
- [ ] Offer code walkthrough
- [ ] Discuss production deployment
- [ ] Explain scalability approach
- [ ] Share architecture diagrams

---

## ✨ Final Checks (5 minutes before)

- [ ] Backend running and healthy
- [ ] Frontend running and accessible
- [ ] Demo data file ready
- [ ] Browser open to http://localhost:5173
- [ ] DevTools closed (unless needed)
- [ ] Screen sharing ready (if virtual)
- [ ] Microphone tested (if virtual)
- [ ] Talking points memorized
- [ ] Water nearby (stay hydrated!)
- [ ] Confidence level: 100% 🚀

---

**You're ready! Go show them what AI-powered transaction monitoring looks like!** 🎉
