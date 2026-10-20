# 🏗️ ORUS BUILDER - ARCHITECTURE & ENGINES GUIDE

> Documento arquitetural histórico de 2025. Ele preserva a intenção e a linguagem das engines, mas não certifica integrações, stacks ou provedores. O estado comprovado está no [README](../README.md), no [inventário executável](INVENTARIO-EXECUTAVEL-FASE-0.md) e no [Plano Mestre](PLANO-MESTRE-EXECUCAO-PRODUCAO.md).
## Understanding CognitiveGenerationEngine & OrchestratorEngine

**Version:** 1.0  
**Date:** 2025-10-26  
**Status:** 🚀 Production Ready  
**Audience:** Developers, DevOps, Contributors

---

## 📖 TABLE OF CONTENTS

1. [System Architecture Overview](#system-architecture-overview)
2. [CognitiveGenerationEngine (The Generator)](#cognitivegenerationengine-the-generator)
3. [OrchestratorEngine (The Orchestrator)](#orchestratorengine-the-orchestrator)
4. [How They Work Together](#how-they-work-together)
5. [Data Flow & Pipeline](#data-flow--pipeline)
6. [Internal Components](#internal-components)
7. [Extending & Contributing](#extending--contributing)
8. [Performance & Optimization](#performance--optimization)

---

## SYSTEM ARCHITECTURE OVERVIEW

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT (BROWSER)                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  PromptInput Component (React)                          │ │
│  │  - Natural language textarea (5000 chars max)           │ │
│  │  - Framework selector (React/Vue/Angular)              │ │
│  │  - Language selector (TypeScript/JavaScript)           │ │
│  └─────────────────┬───────────────────────────────────────┘ │
└────────────────────┼──────────────────────────────────────────┘
                     │ POST /api/v1/generation/generate
                     ▼
┌──────────────────────────────────────────────────────────────┐
│                  EXPRESS SERVER (BACKEND)                    │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  API Route: POST /api/v1/generation/generate           │  │
│  │  ├─ Body: { prompt, framework, language, style }      │  │
│  │  └─ Response: { generatedCode, metadata }             │  │
│  └───────────────────┬────────────────────────────────────┘  │
│                      │                                        │
│  ┌───────────────────▼────────────────────────────────────┐  │
│  │  OrchestratorEngine                                     │  │
│  │  ├─ Stage 1: Validate request                         │  │
│  │  ├─ Stage 2: Call GenerationPipeline                  │  │
│  │  └─ Stage 3: Format response                          │  │
│  └───────────────────┬────────────────────────────────────┘  │
│                      │                                        │
│  ┌───────────────────▼────────────────────────────────────┐  │
│  │  GenerationPipeline (6 Stages)                         │  │
│  │                                                         │  │
│  │  ┌─ stagePrepare()                                    │  │
│  │  │  ├─ PromptProcessor.process()                      │  │
│  │  │  ├─ Scope Detection (AI)                           │  │
│  │  │  └─ Return: analysis, scope, templates             │  │
│  │  │                                                     │  │
│  │  ├─ stageGenerate()                                   │  │
│  │  │  ├─ Build enriched prompt                          │  │
│  │  │  ├─ Call AIProvider (Groq/Perplexity/etc)          │  │
│  │  │  └─ Return: raw AI code                            │  │
│  │  │                                                     │  │
│  │  ├─ stageSpecialize()                                 │  │
│  │  │  ├─ Split code into components                     │  │
│  │  │  ├─ Apply specialized generators                   │  │
│  │  │  └─ Return: structured components                  │  │
│  │  │                                                     │  │
│  │  ├─ stageValidate()                                   │  │
│  │  │  ├─ AST parsing & validation                       │  │
│  │  │  ├─ TypeScript checking                            │  │
│  │  │  └─ Return: validated, fixed code                  │  │
│  │  │                                                     │  │
│  │  ├─ stageOptimize()                                   │  │
│  │  │  ├─ Performance optimization                       │  │
│  │  │  ├─ Tree-shaking, minification                     │  │
│  │  │  └─ Return: optimized code                         │  │
│  │  │                                                     │  │
│  │  └─ stageQualityAnalysis()                            │  │
│  │     ├─ Code quality metrics                           │  │
│  │     ├─ Security scanning                              │  │
│  │     └─ Return: quality report                         │  │
│  │                                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                      ▲                                        │
│                      │                                        │
│  ┌───────────────────┴────────────────────────────────────┐  │
│  │  Trinity AI Provider Factory                           │  │
│  │  ├─ Groq          (✅ Active)                          │  │
│  │  ├─ Perplexity    (✅ Active)                          │  │
│  │  ├─ Claude        (⏳ Coming)                          │  │
│  │  └─ OpenAI        (⏳ Coming)                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                      ▲
                      │ Network Requests
                      ▼
            ┌────────────────────┐
            │  AI Provider APIs   │
            │  (External)         │
            └────────────────────┘
```

---

## COGNITIVEGENERATIONENGINE: THE GENERATOR

### What is it?

The **CognitiveGenerationEngine** is the core generation engine responsible for transforming natural language prompts into production-ready code through a **6-stage pipeline**.

### Architecture

```typescript
export class CognitiveGenerationEngine {
  // ═══════════════════════════════════════════════════════
  // CORE METHODS (6-Stage Pipeline)
  // ═══════════════════════════════════════════════════════
  
  async generate(request: GenerationRequest): Promise<GenerationResult>
  private async stagePrepare(request): Promise<PipelineStageResult>
  private async stageGenerate(prepareData): Promise<PipelineStageResult>
  private async stageSpecialize(generateData): Promise<PipelineStageResult>
  private async stageValidate(specializeData): Promise<PipelineStageResult>
  private async stageOptimize(validateData): Promise<PipelineStageResult>
  private async stageQualityAnalysis(optimizeData): Promise<PipelineStageResult>
  
  // ═══════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════
  
  private detectScopeFromIntent(): ScopeDetectionResult
  private buildEnrichedPrompt(): string
  private splitCodeIntoComponents(): Component[]
  private validateTypeScript(): ValidationResult
  private analyzeSecurity(): SecurityReport
}
```

### The 6 Stages Explained

#### **Stage 1: stagePrepare()**

**What:** Analyze and prepare the generation request

**Input:**
```typescript
{
  prompt: "Create a dashboard with charts",
  framework: "react",
  language: "typescript"
}
```

**Process:**
1. Extract intent from prompt using PromptProcessor
2. Detect scope (SINGLE_COMPONENT, FEATURE, LANDING_PAGE, BACKEND, FULLSTACK)
3. Search for relevant templates
4. Build specification

**Output:**
```typescript
{
  analysis: {
    originalPrompt: "...",
    intent: { type: "CREATE_APP", confidence: 85 },
    entities: ["dashboard", "charts"],
    requirements: ["responsive", "dark mode"],
    context: { domain: "dashboard", complexity: "high" }
  },
  scope: {
    type: ScopeType.FEATURE,
    complexity: "high",
    confidence: 0.85,
    expectedFileCount: { min: 12, max: 25 }
  },
  templates: [...],
  specification: { ... }
}
```

**Duration:** ~1-2 seconds

---

#### **Stage 2: stageGenerate()**

**What:** Generate code using AI Provider

**Input:** Prepared data from Stage 1

**Process:**
1. Build enriched prompt with:
   - Original user prompt
   - Detected scope & complexity
   - Architecture guidelines
   - Code quality standards
2. Call AIProvider (Groq/Perplexity/etc)
3. Extract raw generated code

**Code:**
```typescript
async stageGenerate(prepareData: any): Promise<PipelineStageResult> {
  const enrichedPrompt = this.buildEnrichedPrompt(
    prepareData.analysis,
    prepareData.scope
  );

  const provider = AIProviderFactory.getProvider();
  
  const response = await provider.generateCode({
    prompt: enrichedPrompt,
    maxTokens: 8000,
    temperature: 0.7
  });

  return {
    success: true,
    data: {
      rawCode: response.code,
      provider: response.model,
      usage: response.metadata
    }
  };
}
```

**Duration:** ~2-8 seconds (depends on AI provider)

---

#### **Stage 3: stageSpecialize()**

**What:** Split raw code and apply specialized generators

**Input:** Raw AI-generated code

**Process:**
1. Parse code into sections (components, types, styles, etc)
2. Apply specialized generators:
   - ComponentGenerator (UI)
   - TypesGenerator (TypeScript types)
   - StylesGenerator (CSS/Tailwind)
   - TestsGenerator (Jest tests)
   - MocksGenerator (Mock data)
   - StorybookGenerator (Stories)
3. Structure into files

**Output:**
```typescript
[
  {
    filename: "Dashboard.tsx",
    content: "export const Dashboard = () => {...}",
    type: "component"
  },
  {
    filename: "Dashboard.types.ts",
    content: "export interface DashboardProps {...}",
    type: "types"
  },
  // ... more files
]
```

**Duration:** ~1-3 seconds

---

#### **Stage 4: stageValidate()**

**What:** Validate and fix code

**Input:** Specialized components

**Process:**
1. Parse AST (Abstract Syntax Tree)
2. TypeScript compiler validation
3. Fix common issues:
   - Missing imports
   - Type mismatches
   - Syntax errors
4. Ensure all components are valid

**Validation Checks:**
```typescript
- ✅ Valid TypeScript syntax
- ✅ All imports resolved
- ✅ Component props typed
- ✅ No unused variables
- ✅ Consistent styling
- ✅ Accessibility (ARIA)
```

**Duration:** ~1-2 seconds

---

#### **Stage 5: stageOptimize()**

**What:** Optimize code for production

**Input:** Validated components

**Process:**
1. Performance optimization:
   - Tree-shaking dead code
   - Component memoization (React.memo)
   - Lazy loading setup
2. Bundle optimization:
   - Remove console.logs
   - Minify code
   - Asset optimization
3. Best practices:
   - No hardcoded values
   - Proper error handling
   - Loading states

**Duration:** ~0.5-1 second

---

#### **Stage 6: stageQualityAnalysis()**

**What:** Analyze and report quality metrics

**Input:** Optimized code

**Process:**
1. Code quality analysis:
   - Complexity score
   - Maintainability index
   - Test coverage recommendation
2. Security scanning:
   - No hardcoded secrets
   - No dangerous functions
   - Secure patterns
3. Accessibility check:
   - ARIA labels
   - Keyboard navigation
   - Color contrast

**Output:**
```typescript
{
  qualityScore: 8.5,  // 1-10
  metrics: {
    complexity: "medium",
    maintainability: "high",
    securityIssues: 0,
    accessibilityScore: "AA"
  },
  recommendations: [
    "Add error boundary",
    "Implement loading states",
    "Add unit tests"
  ]
}
```

**Duration:** ~0.5-1 second

---

## ORCHESTRATORENGINE: THE ORCHESTRATOR

### What is it?

The **OrchestratorEngine** manages the overall generation flow, coordinates between stages, handles errors, and formats responses for the client.

### Architecture

```typescript
export class OrchestratorEngine {
  // ═══════════════════════════════════════════════════════
  // MAIN ENTRY POINT
  // ═══════════════════════════════════════════════════════
  
  async orchestrate(request: OrchestratorRequest): Promise<OrchestratorResponse>
  
  // ═══════════════════════════════════════════════════════
  // ORCHESTRATION METHODS
  // ═══════════════════════════════════════════════════════
  
  private validateRequest(request): ValidationResult
  private setupContext(request): GenerationContext
  private coordinatePipeline(context): GenerationResult
  private formatResponse(result): OrchestratorResponse
  private handleError(error): ErrorResponse
}
```

### How Orchestrator Works

```typescript
async orchestrate(request: OrchestratorRequest): Promise<OrchestratorResponse> {
  
  // 1. Validate incoming request
  const validation = await this.validateRequest(request);
  if (!validation.isValid) {
    return this.handleError(validation.error);
  }

  // 2. Setup generation context
  const context = this.setupContext(request);
  
  // 3. Create generation pipeline
  const pipeline = new GenerationPipeline(
    this.promptProcessor,
    this.cognitiveEngine,
    this.cacheService
  );

  // 4. Execute pipeline stages in sequence
  try {
    const result = await pipeline.execute(context);
    
    // 5. Format response for client
    const response = this.formatResponse(result);
    
    // 6. Cache for future requests (optional)
    await this.cacheService.store(request.prompt, response);
    
    // 7. Log analytics
    await this.analyticsService.log({
      prompt: request.prompt.substring(0, 100),
      scope: result.scope,
      duration: Date.now() - context.startTime,
      success: true
    });
    
    return response;
    
  } catch (error) {
    // Handle failures gracefully
    logger.error('Generation failed', error);
    
    return this.handleError(error);
  }
}
```

### Error Handling Flow

```
┌──────────────────────────┐
│  Generation Request      │
└───────────┬──────────────┘
            │
            ▼
    ┌───────────────────┐
    │ Validate Request  │
    └───────┬───────────┘
            │
      ┌─────┴──────────┐
      │                │
   Valid          Invalid
      │                │
      ▼                ▼
  Continue      Return Error
      │          (422 Unprocessable)
      ▼
┌──────────────────────────┐
│  Execute Pipeline        │
└───────────┬──────────────┘
            │
      ┌─────┴──────────────┐
      │                    │
   Success            Failure
      │                    │
      ▼                    ▼
  Return Code      Try Fallback
      │            (Simpler generation)
      │                    │
      │              ┌─────┴─────┐
      │              │           │
      │          Success   Failure
      │              │           │
      │              ▼           ▼
      │           Return    Return 500
      │           Fallback   Error
      │              │
      └──────┬───────┘
             ▼
       Return Response
         to Client
```

---

## HOW THEY WORK TOGETHER

### The Complete Flow

```
USER INTERACTION
    │
    └─→ Frontend: PromptInput component
        └─→ POST /api/v1/generation/generate
            └─→ Express Route Handler
                │
                ├─→ OrchestratorEngine.orchestrate()
                │   │
                │   ├─→ Validate Request
                │   ├─→ Setup Context
                │   │
                │   └─→ GenerationPipeline.execute()
                │       │
                │       ├─→ stagePrepare()
                │       │   └─→ PromptProcessor
                │       │   └─→ Scope Detector
                │       │
                │       ├─→ stageGenerate()
                │       │   └─→ AIProviderFactory
                │       │       └─→ Groq/Perplexity/Claude
                │       │
                │       ├─→ stageSpecialize()
                │       │   └─→ Component Generators
                │       │
                │       ├─→ stageValidate()
                │       │   └─→ AST Parser
                │       │   └─→ TypeScript Checker
                │       │
                │       ├─→ stageOptimize()
                │       │   └─→ Performance Tools
                │       │
                │       └─→ stageQualityAnalysis()
                │           └─→ Quality Scanner
                │
                └─→ Format Response & Send
                    └─→ Frontend: Display Result
                        └─→ User: Download Code
```

### Request-Response Cycle

**Timing Breakdown:**
```
Total Generation: ~8-15 seconds

stagePrepare():        1-2 sec    (Analysis, Scope Detection)
stageGenerate():       2-8 sec    (AI Provider Call) ⏱️ LONGEST
stageSpecialize():     1-3 sec    (Component Splitting)
stageValidate():       1-2 sec    (Validation & Fixes)
stageOptimize():       0.5-1 sec  (Performance Optimization)
stageQualityAnalysis(): 0.5-1 sec (Quality Report)
───────────────────────────────────
Total:                 6-18 sec

Network overhead:      1-2 sec
Formatting:            0.5-1 sec
────────────────────────────────────
End-to-End:            8-21 sec
```

**Typically:** 8-15 seconds for most projects

---

## DATA FLOW & PIPELINE

### Input Schema

```typescript
interface GenerationRequest {
  prompt: string;              // 10-5000 characters
  framework?: 'react' | 'vue' | 'angular' | 'nextjs';
  language?: 'typescript' | 'javascript';
  style?: 'modern' | 'minimal' | 'bold';
  includeTests?: boolean;
  userId?: string;
}
```

### Output Schema

```typescript
interface GenerationResult {
  files: Array<{
    filename: string;
    content: string;
    type: 'component' | 'types' | 'styles' | 'tests' | 'mock' | 'stories';
  }>;
  metadata: {
    scope: ScopeType;
    complexity: ComplexityLevel;
    fileCount: number;
    totalLines: number;
    estimatedTokens: number;
  };
  quality: {
    score: number;        // 1-10
    metrics: {...};
    recommendations: string[];
  };
  timing: {
    prepare: number;
    generate: number;
    specialize: number;
    validate: number;
    optimize: number;
    analysis: number;
    total: number;
  };
}
```

---

## INTERNAL COMPONENTS

### 1. PromptProcessor

**Purpose:** Analyze natural language prompts

```typescript
class PromptProcessor {
  async process(prompt: string): Promise<PromptAnalysisResult> {
    return {
      intent: { type, confidence },
      entities: [...],
      requirements: [...],
      context: { domain, complexity, style }
    };
  }
}
```

### 2. ScopeDetector

**Purpose:** Auto-detect project complexity

```typescript
class ScopeDetector {
  detectScope(analysis: AnalysisResult): ScopeDetectionResult {
    // AI-powered detection based on keywords
    // Returns: SINGLE_COMPONENT | FEATURE | LANDING_PAGE | BACKEND | FULLSTACK
  }
}
```

### 3. Specialized Generators

```typescript
class ComponentGenerator {}
class TypesGenerator {}
class StylesGenerator {}
class TestsGenerator {}
class MocksGenerator {}
class StorybookGenerator {}
```

### 4. Validators

```typescript
class TypeScriptValidator {}
class ASTValidator {}
class SecurityValidator {}
class AccessibilityValidator {}
```

### 5. Optimizers

```typescript
class PerformanceOptimizer {}
class BundleOptimizer {}
class BestPracticesOptimizer {}
```

---

## EXTENDING & CONTRIBUTING

### Adding a New Stage

```typescript
// 1. Define the stage
private async stageCustom(data: any): Promise<PipelineStageResult> {
  try {
    console.log('🔄 [Pipeline] stageCustom() STARTED');
    
    // Your custom logic here
    const result = await this.myCustomLogic(data);
    
    console.log('✅ [Pipeline] stageCustom() COMPLETED');
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

// 2. Add to pipeline execution
async generate(request: GenerationRequest): Promise<GenerationResult> {
  // ... existing stages ...
  
  const customData = await this.stageCustom(optimizeData);
  if (!customData.success) throw new Error(customData.error);
  
  // ... rest of pipeline ...
}
```

### Adding a New Provider

```typescript
// 1. Create provider class
export class MyAIProvider implements IAIProvider {
  async chat(messages: AIMessage[]): Promise<AIResponse> { ... }
  async analyze(prompt: string): Promise<AIAnalysisResult> { ... }
  async generateJson<T>(prompt: string): Promise<T> { ... }
}

// 2. Register in factory
case 'myprovider':
  return new MyAIProvider();

// 3. Use
export AI_PROVIDER=myprovider npm run dev
```

---

## PERFORMANCE & OPTIMIZATION

### Caching Strategy

```typescript
// Cache layer prevents redundant generations
const cacheKey = hash(prompt + framework + language);
const cached = await cache.get(cacheKey);

if (cached) {
  return cached;  // Instant response!
}

// Otherwise, generate and cache
const result = await generateFullPipeline();
await cache.set(cacheKey, result, { ttl: 86400 }); // 24h TTL
return result;
```

### Parallel Processing

```typescript
// Run independent stages in parallel where possible
const [analysis, templates, specification] = await Promise.all([
  this.analyzePrompt(),
  this.searchTemplates(),
  this.buildSpecification()
]);
```

### Resource Limits

```typescript
// Prevent runaway generations
const MAX_TOKENS = 8000;
const MAX_FILES = 100;
const MAX_DURATION = 60000; // 60 seconds

if (generatedTokens > MAX_TOKENS) {
  throw new Error('Token limit exceeded');
}
```

---

## MONITORING & DEBUGGING

### Logging

```typescript
console.log('🔍 [Pipeline] stagePrepare() CALLED');
console.log('✅ [Pipeline] Scope detected: FEATURE');
console.log('⚠️  [Pipeline] Missing import for React');
console.log('❌ [Pipeline] TypeScript error on line 45');
```

### Metrics Collection

```typescript
{
  "prompt_length": 245,
  "scope_detected": "FEATURE",
  "provider_used": "perplexity",
  "generation_time_ms": 8432,
  "files_generated": 16,
  "quality_score": 8.7,
  "errors_fixed": 3,
  "success": true
}
```

---

## CONCLUSION

- **CognitiveGenerationEngine** = The creative brain (generates code)
- **OrchestratorEngine** = The project manager (coordinates flow)
- Together = Production-ready code in 8-15 seconds ⚡

---

**Version:** 1.0  
**Last Updated:** 2025-10-26  
**Status:** Production Ready  
**License:** MIT
