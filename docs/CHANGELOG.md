# CHANGELOG.md - ORUS Builder

All notable changes to ORUS Builder will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] - 2026-10-08

### Added

- Product Blueprint versionado como fonte primária da geração.
- Certificação com instalação limpa, migrations, seed, testes, build, runtime e `/health`.
- Manifesto `.orus/certification.json` com ambiente, hashes e cobertura do Blueprint.
- Regeneração incremental com arquivos protegidos, histórico, diff e migrations aditivas.
- Workspace persistente com ownership, editor, preview, chat, presença e comentários por arquivo.
- Matriz de navegador para doze classes de produto em desktop e mobile.
- CI para auditoria, regressão, fullstack, navegador e isolamento Docker.
- Pipeline local de favicon e ativos visuais com manifesto de origem, licença e fallback offline.
- Persistência atômica de padrões e modelos da Learning Engine sem armazenar prompts ou código gerado.
- Persistência atômica de documentos e Product Blueprints, com restauração do registry e recuperação fechada de processamentos interrompidos.
- Capacidades especializadas para recrutamento, educação, logística, eventos e restaurantes, com 27 modelos de domínio e workflows persistidos.
- Matriz de fidelidade funcional que bloqueia a regressão desses domínios para entidades genéricas como `Item`, `Task`, `Project` ou `Workspace`.
- Inferência aberta de capacidades para domínios ainda não catalogados, preservando evidência do prompt em entidades, estratégias, rotas, layouts e componentes do Blueprint.

### Changed

- Toolchain atualizada para Node.js 24.15+, Vite 8.3.3, Vitest 5.0.3, Tailwind CSS 4.3.3 e ESLint 10.12.0.
- CIG histórico conectado à decisão canônica de certificação.
- Gerador passou a compor projetos a partir do Blueprint e de estratégias de capacidade.
- Engines sem provedor real são desabilitadas e declaradas como indisponíveis.
- Terminal do workspace migrado para os pacotes `@xterm/*` mantidos.
- Provedores de IA passam a ser carregados sob demanda; testes unitários não dependem de segredos locais.
- O endpoint legado de salvamento reutiliza o workspace canônico e não retorna mais sucesso sem persistência.
- O console do editor deixou de simular build, testes e servidor; essas operações permanecem exclusivas do pipeline certificado.
- CORS do servidor respeita `FRONTEND_URL` e a lista de `CORS_ORIGIN`, sem origens locais implícitas em produção.
- Template Manager passou a consumir Template Library, Customizer e Validator reais; Component Builder falha fechado quando um método não possui implementação.
- Learning Engine passou a persistir apenas padrões e modelos assinados, com gravação atômica e sem prompts ou código gerado.
- Monitoring Engine passou a usar métricas reais do processo e deixou de declarar subsistemas fixos ou dados aleatórios como saudáveis.
- O orquestrador deixou de exigir o Template Engine histórico sem `project-scaffold`; a seleção de templates do gerador permanece no Template Manager canônico.
- Rotas internas de teste exigem opt-in explícito fora de produção e nunca podem ser habilitadas em produção.
- O endpoint legado que dividia Trinity em três serviços simulados foi removido; o status canônico permanece em `/api/engines/status`.
- Templates históricos resolvem defaults, não avaliam expressões dinâmicas e bloqueiam marcadores de implementação incompleta.
- Páginas especializadas emitem rótulos e ações de workflow somente quando o layout gerado consome esses contratos.
- Recrutamento, educação, logística, eventos e hospitalidade recebem identidade, padrão de experiência e composição inicial próprios.
- Painéis de hospitalidade preservam contraste WCAG no conteúdo sobre a cor primária.
- Cancelamento de comandos no Windows possui fallback limitado quando o encerramento assíncrono da árvore de processos demora sob carga.

### Security

- Auditoria completa de dependências sem vulnerabilidades conhecidas no nível moderado ou superior.
- Tokens opacos, expiração, revogação, ownership e rate limits nos artefatos de geração.
- Limites de arquivos, bytes, memória, CPU, PIDs, tempo, saída e concorrência.

### Validation

