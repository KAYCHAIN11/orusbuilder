/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧬 AI PROVIDER FACTORY - UNIFIED AI INTERFACE (v1.1)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @developers Minerva Omega + Tulio
 * @created 2025-10-13T10:12:00-0300
 * @updated 2025-11-11T14:00:00-0300 (added generateCode support)
 * @componentHash orus.builder.trinity.ai-provider-factory.v1.1
 *
 * WHAT IT DOES:
 * Abstração unificada para trocar providers de IA (GROQ ↔ Claude ↔ OpenAI ↔ Perplexity)
 * em UM ÚNICO LUGAR. Todos engines usam esta interface, permitindo troca
 * de provider sem modificar código de cada engine.
 *
 * WHY IT EXISTS:
 * Evitar dependência direta de GROQ/Claude em 5+ engines. Facilita testes,
 * migração de providers, e suporte a múltiplos AIs simultaneamente.
 *
 * HOW IT WORKS:
 * Factory pattern + Adapter pattern. Define interface comum (IAIProvider)
 * e implementa adapters para cada provider (GROQ, Claude, etc).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import Groq from 'groq-sdk';
import { logger } from '../system/logging-system';
import { PerplexityProvider } from './perplexity-provider';
import { DeepSeekProvider } from './deepseek-provider';
// ═══════════════════════════════════════════════════════════════════════════
// 🎯 AI PROVIDER TYPES
// ═══════════════════════════════════════════════════════════════════════════

export enum AIProviderType {
  GROQ = 'groq',
  CLAUDE = 'claude',
  OPENAI = 'openai',
  GEMINI = 'gemini',
  PERPLEXITY = 'perplexity',
  DEEPSEEK = 'deepseek'
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIAnalysisResult {
  intent: {
    type: string;
    confidence: number;
  };
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  context: {
    domain: string;
    complexity: string;
    stylePreferences: string;
    colorPalette: string[];
    personality: string;
  };
}

export interface CodeGenerationResult {
  code: string;
  language: string;
  framework: string;
  metadata: any;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 AI PROVIDER INTERFACE (ABSTRAÇÃO)
// ═══════════════════════════════════════════════════════════════════════════

export interface IAIProvider {
  /**
   * Generate chat completion
   */
  chat(messages: AIMessage[], options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<AIResponse>;

  /**
   * Analyze prompt with structured output
   */
  analyze(prompt: string, analysisType: 'intent' | 'entity' | 'context'): Promise<AIAnalysisResult>;

  /**
   * Generate JSON response
   */
  generateJson<T>(prompt: string, schema: Record<string, any>): Promise<T>;

  /**
   * Generate code from prompt (NEW!)
   */
  generateCode(options: {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<CodeGenerationResult>;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🤖 GROQ ADAPTER IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export class GroqAIProvider implements IAIProvider {
  private client: Groq;
  private defaultModel = 'llama-3.3-70b-versatile';

  constructor() {
    const apiKey = process.env['GROQ_API_KEY'];
    if (!apiKey) {
      throw new Error('GROQ_API_KEY not found in environment variables');
    }

    this.client = new Groq({ apiKey });
    logger.info('✅ GROQ AI Provider initialized', {
      component: 'GroqAIProvider',
      metadata: { model: this.defaultModel }
    });
  }

  async chat(messages: AIMessage[], options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<AIResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: options?.model || this.defaultModel,
        messages: messages as any,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2000,
      });

      const choice = completion.choices[0];
      if (!choice) {
        throw new Error('No response from GROQ');
      }

      return {
        content: choice.message.content || '',
        model: completion.model,
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        }
      };
    } catch (error) {
      logger.error('GROQ chat error', error as Error, {
        component: 'GroqAIProvider'
      });
      throw error;
    }
  }

  async analyze(prompt: string, analysisType: 'intent' | 'entity' | 'context'): Promise<AIAnalysisResult> {
    const systemPrompt = this.getAnalysisSystemPrompt(analysisType);
    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.3,
      maxTokens: 1500
    });

