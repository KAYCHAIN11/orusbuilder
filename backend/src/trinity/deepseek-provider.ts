// C:\Users\usuario\Documents\orus-builder\backend\src\trinity\deepseek-provider.ts

/**
 * ╔════════════════════════════════════════════════════════════════════════╗
 * ║ DEEPSEEK AI PROVIDER - V3 WITH CODE GENERATION                        ║
 * ╠════════════════════════════════════════════════════════════════════════╣
 * ║ developers: Minerva Omega + Tulio                                     ║
 * ║ created: 2025-06-10                                                   ║
 * ║ componentHash: orus.builder.ai-providers.deepseek.v1.0               ║
 * ╠════════════════════════════════════════════════════════════════════════╣
 * ║ WHAT IT DOES                                                          ║
 * ║ Provides access to DeepSeek V3 for code generation.                  ║
 * ║ DeepSeek V3 is OpenAI-compatible, so usa axios direto.               ║
 * ╚════════════════════════════════════════════════════════════════════════╝
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../system/logging-system';
import type { IAIProvider, AIMessage, AIResponse, AIAnalysisResult, CodeGenerationResult } from './ai-provider-factory';

export class DeepSeekProvider implements IAIProvider {
  private client: AxiosInstance;
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'deepseek-chat') {
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY not found in environment variables');
    }

    this.apiKey = apiKey;
    this.model = model; // deepseek-chat = DeepSeek V3

    this.client = axios.create({
      baseURL: 'https://api.deepseek.com/v1',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    logger.info('✅ DeepSeek AI Provider initialized', {
      component: 'DeepSeekProvider',
      metadata: { model: this.model }
    });
  }

  async chat(messages: AIMessage[], options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<AIResponse> {
    try {
      logger.debug('🤖 Calling DeepSeek API', {
        component: 'DeepSeekProvider',
        metadata: {
          model: this.model,
          messageCount: messages.length,
          temperature: options?.temperature ?? 0.2
        }
      });

      const response = await this.client.post('/chat/completions', {
        model: options?.model || this.model,
        messages,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.maxTokens || 4000,
        stream: false
      });

      const content: string = response.data.choices[0]?.message?.content || '';

      logger.info('✅ DeepSeek API response received', {
        component: 'DeepSeekProvider',
        metadata: {
          responseLength: content.length,
          tokensUsed: response.data.usage?.total_tokens || 0
        }
      });

      return {
        content,
        model: response.data.model || this.model,
        usage: {
          promptTokens: response.data.usage?.prompt_tokens || 0,
          completionTokens: response.data.usage?.completion_tokens || 0,
          totalTokens: response.data.usage?.total_tokens || 0
        }
      };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      logger.error(
        '❌ DeepSeek API error',
        error instanceof Error ? error : new Error(errorMessage),
        { component: 'DeepSeekProvider' }
      );
      throw new Error(`DeepSeek API error: ${errorMessage}`, { cause: error });
    }
  }

  async analyze(prompt: string, analysisType: 'intent' | 'entity' | 'context'): Promise<AIAnalysisResult> {
    const systemPrompt = this.getAnalysisSystemPrompt(analysisType);
    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, maxTokens: 1500 });

    try {
      // DeepSeek às vezes envolve o JSON em ```json ... ```
      const cleaned = response.content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

      return JSON.parse(cleaned);
    } catch (error) {
      logger.error('Failed to parse DeepSeek analysis response', error as Error, {
        component: 'DeepSeekProvider',
        metadata: { response: response.content }
      });

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
        content: `You are a JSON generator. Generate ONLY valid JSON matching this schema: ${JSON.stringify(schema)}. No markdown, no explanation, raw JSON only.`
      },
      { role: 'user', content: prompt }
    ], { temperature: 0.2, maxTokens: 2000 });

    try {
      const cleaned = response.content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

      return JSON.parse(cleaned) as T;
    } catch (error) {
      logger.error('Failed to parse JSON from DeepSeek', error as Error, {
        component: 'DeepSeekProvider'
      });
      throw new Error('Invalid JSON response from DeepSeek', { cause: error });
    }
  }

  async generateCode(options: {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<CodeGenerationResult> {
    try {
      console.log('🤖 [DeepSeekProvider] generateCode() CHAMADO');
      console.log('[DeepSeekProvider] Prompt length:', options.prompt.length);
      console.log('[DeepSeekProvider] MaxTokens:', options.maxTokens || 8000);
      console.log('[DeepSeekProvider] Temperature:', options.temperature || 0.2);

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
        temperature: options.temperature ?? 0.2,
        maxTokens: options.maxTokens || 8000
      });

      const generatedCode = response.content;

      console.log('✅ [DeepSeekProvider] Code generated successfully');
      console.log('[DeepSeekProvider] Code length:', generatedCode.length);
      console.log('[DeepSeekProvider] Tokens used:', response.usage?.totalTokens || 0);

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
      console.error('❌ [DeepSeekProvider] generateCode() ERROR:', (error as Error).message);
      logger.error('DeepSeek generateCode error', error as Error, {
        component: 'DeepSeekProvider'
      });
      throw error;
    }
  }

  getModelName(): string {
    return this.model;
  }

  private getAnalysisSystemPrompt(analysisType: 'intent' | 'entity' | 'context'): string {
    const prompts: Record<'intent' | 'entity' | 'context', string> = {
      intent: `You are an intent classifier. Analyze the user's prompt and return JSON with:

{
  "intent": {
    "type": "CREATE_APP" | "ADD_FEATURE" | "MODIFY_CODE" | "DEPLOY" | "DEBUG",
    "confidence": 0-100
  },
  "entities": [],
  "context": {
    "domain": "fitness" | "ecommerce" | "dashboard" | "social" | "education" | "healthcare" | "finance" | "generic",
    "complexity": "simple" | "standard" | "advanced",
    "stylePreferences": "modern" | "minimal" | "bold" | "playful" | "professional",
    "colorPalette": ["#HEX1", "#HEX2", "#HEX3"],
    "personality": "motivational" | "persuasive" | "analytical" | "engaging" | "professional"
  }
}

Return ONLY raw JSON, no markdown, no explanation.`,

      entity: `You are an entity extractor. Return ONLY raw JSON, no markdown:

{
  "intent": { "type": "CREATE_APP", "confidence": 85 },
  "entities": [
    { "type": "feature", "value": "user authentication", "confidence": 90 }
  ],
  "context": {}
}`,

      context: `You are a context analyzer. Return ONLY raw JSON with complete details, no markdown.`
    };

    return prompts[analysisType];
  }
}

export default DeepSeekProvider;
