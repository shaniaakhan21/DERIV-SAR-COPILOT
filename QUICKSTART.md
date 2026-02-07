# Quick Start Guide - SAR Copilot

Get up and running in 5 minutes.

## Prerequisites

- **Node.js 18+** and npm
- **OpenRouter API key** (FREE - for SAR generation)

## Installation

### 1. Clone or Download
```bash
# If you have the code, navigate to the project directory
cd sar-copilot
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment
```bash
# Copy the example environment file
cp src/.env.example src/.env

# Edit src/.env and add your OpenRouter API key
# Windows: notepad src/.env
# Mac/Linux: nano src/.env
```

**Required in `.env`:**
```bash
OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

**Get FREE API key:** https://openrouter.ai/keys (no credit card required!)

### 4. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## Running the Application

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```

You should see:
```
Backend running on http://localhost:3001
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```

You should see:
```
VITE ready in XXX ms
Local: http://localhost:5173
```

## First Demo

1. **Open Browser:** http://localhost:5173

2. **Upload Demo Data:**
   - Click "Choose File"
   - Select `backend/demo_enhanced.csv`
   - Wait 2-3 seconds for processing

3. **View Results:**
   - Dashboard shows ~73 cases from 388 transactions
   - High-risk cases (score ≥ 60) are at the top
   - Click any case to see full investigation pack

4. **Generate SAR:**
   - Click a high-risk case
   - Click "Generate SAR Draft"
   - LLM produces regulator-ready narrative

5. **Provide Feedback:**
   - Label case as "True Positive" or "False Positive"
   - System learns and adjusts future scores

6. **View Metrics:**
   - Click "Metrics" tab on dashboard
   - See alert reduction, learning status, typology distribution

## Troubleshooting

### Backend won't start
- **Check Node version:** `node --version` (need 18+)
- **Check port 3001:** Make sure nothing else is using it
- **Check .env file:** Verify OPENAI_API_KEY is set

### Frontend can't connect
- **Verify backend is running:** Visit http://localhost:3001/health
- **Should return:** `{"ok":true}`
- **Clear browser cache** and reload

### SAR generation fails
- **Check API key:** Verify OPENAI_API_KEY in backend/src/.env
- **Check API quota:** Visit https://platform.openai.com/usage
- **Fallback:** System uses deterministic draft if LLM fails

### No cases detected
- **Check CSV format:** Must have required columns (see README.md)
- **Try demo file first:** Use `backend/demo_enhanced.csv`
- **Check console:** Look for errors in terminal

## What's in the Demo Data?

`demo_enhanced.csv` contains 8 realistic fraud scenarios:

1. **$0.01 Profit Laundering** - Tiny profit cycling (critical)
2. **47-Account Fraud Ring** - Coordinated network (critical)
3. **Temporal Behavior Change** - Account takeover indicator (high risk)
4. **Predictive Early Warning** - Suspicious setup pattern (high risk)
5. **Legitimate Trader** - High-volume normal activity (low risk)
6. **Pass-Through Laundering** - 1:1 in/out ratio (critical)
7. **Burst Velocity** - Rapid transaction spike (high risk)
8. **Normal Users** - 20 accounts with routine activity (low risk)

**Total:** 388 transactions across 73 accounts

## Next Steps

- **Read the full README.md** for detailed documentation
- **Follow DEMO_SCRIPT.md** for presentation guidance
- **Upload your own CSV data** to test with real scenarios
- **Explore the Metrics tab** to see performance insights
- **Label 10+ cases** to activate feedback learning

## Need Help?

- **Check README.md** for comprehensive documentation
- **Review DEMO_SCRIPT.md** for usage examples
- **Check inline code comments** for technical details
- **Open an issue** if you find bugs

## Production Deployment

This is a **demo/prototype**. For production:

1. Add authentication (JWT tokens)
2. Implement RBAC (analyst/supervisor/admin)
3. Replace in-memory storage with Redis + PostgreSQL
4. Add monitoring and alerting
5. Conduct security audit
6. Set up CI/CD pipeline

See README.md "Production Considerations" section for details.

---

**Ready to demo?** Follow DEMO_SCRIPT.md for a 10-minute walkthrough!