    try {
      const parsed = JSON.parse(response.content);
      return parsed;
    } catch (error) {
      logger.error('Failed to parse GROQ analysis response', error as Error, {
        component: 'GroqAIProvider',
        metadata: { response: response.content }
      });

      // Fallback response
      return {
        intent: { type: 'CREATE_APP', confidence: 50 },
        entities: [],
        context: {
          domain: 'generic',
          complexity: 'standard',
          stylePreferences: 'modern',
          colorPalette: ['#007AFF', '#34C759'],
          personality: 'professional'
        }
      };
    }
  }

  async generateJson<T>(prompt: string, schema: Record<string, any>): Promise<T> {
    const response = await this.chat([
      {
        role: 'system',
        content: `You are a JSON generator. Generate ONLY valid JSON matching this schema: ${JSON.stringify(schema)}`
      },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.2,
      maxTokens: 2000
    });

    try {
      return JSON.parse(response.content) as T;
    } catch (error) {
      logger.error('Failed to parse JSON from GROQ', error as Error, {
        component: 'GroqAIProvider'
      });
      throw new Error('Invalid JSON response from AI', { cause: error });
    }
  }

  async generateCode(options: {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<CodeGenerationResult> {
    try {
      console.log('🤖 [GroqAIProvider] generateCode() CHAMADO');
      console.log('[GroqAIProvider] Prompt length:', options.prompt.length);
      console.log('[GroqAIProvider] MaxTokens:', options.maxTokens || 8000);
      console.log('[GroqAIProvider] Temperature:', options.temperature || 0.7);

      const response = await this.chat([
        {
          role: 'system',
          content: `You are an expert full-stack developer. Generate complete, production-ready code based on the user's requirements.

RULES:
1. Generate MULTIPLE files when appropriate (components, services, types, etc.)
2. Use modern best practices and design patterns
3. Include proper TypeScript types
4. Add helpful comments
5. Make code ready to run without modifications

Return the code in this format:

\`\`\`typescript
// src/ComponentName.tsx
[component code here]
\`\`\`

\`\`\`typescript
// src/types.ts
[types code here]
\`\`\`

Generate complete, working code NOW.`
        },
        {
          role: 'user',
          content: options.prompt
        }
      ], {
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 8000
      });

      const generatedCode = response.content;

      console.log('✅ [GroqAIProvider] Code generated successfully');
      console.log('[GroqAIProvider] Code length:', generatedCode.length);
      console.log('[GroqAIProvider] Tokens used:', response.usage?.totalTokens || 0);

      return {
        code: generatedCode,
        language: 'typescript',
        framework: 'react',
        metadata: {
          model: response.model,
          tokensUsed: response.usage?.totalTokens || 0,
          promptTokens: response.usage?.promptTokens || 0,
          completionTokens: response.usage?.completionTokens || 0
        }
      };
    } catch (error) {
      console.error('❌ [GroqAIProvider] generateCode() ERROR:', (error as Error).message);
      console.error('[GroqAIProvider] Error stack:', (error as Error).stack);

      logger.error('GROQ generateCode error', error as Error, {
        component: 'GroqAIProvider'
      });

      throw error;
    }
  }

  private getAnalysisSystemPrompt(analysisType: string): string {
    const prompts = {
      intent: `You are an intent classifier. Analyze the user's prompt and return JSON with:

{
  "intent": { "type": "CREATE_APP", "confidence": 85 },
  "entities": [],
  "context": {
    "domain": "generic",
    "complexity": "standard",
    "stylePreferences": "modern",
    "colorPalette": ["#007AFF", "#34C759"],
    "personality": "professional"
  }
}

IMPORTANT: Detect domain from keywords:
- fitness/workout/exercise → "fitness"
- shop/store/product/cart → "ecommerce"
- analytics/metrics/chart → "dashboard"
- post/chat/social → "social"

Return ONLY the JSON, no explanation.`,

      entity: `You are an entity extractor. Extract entities from the prompt and return JSON with:

{
  "intent": { "type": "CREATE_APP", "confidence": 85 },
  "entities": [
    { "type": "feature", "value": "user authentication", "confidence": 90 },
    { "type": "component", "value": "login form", "confidence": 95 }
  ],
  "context": { ... }
}

Return ONLY the JSON, no explanation.`,

      context: `You are a context analyzer. Analyze the full context and return JSON with complete details.

Return ONLY the JSON, no explanation.`
    };

    return prompts[analysisType as keyof typeof prompts] || prompts.intent;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🤖 CLAUDE ADAPTER IMPLEMENTATION (PREPARADO PARA FUTURO)
// ═══════════════════════════════════════════════════════════════════════════

export class ClaudeAIProvider implements IAIProvider {
  constructor() {
    logger.warn('⚠️ Claude AI Provider not yet implemented', {
      component: 'ClaudeAIProvider'
    });
  }

  async chat(messages: AIMessage[]): Promise<AIResponse> {
    throw new Error('Claude provider not implemented yet. Use GROQ for now.');
  }

  async analyze(prompt: string): Promise<AIAnalysisResult> {
    throw new Error('Claude provider not implemented yet. Use GROQ for now.');
  }

  async generateJson(prompt: string): Promise<any> {
    throw new Error('Claude provider not implemented yet. Use GROQ for now.');
  }

  async generateCode(options: any): Promise<CodeGenerationResult> {
    throw new Error('Claude provider not implemented yet. Use GROQ for now.');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🏭 AI PROVIDER FACTORY
// ═══════════════════════════════════════════════════════════════════════════

export class AIProviderFactory {
  private static instance: IAIProvider | null = null;
  private static currentProvider: AIProviderType = AIProviderType.PERPLEXITY;

  /**
   * Get AI Provider singleton
   */
  static getProvider(): IAIProvider {
    // ✅ LER O .env TODA VEZ QUE CHAMAR getProvider()
    const providerType = (process.env['AI_PROVIDER'] || 'perplexity').toLowerCase();

    if (!this.instance) {
      this.instance = this.createProvider(providerType as AIProviderType);
    }

    return this.instance;
  }

  /**
   * Switch AI Provider (GROQ ↔ Claude ↔ OpenAI ↔ Perplexity)
   */
  static switchProvider(type: AIProviderType): void {
    this.currentProvider = type;
    this.instance = this.createProvider(type);
    logger.info(`🔄 Switched AI Provider to: ${type}`, {
      component: 'AIProviderFactory'
    });
  }
private static createProvider(type: string): IAIProvider {
    const providerType = type.toLowerCase();

    switch (providerType) {
      case 'groq':
        logger.info('🤖 Creating GROQ AI Provider', {
          component: 'AIProviderFactory'
        });
        return new GroqAIProvider();

      case 'perplexity':
        logger.info('🔮 Creating Perplexity AI Provider (Sonar Models)', {
          component: 'AIProviderFactory'
        });

        const perplexityKey = process.env['PERPLEXITY_API_KEY'];
        const perplexityModel = process.env['PERPLEXITY_MODEL'] || 'llama-3.1-sonar-large-128k-online';

        if (!perplexityKey) {
          logger.error(
            '❌ PERPLEXITY_API_KEY not found! Cannot create provider.',
            new Error('Missing PERPLEXITY_API_KEY'),
            { component: 'AIProviderFactory' }
          );
          throw new Error('PERPLEXITY_API_KEY not found in environment variables');
        }

        return new PerplexityProvider(perplexityKey, perplexityModel) as any;

      case 'deepseek':                                    // ✅ ANTES do default
        logger.info('🔵 Creating DeepSeek AI Provider (V3)', {
          component: 'AIProviderFactory'
        });

        const deepseekKey = process.env['DEEPSEEK_API_KEY'];
        const deepseekModel = process.env['DEEPSEEK_MODEL'] || 'deepseek-chat';

        if (!deepseekKey) {
          logger.error(
            '❌ DEEPSEEK_API_KEY not found! Cannot create provider.',
            new Error('Missing DEEPSEEK_API_KEY'),
            { component: 'AIProviderFactory' }
          );
          throw new Error('DEEPSEEK_API_KEY not found in environment variables');
        }

        return new DeepSeekProvider(deepseekKey, deepseekModel);

      case 'claude':
        logger.info('🤖 Creating Claude AI Provider', {
          component: 'AIProviderFactory'
        });
        return new ClaudeAIProvider();

      default:
        logger.warn(`Unknown provider type: ${providerType}, defaulting to Perplexity`, {
          component: 'AIProviderFactory'
        });
        return this.createProvider('perplexity');
    }
  }
  
}

// export const aiProvider = AIProviderFactory.getProvider(); // ✅ COMENTADO! Provider será criado sob demanda.
