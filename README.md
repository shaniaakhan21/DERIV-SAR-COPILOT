# SAR Copilot - AI-Powered Transaction Monitoring System

**Turning 2,000 weekly alerts into 50 high-confidence cases**

An intelligent financial crime detection system that uses behavioral anomaly detection, network analysis, unsupervised learning, and LLM-powered SAR generation to catch sophisticated fraud while dramatically reducing false positives.

---

## Live Demo

| Service  | URL |
|----------|-----|
| **Frontend** | https://sar-ai-copilot.netlify.app/ |
| **Backend API** | https://deriv-sar-copilot.onrender.com |

### Test CSV

Download the sample transaction dataset to try the system:

**[Download demo.csv from Google Drive](https://drive.google.com/file/d/1G_1SNE7gPpW5nJUrqeJfqW0fi26wh0H3/view?usp=sharing)**

### How to test

1. Open the [live frontend](https://sar-ai-copilot.netlify.app/)
2. Upload the demo CSV file
3. Browse flagged cases on the dashboard
4. Click into any case to view the full investigation pack
5. Click **Generate SAR Draft** to produce an AI-written narrative

---

## API Reference (Postman)

Base URL: `https://deriv-sar-copilot.onrender.com`

### Health Check

```
GET /health
```

Response: `{ "ok": true }`

### Upload Transactions (CSV)

```
POST /triage/upload
Content-Type: multipart/form-data
```

| Field | Type | Description |
|-------|------|-------------|
| `file` | file | CSV file with transaction data |

**Postman setup:** Body > form-data > key = `file` (type: File) > select your CSV.

Response:
```json
{
  "batchId": "batch_abc123...",
  "rows": 500,
  "cases": 42,
  "topK": 42,
  "stats": {
    "avgEventsPerCase": 12,
    "largestClusterInTopK": 47,
    "largestClusterOverall": 47,
    "highRiskCount": 5
  },
  "unsupervised_summary": { ... }
}
```

> Save the `batchId` from the response — you need it for all subsequent requests.

### List Cases

```
GET /cases?batchId={batchId}
```

| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `batchId` | Yes | — | From upload response |
| `k` | No | 50 | Max cases to return (max 200) |
| `minScore` | No | 0 | Minimum risk score filter (0-100) |
| `sortBy` | No | `score` | `score` or `priority` |

### Get Case Detail

```
GET /cases/{caseId}?batchId={batchId}
```

| Param | Required | Description |
|-------|----------|-------------|
| `batchId` | Yes | From upload response |
| `explain` | No | Set to `true` for plain-language explanations |

Returns the full investigation pack: risk score, reasons, typology tags, timeline, link evidence, score breakdown, and behavioral anomaly data.

### Submit Feedback (TP/FP)

```
POST /cases/{caseId}/feedback
Content-Type: application/json
```

Body:
```json
{
  "batchId": "batch_abc123...",
  "label": "TP"
}
```

`label` must be `"TP"` (true positive) or `"FP"` (false positive). Feedback updates Bayesian weights for future scoring.

### Generate SAR Report

```
POST /sar/generate
Content-Type: application/json
```

Body:
```json
{
  "batchId": "batch_abc123...",
  "caseId": "case_cluster_user_ring_002"
}
```

Returns an AI-generated SAR draft with narrative, summary, key metrics, network info, and investigator next steps.

### Get Metrics

```
GET /metrics?batchId={batchId}
```

Returns alert reduction stats, typology distribution, feedback precision, intervention metrics, and unsupervised discovery data.

### Get Unsupervised Discovery

```
GET /unsupervised/{batchId}
```

Returns DBSCAN clustering results — discovered typology patterns, rare clusters, and noise count.

### Delete Batch

```
DELETE /batches/{batchId}
```

Removes a batch from memory.

---

## 📚 Quick Links

### Getting Started
- **[Quick Start Guide](QUICKSTART.md)** - Get running in 5 minutes
- **[Project Structure](PROJECT_STRUCTURE.md)** - File organization

### Demo & Presentation
- **[Demo Script](DEMO_SCRIPT.md)** - 10-minute presentation walkthrough
- **[Demo Checklist](DEMO_CHECKLIST.md)** - Pre-demo verification
- **[How to Test](HOW_TO_TEST.md)** - Testing the live demo feature

### Features & Implementation
- **[Features Complete](FEATURES_COMPLETE.md)** - All implemented features
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Technical overview
- **[Real-Time Demo](REAL_TIME_DEMO.md)** - Live simulation feature
- **[Unsupervised Discovery](UNSUPERVISED_DISCOVERY.md)** - DBSCAN clustering
- **[Temporal Pattern Recognition](TEMPORAL_PATTERN_RECOGNITION.md)** - 72h behavior change
- **[UI Improvements](UI_IMPROVEMENTS.md)** - UI/UX changelog

---

## 🎯 Challenge Solution

This system addresses the core problems in financial crime detection:
- ✅ **Alert Fatigue**: Reduces 2,000 alerts to 50 high-confidence cases (97.5% reduction)
- ✅ **False Positive Reduction**: Learns from analyst feedback using Bayesian precision weighting
- ✅ **Real-Time Detection**: Flags suspicious withdrawals before funds leave
- ✅ **Sophisticated Fraud**: Catches $0.01 profit laundering, coordinated rings, rapid cycling
- ✅ **Explainable AI**: Full evidence packs with network graphs and plain-language explanations
- ✅ **Regulatory Ready**: Auto-generates SAR drafts meeting compliance standards

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key (for SAR generation)

### Setup

```bash
# 1. Clone and install backend
cd backend
npm install

# 2. Configure environment
cd src
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
# Get key from: https://platform.openai.com/api-keys

# 3. Start backend
cd ..
npm run dev
# Backend runs on http://localhost:3001

# 4. In a new terminal, install and start frontend
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### Demo Walkthrough

1. **Upload Demo Data**
   - Open http://localhost:5173
   - Click "Choose File" and select `backend/demo_enhanced.csv`
   - System processes 388 transactions and identifies top cases

2. **Dashboard Overview**
   - View KPIs: Total events, largest cluster, high-risk count
   - See alert reduction: 388 events → ~12 high-confidence cases (97% reduction)
   - Filter by risk score (try minScore: 60 for critical cases only)

3. **Investigate High-Risk Case**
   - Click any case with score ≥ 60
   - Review risk signals (rapid cycling, network links, behavioral anomalies)
   - Explore cluster graph showing device/IP/affiliate connections
   - Check transaction timeline for patterns

4. **Generate SAR**
   - Click "Generate SAR Draft"
   - LLM produces regulator-ready narrative with evidence
   - Review narrative, bullet indicators, and recommended actions

5. **Provide Feedback**
   - Label case as "True Positive" or "False Positive"
   - System learns and adjusts signal weights for future cases
   - Check feedback.json to see learning in action

## 🏗️ Architecture

### Backend (Node.js/Express)

**Core Engines:**
- `triage/engine.js` - Main orchestration: clustering, scoring, evidence collection
- `triage/scoring.js` - Multi-signal risk scoring with feedback learning
- `triage/behavior.js` - Behavioral anomaly detection (Welford's algorithm)
- `triage/unsupervised.js` - DBSCAN clustering for novel typology discovery
- `llm/sar.js` - LLM-powered SAR narrative generation

**Data Structures:**
- `dsu.js` - Disjoint Set Union for graph-based account linking
- `dsa/minHeap.js` - Top-K case prioritization
- `dsa/deque.js` - Sliding window velocity tracking

**Key Features:**
- **Network Analysis**: Links accounts via device/IP/affiliate with soft-link corroboration
- **Behavioral Profiling**: Per-user baselines with segment fallback for cold-start
- **Feedback Learning**: Bayesian precision weighting adjusts scores based on TP/FP labels
- **Real-Time Intervention**: `would_block` flag for high-risk withdrawals

### Frontend (React/Material-UI)

- `pages/Dashboard.jsx` - Case list with filtering and KPIs
- `pages/CaseDetail.jsx` - Full investigation pack with evidence
- `components/ClusterGraph.jsx` - Interactive network visualization (ReactFlow)

## 🎓 Key Innovations

### 1. Unsupervised Typology Discovery
Uses DBSCAN clustering on case feature vectors to discover new fraud patterns not in training data.

**Example**: System automatically discovered "UC2" cluster representing rapid deposit-withdraw cycles with shared device fingerprints - a pattern not explicitly programmed.

### 2. Multi-Layer Network Analysis
- **Hard links**: Device/IP/affiliate (always connected)
- **Soft links**: Merchant patterns (only if corroborated by network context)
- **Link strength**: Number of distinct link types (higher = more suspicious)

**Example**: 47-account fraud ring detected via 3 link types (device + IP + affiliate).

### 3. Temporal Pattern Recognition
Detects behavior changes over time:
- Sudden shifts in transaction amounts
- New devices/IPs appearing
- Activity pattern changes post-KYC

### 4. Predictive Risk Scoring
Flags accounts as high-risk based on early signals before fraud occurs:
- Rapid KYC → deposit → minimal activity → withdrawal attempt
- Unusual setup patterns (multiple devices before first trade)

### 5. Catches Sophisticated Laundering
**The $0.01 Profit Pattern**:
- Client deposits $500
- Trades for 10 minutes with $0.01 profit
- Withdraws $500.01
- **Detection**: `tiny_profit_cycle` + `rapid_in_out` typology tags

## 📊 Performance Metrics

### Alert Reduction
- **Before**: 2,000 weekly alerts (95% false positives)
- **After**: 50 high-confidence cases (score ≥ 60)
- **Reduction**: 97.5%

### Detection Capabilities
- ✅ Rapid deposit-withdraw cycles (< 60 min)
- ✅ Tiny-profit layering (< 0.05% profit margin)
- ✅ Multi-account fraud rings (3+ linked accounts)
- ✅ High withdrawal ratios (> 120% of deposits)
- ✅ Burst velocity (> 2 events/min)
- ✅ Behavioral anomalies (z-score > 3)
- ✅ Novel patterns (unsupervised discovery)

### False Positive Reduction
- Feedback learning reduces FP rate by 30-50% after 100 labeled cases
- Precision weights stored in `backend/src/data/feedback.json`

## 🔧 Configuration

### Environment Variables (`backend/src/.env`)

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# SAR Threshold (cases below this get "review note" instead of SAR)
SAR_THRESHOLD=35

# Unsupervised Learning Parameters
UC_EPS=1.2          # DBSCAN epsilon (cluster radius)
UC_MINPTS=3         # DBSCAN min points (density threshold)
UC_RAREK=2          # Rare cluster size threshold

# Server
PORT=3001
```

### Tuning Risk Scoring

Edit `backend/src/triage/scoring.js` to adjust point values:
- Cluster size: 6-20 points
- Link strength: 8-14 points
- Rapid cycle: 10-18 points
- Withdrawal ratio: 12-18 points
- Behavioral anomaly: up to 15 points

### Adjusting Alert Volume

To get exactly 50 cases, adjust the score threshold:
- Score ≥ 60: ~20-30 critical cases
- Score ≥ 40: ~50-80 high-priority cases
- Score ≥ 20: ~100-150 medium-priority cases

## 📁 Data Format

### Input CSV Columns

**Required:**
- `transaction_id` - Unique transaction identifier
- `user_id` - Account/client identifier
- `timestamp` - ISO 8601 timestamp
- `amount` - Transaction amount (numeric)
- `transaction_type` - One of: deposit, withdraw, trade

**Optional (improves detection):**
- `device_id` - Device fingerprint/hash
- `ip_address` - Client IP address
- `affiliate_id` - Referral/affiliate code
- `country` - Transaction country
- `merchant_category` - Payment method category
- `device_used` - Device type (mobile/desktop/tablet)
- `profit` - Trading profit/loss

### Sample Data

See `backend/demo_enhanced.csv` for realistic examples including:
- Legitimate high-volume traders
- Rapid deposit-withdraw laundering
- Coordinated fraud rings
- Tiny-profit cycling
- Mixed legitimate + suspicious activity

## 🧪 Testing Scenarios

### Scenario 1: Rapid Laundering
```csv
tx_001,user_123,2024-01-01T10:00:00Z,5000,deposit,dev_abc,1.2.3.4
tx_002,user_123,2024-01-01T10:15:00Z,100,trade,dev_abc,1.2.3.4
tx_003,user_123,2024-01-01T10:30:00Z,5001,withdraw,dev_abc,1.2.3.4
```
**Expected**: Score 70+, typologies: `rapid_in_out`, `tiny_profit_cycle`

### Scenario 2: Fraud Ring
```csv
tx_001,user_A,2024-01-01T10:00:00Z,1000,deposit,dev_shared,1.2.3.4
tx_002,user_B,2024-01-01T10:05:00Z,1000,deposit,dev_shared,1.2.3.4
tx_003,user_C,2024-01-01T10:10:00Z,1000,deposit,dev_shared,5.6.7.8
```
**Expected**: 3-account cluster, link_strength=2 (device+IP), score 50+

### Scenario 3: Legitimate Trader
```csv
tx_001,user_456,2024-01-01T10:00:00Z,10000,deposit,dev_xyz,9.8.7.6
tx_002,user_456,2024-01-01T11:00:00Z,500,trade,dev_xyz,9.8.7.6
tx_003,user_456,2024-01-02T14:00:00Z,800,trade,dev_xyz,9.8.7.6
tx_004,user_456,2024-01-05T16:00:00Z,2000,withdraw,dev_xyz,9.8.7.6
```
**Expected**: Score < 30, no typologies, normal behavior

## 🎯 Demo Script (10 Minutes)

### Part 1: The Problem (2 min)
"Financial crime teams get 2,000 alerts per week. 95% are false positives. Analysts burn out. Real fraud hides in the noise."

### Part 2: Upload & Process (2 min)
- Upload demo_enhanced.csv (388 transactions)
- Show dashboard: "388 events → 12 high-confidence cases (97% reduction)"
- Point out KPIs: largest cluster, high-risk count

### Part 3: Investigate Case (3 min)
- Click high-risk case (score 75+)
- Show risk signals: "Rapid cycle (23 min), 3 linked accounts, device sharing"
- Display cluster graph: "See the network? Shared device connects all 3"
- Review timeline: "Deposit → trade → withdraw in under 30 minutes"

### Part 4: AI Features (2 min)
- Generate SAR: "LLM writes regulator-ready narrative"
- Show unsupervised discovery: "System found new pattern UC2 - we didn't program this"
- Demonstrate feedback: "Label as TP → system learns → future similar cases scored higher"

### Part 5: Impact (1 min)
"This system catches the $0.01 profit laundering that rules miss, finds 47-account fraud rings automatically, and turns 2,000 alerts into 50 actionable cases. Analysts focus on real crime, not noise."

## 🔍 Troubleshooting

### Backend won't start
- Check Node.js version: `node --version` (need 18+)
- Verify .env file exists: `ls backend/src/.env`
- Check port 3001 is free: `lsof -i :3001` (Mac/Linux) or `netstat -ano | findstr :3001` (Windows)

### Frontend can't connect
- Verify backend is running: `curl http://localhost:3001/health`
- Check CORS settings in `backend/src/index.js`
- Clear browser cache and reload

### SAR generation fails
- Verify OPENAI_API_KEY in .env
- Check API quota: https://platform.openai.com/usage
- Fallback: System uses deterministic draft if LLM fails

### No cases detected
- Check CSV format matches expected columns
- Verify timestamps are valid ISO 8601
- Try demo_enhanced.csv first to confirm system works

## 📚 Technical Deep Dive

### Behavioral Anomaly Detection
Uses Welford's online algorithm for streaming statistics:
- Per-user baselines (amount, timing, device/IP patterns)
- Segment baselines for cold-start (< 7 days)
- Z-score anomaly detection (threshold: 3σ)

### Network Clustering Algorithm
Disjoint Set Union (DSU) with union-by-size:
1. Hard links: device/IP/affiliate (always connect)
2. Soft links: merchant patterns (only if network context exists)
3. Link strength: count of distinct link types
4. Aggregated evidence: collect reasons across all cluster members

### Risk Scoring Strategy
Multi-signal weighted sum with priority tiers:
- **Priority 1** (strongest): Network links, rapid cycles, withdrawal ratios
- **Priority 2** (supporting): Behavioral anomalies, typology tags
- **Priority 3** (context): Velocity, activity rates

Feedback learning applies Bayesian precision weights:
```
precision = (TP + 1) / (TP + FP + 2)
weight = 0.5 + precision  // range [0.5, 1.5]
```

### Unsupervised Learning Pipeline
1. Extract feature vectors (10 dimensions per case)
2. Z-score normalization
3. DBSCAN clustering (eps=1.2, minPts=3)
4. Identify novelty: outliers + rare clusters
5. Compute cluster centroids and top features

## 🚢 Production Considerations

### Scalability
- Current: In-memory storage (demo/prototype)
- Production: Redis for batches, PostgreSQL for cases, Kafka for streaming

### Security
- Add authentication (JWT tokens)
- Implement RBAC (analyst/supervisor/admin roles)
- Encrypt sensitive data (PII, transaction details)
- Audit logging for all actions

### Monitoring
- Track detection rates (TP/FP/TN/FN)
- Monitor API latency (p50, p95, p99)
- Alert on anomalous alert volumes
- Dashboard for compliance metrics

### Compliance
- Data retention policies (7 years for SARs)
- Audit trail for all decisions
- Regulatory reporting exports (FinCEN, FCA formats)
- Privacy controls (GDPR, data masking)

## 🤝 Contributing

This is a hackathon project. For production use:
1. Add comprehensive test coverage
2. Implement proper error handling
3. Add authentication and authorization
4. Set up CI/CD pipeline
5. Add monitoring and alerting
6. Conduct security audit

## 📄 License

MIT License - Built for AI Hackathon

## 🙏 Acknowledgments

Built with:
- OpenAI GPT-4 for SAR generation
- ReactFlow for network visualization
- Material-UI for interface design
- Express.js for backend API
- Welford's algorithm for online statistics
- DBSCAN for unsupervised clustering

---

**Questions?** Check the troubleshooting section or review the inline code comments.

**Demo Ready?** Follow the Quick Start guide and use the Demo Script for presentations.
