# 🚀 Quick Reference Card

## ⚡ Get Started in 2 Minutes

### 1. Get FREE API Key
👉 https://openrouter.ai/keys (no credit card!)

### 2. Add Key to Environment
```bash
# Edit this file:
backend/src/.env

# Replace this line:
OPENROUTER_API_KEY=your_openrouter_api_key_here

# With your actual key:
OPENROUTER_API_KEY=sk-or-v1-abc123xyz...
```

### 3. Start System
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 4. Test It
1. Open: http://localhost:5173
2. Upload: `backend/demo_enhanced.csv`
3. Click any high-risk case
4. Click "Generate SAR"
5. Wait 3-5 seconds
6. Done! ✅

---

## 📚 Documentation Quick Links

| Need | See |
|------|-----|
| **Setup LLM** | [OPENROUTER_SETUP.md](./OPENROUTER_SETUP.md) |
| **Quick Start** | [QUICKSTART.md](./QUICKSTART.md) |
| **Current Status** | [CURRENT_STATUS.md](./CURRENT_STATUS.md) |
| **All Features** | [FEATURES_COMPLETE.md](./FEATURES_COMPLETE.md) |
| **Testing** | [HOW_TO_TEST.md](./HOW_TO_TEST.md) |
| **Demo Script** | [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) |

---

## 🔧 Common Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Run tests
cd backend && node test-runner.js

# Check packages
cd backend && npm list

# View environment
cat backend/src/.env
```

---

## 🆓 FREE Models (No Credit Card)

```env
# Recommended (pre-configured)
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free

# Very fast, excellent quality
OPENROUTER_MODEL=google/gemini-flash-1.5

# Good quality
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
```

---

## ❌ Troubleshooting

### "API key not valid"
- Check `backend/src/.env` has your actual key
- Key should start with `sk-or-v1-`
- Restart backend after changing .env

### "Model not found"
- Use exact model ID from https://openrouter.ai/models
- For free models, include `:free` suffix

### SAR generation slow
- Switch to faster model: `google/gemini-flash-1.5`
- Check internet connection

---

## 📊 System Status

| Component | Status |
|-----------|--------|
| Backend | ✅ Ready |
| Frontend | ✅ Ready |
| LLM | ⚠️ Needs API key |
| Demo Data | ✅ Ready (388 rows) |
| Documentation | ✅ Complete |

---

## 🎯 What's Working

✅ Transaction monitoring (388 demo transactions)  
✅ Behavioral anomaly detection  
✅ Network clustering  
✅ Unsupervised learning (DBSCAN)  
✅ Risk scoring with feedback  
✅ SAR generation (OpenRouter)  
✅ Real-time simulation  
✅ Dashboard + metrics  
✅ Case detail + network graphs  

---

## 📞 Support

- **OpenRouter**: https://openrouter.ai/docs
- **Models**: https://openrouter.ai/models
- **Discord**: https://discord.gg/openrouter

---

**Next Step**: Get your FREE API key! 👉 https://openrouter.ai/keys
