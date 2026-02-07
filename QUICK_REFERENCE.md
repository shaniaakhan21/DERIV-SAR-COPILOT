# 🚀 Quick Reference Card

## ⚡ Get Started in 2 Minutes

### 1. Get API Key
👉 https://platform.openai.com/api-keys

### 2. Add Key to Environment
```bash
# Edit this file:
backend/src/.env

# Replace this line:
OPENAI_API_KEY=your_openai_api_key_here

# With your actual key:
OPENAI_API_KEY=sk-abc123xyz...
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
| **Quick Start** | [QUICKSTART.md](./QUICKSTART.md) |
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

## 🤖 OpenAI Models

```env
# Recommended (fast & affordable)
OPENAI_MODEL=gpt-4o-mini

# Best quality
OPENAI_MODEL=gpt-4o

# Excellent quality
OPENAI_MODEL=gpt-4-turbo

# Fastest & cheapest
OPENAI_MODEL=gpt-3.5-turbo
```

---

## ❌ Troubleshooting

### "API key not valid"
- Check `backend/src/.env` has your actual key
- Key should start with `sk-`
- Restart backend after changing .env

### "Model not found"
- Use valid OpenAI model name
- Check: https://platform.openai.com/docs/models

### SAR generation slow
- Switch to faster model: `gpt-4o-mini`
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
✅ SAR generation (OpenAI GPT-4)  
✅ Real-time simulation  
✅ Dashboard + metrics  
✅ Case detail + network graphs  

---

## 📞 Support

- **OpenAI Docs**: https://platform.openai.com/docs
- **Models**: https://platform.openai.com/docs/models
- **API Keys**: https://platform.openai.com/api-keys

---

**Next Step**: Get your API key! 👉 https://platform.openai.com/api-keys
