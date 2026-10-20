# 🔧 ORUS BUILDER - PROVIDER SETUP GUIDE
## Configuring AI Providers (Groq, Perplexity, Claude, OpenAI)

> Referência histórica de provedores escrita em 2025. O fluxo validado atual aceita Groq e Perplexity; Claude e OpenAI não são capacidades públicas ativas. Modelos, preços e disponibilidade pertencem aos provedores e podem mudar. Use `backend/.env.example` como contrato de configuração e confirme o modelo disponível na sua conta antes de iniciar o Builder.

**Version:** 1.0  
**Date:** 2025-10-26  
**Status:** histórico; Groq e Perplexity são os adaptadores ativos

---

## 📋 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Provider Comparison](#provider-comparison)
3. [Environment Setup](#environment-setup)
4. [Per-Provider Configuration](#per-provider-configuration)
5. [Switching Providers](#switching-providers)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Setup](#advanced-setup)

---

## QUICK START

### The Simplest Way: One Environment Variable

**STEP 1:** Edit `.env` file in your backend root:
```bash
# .env
AI_PROVIDER=perplexity
PERPLEXITY_API_KEY=your-key-here
```

**STEP 2:** Restart backend server:
```bash
npm run dev
```

**That's it!** 🎉 Your provider is now active.

---

## PROVIDER COMPARISON

| Provider | Best For | Speed | Cost | Model | Status |
|----------|----------|-------|------|-------|--------|
| **Groq** | Ultra-fast inference | ⚡⚡⚡ | 💰 | Llama 3.3 70B | ✅ Active |
| **Perplexity** | Web-aware, real-time | ⚡⚡ | 💰💰 | Sonar (1M tokens) | ✅ Active |
| **Claude** | Complex reasoning | ⚡⚡⚡ | 💰💰💰 | Claude 3.5 | ⏳ Coming Soon |
| **OpenAI** | General purpose | ⚡⚡ | 💰💰💰 | GPT-4o | ⏳ Coming Soon |

---

## ENVIRONMENT SETUP

### Step 1: Create `.env` File

```bash
# backend/.env

# ═══════════════════════════════════════════
# AI PROVIDER SELECTION (Required)
# ═══════════════════════════════════════════

# Choose ONE: groq, perplexity, claude, openai
AI_PROVIDER=perplexity

# ═══════════════════════════════════════════
# GROQ CONFIGURATION
# ═══════════════════════════════════════════

GROQ_API_KEY=your-groq-api-key-here
# Get key from: https://console.groq.com

# ═══════════════════════════════════════════
# PERPLEXITY CONFIGURATION
# ═══════════════════════════════════════════

PERPLEXITY_API_KEY=your-perplexity-api-key-here
PERPLEXITY_MODEL=llama-3.1-sonar-large-128k-online
# Get key from: https://www.perplexity.ai/api

# ═══════════════════════════════════════════
# CLAUDE CONFIGURATION (Future)
# ═══════════════════════════════════════════

CLAUDE_API_KEY=your-claude-api-key-here
CLAUDE_MODEL=claude-3-5-sonnet-20241022
# Get key from: https://console.anthropic.com

# ═══════════════════════════════════════════
# OPENAI CONFIGURATION (Future)
# ═══════════════════════════════════════════

OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o
# Get key from: https://platform.openai.com

# ═══════════════════════════════════════════
# SERVER CONFIGURATION
# ═══════════════════════════════════════════

PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/orus_builder
```

### Step 2: Load Environment

```bash
# The server automatically loads .env on startup
npm run dev
```

---

## PER-PROVIDER CONFIGURATION

### 🤖 GROQ - Fastest & Cheapest

**Why use Groq?**
- ✅ Ultra-fast response times (best for real-time generation)
- ✅ Most affordable
- ✅ Great for prototyping and testing
- ✅ Excellent model quality (Llama 3.3 70B)

**Setup:**

1. **Get API Key:**
   ```
   1. Go to https://console.groq.com
   2. Sign up free
   3. Create new API key
   4. Copy to clipboard
   ```

2. **Configure `.env`:**
   ```bash
   AI_PROVIDER=groq
    GROQ_API_KEY=replace-with-your-groq-key
   ```

3. **Available Models:**
   - `llama-3.3-70b-versatile` (default, recommended)
   - `mixtral-8x7b-32768`
   - `gemma-7b-it`

4. **Example Usage:**
   ```typescript
   // Backend will automatically use GroqAIProvider
   const provider = AIProviderFactory.getProvider();
   const response = await provider.chat([
     { role: 'user', content: 'Create a React button' }
   ]);
   ```

**Performance:**
- Response time: ~0.5-2 seconds
- Cost: Very affordable (~$0.0001 per 1K tokens)
- Best for: MVP, testing, rapid iteration

---

### 🔮 PERPLEXITY - Web-Aware & Real-Time

**Why use Perplexity?**
- ✅ Real-time web information integration
- ✅ 1M context window (see entire codebases)
- ✅ Great for research-heavy generation
- ✅ Excellent for updates to latest tech

**Setup:**

1. **Get API Key:**
   ```
   1. Go to https://www.perplexity.ai/api
   2. Sign up / Login
   3. Navigate to API keys section
   4. Create new key
   5. Copy to clipboard
   ```

2. **Configure `.env`:**
   ```bash
   AI_PROVIDER=perplexity
   PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   PERPLEXITY_MODEL=llama-3.1-sonar-large-128k-online
   ```

3. **Available Models:**
   - `llama-3.1-sonar-large-128k-online` (default, web-aware)
   - `llama-3.1-sonar-small-128k-online` (faster)
   - `llama-3.1-sonar-large-128k-chat`
   - `llama-3.1-sonar-small-128k-chat`

4. **Example Usage:**
   ```typescript
   // Backend will use PerplexityProvider
   const provider = AIProviderFactory.getProvider();
   const response = await provider.chat([
     { role: 'user', content: 'Generate React component with latest best practices' }
   ]);
   // Will include latest web knowledge!
   ```

**Performance:**
- Response time: ~2-5 seconds (includes web search)
- Cost: Moderate (~$0.0005 per 1K tokens)
- Best for: Production apps, research-heavy tasks

**⚠️ Default Provider:**
If you don't specify `AI_PROVIDER`, Perplexity is the fallback:
```typescript
// In ai-provider-factory.ts
default:
  return this.createProvider('perplexity');
```

---

### 🤖 CLAUDE - Complex Reasoning (Coming Soon)

**Why use Claude?**
- ✅ Best at complex reasoning and code quality
- ✅ Excellent at understanding nuanced requirements
- ✅ Great safety and alignment
- ✅ Good for enterprise use cases

**Planned Setup:**

```bash
AI_PROVIDER=claude
 CLAUDE_API_KEY=replace-with-your-claude-key
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

**Status:** Implementation in progress
**ETA:** v3.1

---

### 🤖 OPENAI - General Purpose (Coming Soon)

**Why use OpenAI?**
- ✅ Most widely adopted
- ✅ Best at following complex instructions
- ✅ GPT-4o with vision capabilities
- ✅ Large user community

**Planned Setup:**

```bash
AI_PROVIDER=openai
 OPENAI_API_KEY=replace-with-your-openai-key
OPENAI_MODEL=gpt-4o
```

**Status:** Implementation planned
**ETA:** v3.2

---

## SWITCHING PROVIDERS

### Method 1: Edit `.env` File (Recommended)

```bash
# .env
AI_PROVIDER=perplexity  # Change this line
PERPLEXITY_API_KEY=...
```

Then restart:
```bash
npm run dev
```

### Method 2: Runtime Switch (Advanced)

```typescript
// In your code
import { AIProviderFactory, AIProviderType } from './trinity/ai-provider-factory';

// Switch provider at runtime
AIProviderFactory.switchProvider(AIProviderType.GROQ);

// Or with string
AIProviderFactory.switchProvider('perplexity' as any);

// Use the provider
const provider = AIProviderFactory.getProvider();
const response = await provider.chat([...]);
```

### Method 3: Environment Variable at Startup

```bash
# Linux/Mac
AI_PROVIDER=groq npm run dev

# Windows (PowerShell)
$env:AI_PROVIDER="groq"; npm run dev

# Windows (CMD)
set AI_PROVIDER=groq && npm run dev
```

---

## TROUBLESHOOTING

### ❌ "API_KEY not found in environment variables"

**Problem:** Provider can't find API key

**Solution:**
1. Check `.env` file exists
2. Verify key name matches exactly (case-sensitive):
   - `GROQ_API_KEY` (not `Groq_Api_Key`)
   - `PERPLEXITY_API_KEY`
   - `CLAUDE_API_KEY`
3. Restart server: `npm run dev`

**Debug:**
```bash
# Check if .env is being loaded
cat .env | grep AI_PROVIDER
```

---

### ❌ "Unknown provider type"

**Problem:** `AI_PROVIDER` value not recognized

**Solution:**
Valid options:
```bash
AI_PROVIDER=groq       # ✅ Correct
AI_PROVIDER=perplexity # ✅ Correct
AI_PROVIDER=claude     # ⏳ Coming Soon
AI_PROVIDER=openai     # ⏳ Coming Soon
AI_PROVIDER=GROQ       # ❌ Wrong (case-sensitive)
```

**Fix:** Edit `.env` and use lowercase

---

### ❌ "Generation failed / No response"

**Problem:** Provider returns error

**Solution:**

1. **Check API key validity:**
   ```bash
   # For Groq
   curl -H "Authorization: Bearer YOUR_KEY" https://api.groq.com/health
   
   # For Perplexity
   curl -X POST https://api.perplexity.ai/chat/completions \
     -H "Authorization: Bearer YOUR_KEY"
   ```

2. **Check rate limits:**
   - Groq: Free tier ~30 requests/minute
   - Perplexity: Varies by plan
   - Check provider dashboard for limits

3. **Check network:**
   - Ensure backend can reach provider APIs
   - Check firewall/proxy settings
   - Test: `curl https://api.groq.com` (or provider URL)

---

### ❌ "Provider not implemented"

**Problem:** Trying to use Claude/OpenAI (not yet implemented)

**Error Message:**
```
Claude provider not implemented yet. Use GROQ for now.
```

**Solution:**
- Use `groq` or `perplexity` for now
- Claude/OpenAI coming in v3.1+
- Or contribute implementation! 🚀

---

### ⚠️ "Slow generation"

**Problem:** Generation taking too long (>30 seconds)

**Troubleshooting:**

1. **Check Provider:**
   - Groq: Very fast (shouldn't be slow)
   - Perplexity: Includes web search, slower
   - Try switching to Groq for speed

2. **Check Network:**
   - Internet connection slow?
   - Try with simpler prompt

3. **Check Prompt:**
   - Very complex prompt = slower
   - Break into smaller requests

4. **Rate Limiting:**
   - Are you hitting rate limits?
   - Wait a minute and retry
   - Upgrade plan if consistent

---

## ADVANCED SETUP

### Multi-Provider Fallback

**Scenario:** Use Groq by default, fallback to Perplexity if Groq fails

**Implementation:**

```typescript
// backend/src/middleware/provider-fallback.ts
export async function executeWithFallback(
  callback: (provider: IAIProvider) => Promise<any>
) {
  const primaryProvider = process.env.AI_PROVIDER || 'groq';
  const fallbackProvider = 'perplexity';

  try {
    const provider = AIProviderFactory.getProvider();
    return await callback(provider);
  } catch (error) {
    logger.warn(`Primary provider (${primaryProvider}) failed, trying fallback`);
    
    AIProviderFactory.switchProvider(fallbackProvider as any);
    const fallback = AIProviderFactory.getProvider();
    return await callback(fallback);
  }
}

// Usage:
const response = await executeWithFallback((provider) =>
  provider.chat([{ role: 'user', content: 'Create a button' }])
);
```

---

### Custom Provider Implementation

**To add your own provider (e.g., LLaMA local):**

1. **Create Provider Class:**
```typescript
// backend/src/trinity/custom-provider.ts
import { IAIProvider, AIMessage, AIResponse } from './ai-provider-factory';

export class CustomAIProvider implements IAIProvider {
  async chat(messages: AIMessage[]): Promise<AIResponse> {
    // Your implementation
  }

  async analyze(prompt: string): Promise<any> {
    // Your implementation
  }

  async generateJson<T>(prompt: string): Promise<T> {
    // Your implementation
  }
}
```

2. **Register in Factory:**
```typescript
// In AIProviderFactory.createProvider()
case 'custom':
  return new CustomAIProvider();
```

3. **Use:**
```bash
AI_PROVIDER=custom npm run dev
```

---

### Performance Optimization

**Caching Results:**

```typescript
// Use Redis or in-memory cache
const generateCode = async (prompt: string) => {
  const cacheKey = hash(prompt);
  
  // Check cache first
  const cached = await cache.get(cacheKey);
  if (cached) return cached;
  
  // Generate if not cached
  const provider = AIProviderFactory.getProvider();
  const result = await provider.generateCode({ prompt });
  
  // Store in cache (1 hour TTL)
  await cache.set(cacheKey, result, { ttl: 3600 });
  
  return result;
};
```

---

### Cost Optimization

**Tips:**

1. **Use Groq for development**
   - Free, fast, perfect for testing
   - Switch to Perplexity for production

2. **Batch requests**
   - Group multiple generations into one request
   - Reduces overhead

3. **Cache aggressively**
   - Same prompt = cached result
   - Saves API calls

4. **Monitor usage**
   ```bash
   # Check provider dashboard regularly
   # Groq: https://console.groq.com/usage
   # Perplexity: https://www.perplexity.ai/settings/api
   ```

---

## ENVIRONMENT VARIABLE REFERENCE

### Complete Reference

```bash
# REQUIRED
AI_PROVIDER=groq|perplexity|claude|openai

# GROQ (if AI_PROVIDER=groq)
GROQ_API_KEY=required
# GROQ_MODEL=optional (default: llama-3.3-70b-versatile)

# PERPLEXITY (if AI_PROVIDER=perplexity)
PERPLEXITY_API_KEY=required
# PERPLEXITY_MODEL=optional (default: llama-3.1-sonar-large-128k-online)

# CLAUDE (if AI_PROVIDER=claude) - Coming Soon
CLAUDE_API_KEY=required
# CLAUDE_MODEL=optional (default: claude-3-5-sonnet-20241022)

# OPENAI (if AI_PROVIDER=openai) - Coming Soon
OPENAI_API_KEY=required
# OPENAI_MODEL=optional (default: gpt-4o)
```

---

## GETTING API KEYS

### Groq
```
1. Visit: https://console.groq.com
2. Sign up with Google/GitHub/Email
3. Go to "API Keys" section
4. Create new key
5. Copy and paste to .env
6. Test: Use immediately (free tier includes generous quotas)
```

### Perplexity
```
1. Visit: https://www.perplexity.ai/api
2. Sign up / Login
3. Go to API section
4. Create API token
5. Copy and paste to .env
6. Test: Query limit ~600/day on free tier
```

### Claude (Future)
```
1. Visit: https://console.anthropic.com
2. Sign up with email
3. Go to "API Keys"
4. Create new key
5. Copy and paste to .env
6. Add payment method for production use
```

### OpenAI (Future)
```
1. Visit: https://platform.openai.com
2. Sign up / Login
3. Go to API Keys section
4. Create new secret key
5. Copy and paste to .env
6. Add payment method for production use
```

---

## BEST PRACTICES

### ✅ DO:
- Use `.gitignore` to exclude `.env` files
- Rotate API keys regularly
- Use separate keys for dev/staging/prod
- Monitor API usage and costs
- Set up alerts for unusual usage

### ❌ DON'T:
- Commit `.env` to version control
- Share API keys in Slack/email
- Use same key for multiple environments
- Hardcode keys in source code
- Leave `.env` with test keys

---

## QUICK REFERENCE

### One-Liner Setup

```bash
# Groq (fastest & cheapest)
echo "AI_PROVIDER=groq" >> .env && \
echo "GROQ_API_KEY=YOUR_KEY" >> .env && \
npm run dev

# Perplexity (web-aware)
echo "AI_PROVIDER=perplexity" >> .env && \
echo "PERPLEXITY_API_KEY=YOUR_KEY" >> .env && \
npm run dev
```

---

## SUPPORT

- **Issues?** Create GitHub issue
- **Questions?** Join Discord community
- **Feedback?** Email: support@orusbuilder.dev

---

**Version:** 1.0  
**Last Updated:** 2025-10-26  
**Status:** Production Ready  
**License:** MIT
