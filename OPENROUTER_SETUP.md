# 🚀 OpenRouter Setup Guide

## ✅ Migration Complete!

Your SAR Copilot now uses **OpenRouter** for LLM-powered SAR generation. OpenRouter gives you access to 100+ AI models through a single API!

---

## 🎯 Quick Setup (2 minutes)

### Step 1: Get Your FREE API Key

1. Go to: **https://openrouter.ai/keys**
2. Sign up (FREE - no credit card required for free models!)
3. Click "Create Key"
4. Copy your API key (starts with `sk-or-v1-...`)

### Step 2: Add Key to Environment File

1. Open: `backend/src/.env`
2. Find this line:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```
3. Replace `your_openrouter_api_key_here` with your actual key:
   ```
   OPENROUTER_API_KEY=sk-or-v1-abc123xyz...
   ```
4. Save the file

### Step 3: Start Backend

```bash
cd backend
npm run dev
```

That's it! Your SAR generation now uses OpenRouter! 🎉

---

## 🆓 FREE Models (No Credit Card Required)

Your `.env` is pre-configured with a FREE model:

```env
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

### Other FREE Options:

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| `meta-llama/llama-3.1-8b-instruct:free` | ⚡ Fast | ⭐⭐⭐⭐ | **Recommended** - Best balance |
| `google/gemini-flash-1.5` | ⚡⚡ Very Fast | ⭐⭐⭐⭐⭐ | High quality, fast |
| `mistralai/mistral-7b-instruct:free` | ⚡ Fast | ⭐⭐⭐ | Good quality |
| `qwen/qwen-2-7b-instruct:free` | ⚡⚡ Very Fast | ⭐⭐⭐ | Speed priority |

To switch models, just update `OPENROUTER_MODEL` in `.env`!

---

## 💳 Paid Models (Better Quality)

If you want premium quality, add credits to your OpenRouter account:

| Model | Cost/1M tokens | Quality | Best For |
|-------|----------------|---------|----------|
| `anthropic/claude-3.5-sonnet` | ~$3 | ⭐⭐⭐⭐⭐ | **Best quality** |
| `openai/gpt-4o` | ~$2.50 | ⭐⭐⭐⭐⭐ | Excellent |
| `google/gemini-pro-1.5` | ~$1.25 | ⭐⭐⭐⭐ | Great value |

---

## 🔧 Configuration Options

### SAR Threshold

Controls when to generate full SAR vs review note:

```env
SAR_THRESHOLD=35
```

- **Lower (20-30)**: More cases get full SAR
- **Higher (40-50)**: Only high-risk cases get full SAR
- **Recommended**: 35

### Model Selection

```env
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

Change this to any model from: https://openrouter.ai/models

---

## 🧪 Testing Your Setup

### Test 1: Check Environment

```bash
cd backend
npm run dev
```

Look for:
```
✅ OpenRouter API key loaded
✅ Model: meta-llama/llama-3.1-8b-instruct:free
```

### Test 2: Generate SAR

1. Start frontend: `cd frontend && npm run dev`
2. Open dashboard: http://localhost:5173
3. Click any high-risk case (score > 35)
4. Click "Generate SAR"
5. Wait 3-5 seconds
6. SAR should appear! ✅

---

## ❌ Troubleshooting

### Error: "API key not valid"

**Problem**: Invalid or missing API key

**Solution**:
1. Check `backend/src/.env` has your actual key
2. Key should start with `sk-or-v1-`
3. No quotes around the key
4. Restart backend after changing `.env`

### Error: "Model not found"

**Problem**: Invalid model name

**Solution**:
1. Check model name at: https://openrouter.ai/models
2. Use exact model ID (e.g., `meta-llama/llama-3.1-8b-instruct:free`)
3. For free models, include `:free` suffix

### Error: "Insufficient credits"

**Problem**: Trying to use paid model without credits

**Solution**:
1. Switch to FREE model in `.env`:
   ```env
   OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
   ```
2. OR add credits at: https://openrouter.ai/credits

### SAR Generation Takes Too Long

**Problem**: Slow model or network

**Solution**:
1. Switch to faster model:
   ```env
   OPENROUTER_MODEL=google/gemini-flash-1.5
   ```
2. Check internet connection
3. Try different model

---

## 🎨 Why OpenRouter?

### ✅ Advantages

- **100+ Models**: Access to all major LLMs through one API
- **FREE Options**: No credit card required for free models
- **Easy Switching**: Change models by editing one line
- **OpenAI Compatible**: Uses familiar OpenAI SDK
- **Competitive Pricing**: Often cheaper than direct APIs
- **No Vendor Lock-in**: Switch providers anytime

### 🔄 Migration from Gemini

We migrated from Google Gemini to OpenRouter because:

1. ✅ More model choices (100+ vs 1)
2. ✅ FREE models available (Gemini requires billing)
3. ✅ Easier to switch between providers
4. ✅ Better pricing for paid models
5. ✅ Single API for all LLMs

---

## 📚 Additional Resources

- **OpenRouter Docs**: https://openrouter.ai/docs
- **Model List**: https://openrouter.ai/models
- **API Keys**: https://openrouter.ai/keys
- **Pricing**: https://openrouter.ai/models (see cost per model)
- **Discord Support**: https://discord.gg/openrouter

---

## 🔐 Security Best Practices

1. ✅ Never commit `.env` files to git (already in `.gitignore`)
2. ✅ Use `.env.example` for sharing configuration templates
3. ✅ Rotate API keys periodically
4. ✅ Use separate keys for dev/prod environments
5. ✅ Monitor usage at: https://openrouter.ai/activity

---

## 📝 Summary

| Item | Status |
|------|--------|
| OpenRouter Package | ✅ Installed (`openai` v6.18.0) |
| Gemini Package | ✅ Removed |
| SAR Generation | ✅ Updated to OpenRouter |
| Environment Config | ✅ Ready (needs your API key) |
| FREE Model | ✅ Pre-configured |
| Documentation | ✅ Complete |

**Next Step**: Get your FREE API key from https://openrouter.ai/keys and add it to `backend/src/.env`!

---

**Need Help?** Check the troubleshooting section above or ask in the OpenRouter Discord!