- 48 arquivos e 298 testes backend aprovados.
- 6 arquivos e 20 testes frontend aprovados.
- Instalação limpa por lockfile, sem `.env` ou chave de IA, aprovada com 282 testes e os dois builds.
- Fullstack certificado, regeneração válida, rollback inválido e 13 de 13 testes de navegador aprovados sobre 12 produtos.
- Fullstack repetido após a consolidação do orquestrador e aprovado em 276,49 segundos.
- Cinco fullstacks adicionais de recrutamento, educação, logística, eventos e restaurante aprovados com instalação, relações, validação Prisma e builds de frontend e backend.
- Matriz de navegador consolidada em 536,62 segundos, com 12 fingerprints visuais, desktop, mobile, overflow, erros de página e WCAG A/AA.
- Fullstack de biblioteca não catalogada aprovado em 109,71 segundos, sem entidades genéricas, com instalação, Prisma e builds de frontend e backend.
- Corpus aberto aprovado para biblioteca, proteção animal e construção, preservando as capacidades solicitadas e sem `Item`, `Task`, `Project` ou `Workspace` genéricos.
- Cinco novos exemplos persistentes materializados: Acervo Vivo, Talento Vivo, Rota Clara, Festival Vivo e Atelier Terra; todos com build e auditoria aprovados, além de Prisma válido nos quatro fullstacks.

---

## [1.0.0-genesis] - 2025-10-30

### 🎉 Initial Release

#### Added
- ⭐ **CIG Protocol v2.0** - Compiler-Integrity Generation for zero-error TypeScript code
- 🎯 **Natural Language Code Generation** - Convert prompts to production-ready code
- 🧠 **Cognitive Architecture** - Trinity integration (Alma + Cerebro + Voz)
- 🔄 **Multi-Provider Support** - Groq, Perplexity, Claude, OpenAI
- 📚 **Full-Stack Generation** - TypeScript, React, Node.js, PostgreSQL/MongoDB
- 🏗️ **Enterprise Patterns** - SOLID, Clean Code, DDD out-of-the-box
- 🔐 **Security First** - JWT, CORS, Rate Limiting, Encryption
- 📊 **Monitoring & Analytics** - Built-in logging, performance tracking
- 🚀 **One-Click Deployment** - Vercel, AWS Lambda, Docker ready
- 📖 **Comprehensive Documentation** - 5 detailed guides + video tutorials

#### Features
- 100+ TypeScript type-safe components
- 172 architectural blocks mapped
- 50+ pre-built templates
- Auto-generated API documentation
- Real-time code generation with streaming
- Intelligent scope detection
- Performance optimization pre-checks
- Security vulnerability scanning

#### Documentation
- `README.md` - Project overview & quick start
- `docs/GETTING-STARTED.md` - Installation guide
- `docs/PROVIDER-SETUP-GUIDE.md` - AI provider configuration
- `docs/PROMPT-TUTORIAL-GUIDE.md` - How to write effective prompts
- `docs/ARCHITECTURE-ENGINES.md` - System architecture deep dive
- `docs/ORUS-Builder-Complete-Architecture-Diagram-Manual.pdf` - Technical diagrams

#### Infrastructure
- Node.js 18+ support
- TypeScript 5.2+ support
- MongoDB Atlas integration
- Redis caching support
- AWS S3 storage integration
- PostgreSQL alternative support

---

## [Historical roadmap]

### 🚧 In Development

#### Planned
- [ ] Web UI Dashboard improvements
- [ ] Multi-file generation support
- [ ] Git integration (auto-commit generated code)
- [ ] Team collaboration features
- [ ] Usage analytics dashboard
- [ ] Marketplace for custom templates
- [ ] CLI tool improvements
- [ ] GraphQL API support
- [ ] Kubernetes deployment support
- [ ] Self-hosted version

#### Experimental
- [ ] Agent mode (autonomous code generation)
- [ ] Vision API support (generate from screenshots)
- [ ] Mobile app generation
- [ ] Infrastructure-as-Code generation
- [ ] Database migration generation

---

## Version History

### v0.9.0 (Pre-Release)
- Beta testing phase
- Core architecture established
- CIG Protocol v1.0 tested

### v0.5.0 (Alpha)
- Initial internal testing
- Basic code generation working
- Provider integrations started

---

## Semantic Versioning

- **MAJOR** - Breaking changes or major new features
- **MINOR** - New features, backward compatible
- **PATCH** - Bug fixes, documentation updates

---

## Reporting Issues

Found a bug? Please open an issue on [GitHub](https://github.com/tulio-orus/orus-builder/issues) with:
- Detailed description of the issue
- Steps to reproduce
- Expected vs. actual behavior
- Environment details (Node version, OS, provider used)
- Relevant code/prompts
