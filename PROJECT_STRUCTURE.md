# 📁 Project Structure

## Root Directory

```
├── backend/                    # Node.js backend
├── frontend/                   # React frontend
├── README.md                   # Project overview
├── QUICKSTART.md              # Quick setup guide
├── DEMO_SCRIPT.md             # Presentation script
├── DEMO_CHECKLIST.md          # Pre-demo checklist
├── FEATURES_COMPLETE.md       # Feature completion status
├── IMPLEMENTATION_SUMMARY.md  # Technical summary
├── HOW_TO_TEST.md            # Testing guide
├── REAL_TIME_DEMO.md         # Real-time simulation docs
├── TEMPORAL_PATTERN_RECOGNITION.md  # Temporal feature docs
├── UNSUPERVISED_DISCOVERY.md # Unsupervised learning docs
└── UI_IMPROVEMENTS.md        # UI changelog
```

## Backend Structure

```
backend/
├── src/
│   ├── index.js              # Express server
│   ├── dsu.js                # Disjoint Set Union (network clustering)
│   ├── data/
│   │   └── feedback.json     # Feedback learning storage
│   ├── dsa/
│   │   ├── deque.js          # Deque data structure
│   │   └── minHeap.js        # MinHeap for top-K selection
│   ├── llm/
│   │   └── sar.js            # SAR generation with GPT-4
│   ├── triage/
│   │   ├── engine.js         # Main triage engine
│   │   ├── scoring.js        # Risk scoring logic
│   │   ├── behavior.js       # Behavioral anomaly detection
│   │   ├── priority.js       # Priority classification
│   │   ├── explainer.js      # Evidence collection
│   │   ├── predictive.js     # Predictive flagging
│   │   ├── unsupervised.js   # DBSCAN clustering
│   │   ├── feedbackStore.js  # Feedback learning
│   │   └── store.js          # In-memory storage
│   └── .env                  # Environment variables (OpenAI key)
├── scripts/
│   ├── generate_enhanced_demo.js  # Generate demo data
│   ├── test_temporal.js           # Test temporal features
│   └── test_unsupervised.js       # Test unsupervised features
├── demo_enhanced.csv         # Main demo data (388 rows)
├── package.json              # Dependencies
└── package-lock.json
```

## Frontend Structure

```
frontend/
├── src/
│   ├── main.jsx              # App entry point
│   ├── App.jsx               # Main app component
│   ├── api.js                # API client
│   ├── theme.js              # Material-UI theme
│   ├── index.css             # Global styles
│   ├── pages/
│   │   ├── Dashboard.jsx     # Main dashboard (with simulation)
│   │   ├── CaseDetail.jsx    # Case detail view
│   │   ├── Metrics.jsx       # Metrics dashboard
│   │   └── UnsupervisedDiscovery.jsx  # Unsupervised clusters
│   └── components/
│       └── ClusterGraph.jsx  # Network visualization
├── public/
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## Key Files

### Essential for Demo
- `backend/demo_enhanced.csv` - Demo data
- `backend/src/index.js` - Backend server
- `frontend/src/pages/Dashboard.jsx` - Main UI with simulation
- `DEMO_SCRIPT.md` - Presentation guide
- `QUICKSTART.md` - Setup instructions

### Documentation
- `README.md` - Project overview
- `FEATURES_COMPLETE.md` - Feature checklist
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- `HOW_TO_TEST.md` - Testing guide

### Feature-Specific Docs
- `REAL_TIME_DEMO.md` - Real-time simulation
- `TEMPORAL_PATTERN_RECOGNITION.md` - Temporal features
- `UNSUPERVISED_DISCOVERY.md` - Unsupervised learning
- `UI_IMPROVEMENTS.md` - UI changelog

## What Was Removed

### Redundant Documentation
- ❌ `VISUAL_GUIDE.md` - Merged into REAL_TIME_DEMO.md
- ❌ `WHATS_NEW.md` - Merged into REAL_TIME_DEMO.md
- ❌ `SIMULATION_COMPLETE.md` - Merged into REAL_TIME_DEMO.md
- ❌ `TEST_QUICK.md` - Merged into HOW_TO_TEST.md
- ❌ `TESTING_LIVE_DEMO.md` - Merged into HOW_TO_TEST.md
- ❌ `TRUE_REALTIME_OPTION.md` - Not needed for demo
- ❌ `test-simulation-console.js` - Not essential

### Redundant Data/Scripts
- ❌ `backend/demo.csv` - Old version
- ❌ `backend/synth.csv` - Synthetic data
- ❌ `backend/demo_from_synth.csv` - Converted data
- ❌ `backend/scripts/generate_demo.js` - Old script
- ❌ `backend/scripts/convert_synth_to_demo.js` - Not needed

## File Count Summary

**Before Cleanup:**
- Root MD files: 18
- CSV files: 4
- Scripts: 5

**After Cleanup:**
- Root MD files: 11 (39% reduction)
- CSV files: 1 (75% reduction)
- Scripts: 3 (40% reduction)

**Result:** Cleaner, more focused project structure! 🎯
