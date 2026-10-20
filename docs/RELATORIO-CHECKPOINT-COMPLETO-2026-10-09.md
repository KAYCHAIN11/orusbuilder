# ORUS Builder — Relatório de Checkpoint Completo

Data: 2026-10-09  
Escopo: estado real do código, conexões, geração, experiência, continuidade de jobs e prontidão para publicação

## 1. Resumo executivo

O ORUS Builder já possui um núcleo real e integrado para geração TypeScript. O caminho principal parte de prompt ou Product Blueprint, planeja produto e identidade visual, gera frontend e backend, materializa banco e testes, instala dependências, compila, inicia o runtime, executa segurança e CIG e somente então libera preview e ZIP.

O sistema não é apenas um chamador de IA nem um CRUD isolado. A arquitetura ativa combina planejamento determinístico, catálogos de domínio, intenção visual, provedores de IA, geradores especializados e certificação executável.

O estado atual pode ser resumido assim:

| Área | Estado | Avaliação |
| --- | --- | --- |
| Geração TypeScript | conectada | núcleo mais maduro do produto |
| Product Blueprint | conectado | fonte primária do fluxo público |
| Identidade e composição visual | conectadas | variedade real, ainda com espaço para ampliar domínios não catalogados |
| Fullstack React + Express + Prisma | conectado e testado | principal stack de entrega |
| Build, testes, runtime, segurança e CIG | conectados | bloqueiam entrega inválida |
| Reparo automático | conectado | até três tentativas, mas sem checkpoint intermediário durável |
| Preview | certificado | preparado e validado antes da entrega; falha reparável volta ao agente |
| Projetos, editor, histórico e regeneração | conectados | preservam arquivos editados e bloqueiam promoção inválida |
| Jobs após reinício | persistidos, mas não retomáveis | jobs ativos viram `failed`; podem ser refeitos, não continuados do estágio exato |
| Colaboração | parcial | API e persistência local existem; engine WebSocket histórica permanece simulada/desabilitada |
| Deployment | indisponível no produto | adapters ainda contêm operações simuladas |
| Marketplace | indisponível no produto | comércio, cobrança e licenciamento não estão prontos |
| Enterprise, SSO e 2FA | indisponíveis | estruturas existem, provedores reais não |
| Python, PHP, Rust e mobile | não suportados para entrega | tipos ou intenções podem existir, mas não há adaptadores certificados |

Conclusão: o Builder está em condição de candidato forte para uma release TypeScript controlada. Ainda não deve ser apresentado como plataforma pública irrestrita ou multi-stack pronta para produção sem concluir isolamento em contêiner, retomada durável, persistência compartilhada e CI do commit candidato.

## 2. Correção concluída neste checkpoint

O preview de aplicações autenticadas não abre mais obrigatoriamente na tela de login.

Comportamento novo:

- o preview compilado recebe `VITE_ORUS_PREVIEW_MODE=true`;
- o frontend gerado inicia com uma identidade de demonstração isolada;
- rotas `/login` e `/register` redirecionam para a tela principal somente no preview;
- chamadas do preview usam um token exclusivo de demonstração;
- o backend temporário reconhece esse token somente quando `ORUS_PREVIEW_MODE=true`;
- projetos antigos também recebem uma adaptação de compatibilidade ao recompilar o preview;
- o projeto baixado não recebe o modo ativo e conserva login, JWT e rotas protegidas reais.

Arquivos alterados:

- `backend/src/generation/ui-generator.ts`
- `backend/src/generation/backend-generator.ts`
- `backend/src/deployment/build-system.ts`
- `backend/tests/generation/ui-generator.test.ts`
- `backend/tests/deployment/build-system.test.ts`

Evidências executadas:

- TypeScript backend: aprovado;
- ESLint backend: aprovado;
- regressão backend: 48 arquivos e 301 testes aprovados;
- frontend: ESLint e TypeScript aprovados; 6 arquivos e 20 testes aprovados;
- builds de produção frontend e backend: aprovados;
- testes direcionados de UI Generator e BuildSystem: 2 arquivos e 54 testes aprovados;
- teste do BuildSystem comprova que o modo de demonstração existe apenas na cópia materializada para preview.

### 2.1 Gate de preview e reparo automático

O artefato não recebe mais estado `ready` apenas porque testes, build, runtime, segurança e CIG passaram. Antes da certificação final, o BuildSystem materializa a cópia de preview, executa seu build de produção, inicia e verifica o backend quando presente, confirma a entrada HTML, valida todas as referências locais de assets e abre o resultado em Chromium para detectar exceções de página, erros de console, respostas HTTP 5xx e aplicação vazia.

Falhas de código nessa preparação são normalizadas como diagnósticos e enviadas ao `CognitiveGenerationEngine.repair`. Depois do reparo, o projeto repete testes, banco, build e runtime antes de tentar o preview novamente. Falhas de ambiente são distinguidas de falhas de código e não provocam alterações artificiais no projeto. O artefato só é promovido após `previewPassed=true`.

Este gate cobre preparação, disponibilidade estrutural e renderização inicial real. A matriz E2E em Chrome continua responsável pelas jornadas completas, responsividade e acessibilidade; transformar cada capacidade do Blueprint em uma jornada interativa específica permanece como evolução posterior de custo controlado.

## 3. Arquitetura conectada atualmente

### 3.1 Entrada e planejamento

| Componente | Função real | Conexão |
| --- | --- | --- |
| `GenerationController` | cria job, token de acesso, status, resultado, preview e ZIP | ativo |
| `GenerationExecutionService` | fila local, concorrência, cancelamento, métricas e chamada do workflow | ativo |
| `PromptEngine` | intenção, entidades, contexto e requisitos | ativo com fallback |
| `BlueprintEngine` e `ProductBlueprintPlanner` | produto, capacidades, jornadas, telas, componentes, dados, arquitetura e aceite | ativos |
| `TrinityEngine` e `VisualIntent` | identidade, paleta, tipografia, composição e experiência | ativos |
| `BlueprintStore` | persistência local atômica de Blueprints | ativo para instância única |

O Blueprint possui versão, origem, profundidade, produto, pessoas, capacidades, jornadas, telas, componentes, dados, arquitetura, critérios de aceite, premissas, perguntas e confiança. Existem três profundidades: `essential`, `product` e `complete`.

### 3.2 Orquestração e geração

O `OrchestrationEngine` é o coordenador do caminho público. O registry possui 16 componentes internos, além do próprio orquestrador. No fluxo principal são obrigatórios:

- Prompt;
- Blueprint;
- Trinity;
- Cognitive Generation;
- UI Enhancement;
- Testing;
- Build System;
- Security;
- CIG;
- Learning;
- Monitoring.

Engines de deployment, marketplace, enterprise e colaboração histórica ficam condicionais ou desabilitadas.

O `CognitiveGenerationEngine` decide o escopo e chama os geradores especializados. O `CodeGenerator` coordena arquitetura, banco, backend, API, UI, testes, otimização e análise de qualidade para projetos compostos.

### 3.3 Certificação

Um projeto só fica `ready` quando todos os gates ativos aprovam:

1. Product Blueprint válido;
2. arquivos materializados sem colisões ou caminhos inseguros;
3. dependências instaladas com scripts de lifecycle bloqueados;
4. validação e geração Prisma quando aplicável;
5. migrations aplicadas quando aplicável;
6. testes executados;
7. build aprovado;
8. backend de produção iniciado;
9. `/health` respondendo corretamente;
10. cobertura de capacidades do produto;
11. qualidade mínima de 70;
12. segurança sem achados altos ou críticos;
13. CIG aprovado;
14. manifesto `.orus/certification.json` criado;
15. lockfile e hashes preservados para reprodutibilidade.

Se build, teste ou runtime falhar, o Cognitive Generation recebe diagnósticos, arquivos afetados e contratos relacionados. Pode aplicar até três reparos e recertificar.

### 3.4 Workspace e manutenção

O workspace autenticado já oferece:

- projetos salvos;
- arquivos reais do artefato;
- editor;
- preview;
- histórico de alterações;
- restauração de alterações de conteúdo, renome, exclusão e duplicação;
- regeneração incremental;
- seleção de caminhos protegidos;
- bloqueio de duas regenerações simultâneas;
- preservação da última versão certificada quando uma evolução falha;
- colaboração persistida em arquivo no backend.

As revisões de regeneração integral não são restauráveis diretamente. A restauração hoje opera sobre mudanças de arquivo, não como checkout completo de qualquer snapshot.

## 4. Tipos de geração

### 4.1 Tipos realmente atendidos pelo pipeline ativo

| Tipo | Saída | Estado |
| --- | --- | --- |
| Landing page | React, Vite, Tailwind, ativos locais e composição de marketing | ativo |
| Componente isolado | componente React com scaffold executável | ativo |
| Feature ou página frontend | conjunto coerente de páginas e componentes | ativo |
| Frontend | aplicação React/TypeScript com persistência local quando solicitada | ativo |
| Backend/API | Express/TypeScript, validação, serviços, controllers e testes | ativo |
| Fullstack | React + Express + Prisma + autenticação opcional + testes | ativo e mais validado |
| Blueprint para projeto | mesmo núcleo do prompt, usando Blueprint fornecido | ativo |
| Evolução incremental | novo Blueprint, overlay do workspace e recertificação | ativo |

### 4.2 Tipos declarados, mas não prontos como produto

- `DATABASE` existe no enum de escopo, mas não possui caminho público autônomo completo equivalente ao fullstack.
- `API`, `LIBRARY` e `MOBILE` existem no enum do Code Generator; API é absorvida pelo backend, enquanto Library e Mobile não possuem fluxo certificado completo.
- GraphQL aparece no contrato de arquitetura, mas a matriz principal e os geradores certificados são REST.
- JavaScript é aceito por alguns contratos, porém a evidência forte é TypeScript.
- Python pode aparecer na arquitetura inferida pelo Blueprint se citado no prompt, mas não há materializador, build, testes e CIG próprios. PHP e Rust também não possuem adaptadores.

Essas opções não devem ser anunciadas como suporte de produção até a Fase 17.

## 5. Domínios e variedade de produto

O planejamento possui perfis principais para:

- SaaS;
- dashboard operacional;
- CRM;
- comércio;
- saúde;
- finanças;
- produto criativo;
- domínio genérico enriquecido por extração.

O catálogo explícito também reconhece capacidades de recrutamento, educação, logística, eventos, restaurantes, notificações, relatórios, mensagens, arquivos, assinaturas, permissões, integrações, pagamentos, IA e exportação.

Produtos não catalogados passam por extração de capacidades abertas para reduzir o fallback `Item`, `Task` ou `Project` genérico.

### 5.1 Vocabulário visual ativo

O Visual Intent oferece:

- 7 estilos: premium, minimal, corporate, playful, editorial, luxury e glass;
- 8 arquétipos de produto;
- 13 padrões de experiência;
- 7 visualizações de dados: tabela, kanban, calendário, timeline, catálogo, ledger e galeria;
- 5 assinaturas de layout;
- 6 shells;
- 5 posições de ação;
- paletas por estilo, domínio e sinais explícitos do prompt;
- personalidade, voz, promessa, metáfora, imagem, tipografia, densidade, movimento e raio;
- composição desktop e navegação mobile.

O catálogo ativo de UI possui 23 receitas, incluindo app shell, hero, campos, tabela, kanban, calendário, timeline, catálogo, ledger, galeria, gráficos, estados vazios, toast, dialog, skeleton, feature grid, testimonial e CTA.

### 5.2 Limite atual da variedade

A variedade é materialmente maior que troca de cores, mas ainda depende de perfis e regras determinísticas. Em um domínio muito novo, com prompt curto ou ambíguo, o Blueprint pode inferir uma estrutura mais genérica. A IA pode enriquecer, mas o resultado mínimo não depende dela.

O próximo ganho de qualidade não vem de adicionar dezenas de templates estáticos. Vem de melhorar:

- extração de jornadas e exceções;
- layouts derivados de tarefas reais;
- relações de domínio;
- ativos visuais de marca;
- avaliação semântica de prompts fora do catálogo;
- memória de fingerprints para evitar repetição entre usuários.

## 6. Templates: realidade do código

Há três conceitos diferentes que não devem ser confundidos:

1. `TemplateLibrary`: possui hoje um template built-in indexado, `react-dashboard-modern`.
2. `TemplateEngine`: possui duas receitas padrão, `react-component-ts` e `ts-service`; a engine histórica não é o centro do fluxo público.
3. Geradores ativos: `ProductBlueprint`, `VisualIntent`, `DomainModelCatalog`, `UIComponentCatalog`, `UIGenerator`, `BackendGenerator` e `DatabaseDesigner` geram a maior parte do produto programaticamente.

O Cognitive Generation consulta o `TemplateManager`, mas a biblioteca ainda é pequena. Portanto, a qualidade e a diversidade atuais vêm principalmente dos contratos e geradores, não de uma grande coleção de templates.

Recomendação: manter templates como aceleradores e referências, não como produto-base universal. O Blueprint deve continuar decidindo o produto.

## 7. Provedores de IA

O factory atual possui caminhos reais para:

- Groq;
- Perplexity;
- DeepSeek.

Claude permanece como adapter não implementado. OpenAI aparece no enum/documentação histórica, mas não possui caminho equivalente comprovado no factory atual.

A IA influencia análise, enriquecimento e reparo, mas o sistema mantém planejamento determinístico e geradores locais para não depender totalmente de rede. Isso é positivo para previsibilidade. A qualidade final, porém, ainda varia conforme modelo, prompt e capacidade do reparador de preservar contratos.

## 8. Fluxo ponta a ponta

```text
Prompt ou documento
        |
        v
Validação de entrada e token do job
        |
        v
Fila local e controle de concorrência
        |
        v
Prompt Engine + Trinity Visual Intent
        |
        v
Product Blueprint versionado
produto | capacidades | jornadas | telas | componentes | dados | aceite
        |
        v
Cognitive Generation + geradores especializados
arquitetura | banco | backend | API | UI | testes | documentação
        |
        v
Materialização em diretório temporário
        |
        v
install -> Prisma/migrations -> testes -> build -> start -> /health
        |                                       |
        | falha                                 | sucesso
        v                                       v
diagnóstico -> reparo -> nova tentativa    produto/segurança/CIG
        |                                       |
        +-------------------------------+-------+
                                        v
                               artefato certificado
                                        |
                  +---------------------+---------------------+
                  v                     v                     v
               preview              salvar projeto         ZIP
```

## 9. Como o agente cria

O agente não deveria escrever arquivos imediatamente. No caminho atual ele:

1. classifica escopo e complexidade;
2. identifica domínio, entidades e tecnologias;
3. constrói identidade visual;
4. cria ou normaliza o Product Blueprint;
5. valida o Blueprint;
6. escolhe estratégia por capacidade: CRUD, workflow, cálculo, conteúdo, integração ou custom;
7. gera modelo de domínio, relações e transições;
8. gera telas e componentes associados às jornadas;
9. gera backend, API, banco, autenticação e testes conforme o escopo;
10. deduplica e normaliza arquivos;
11. executa o projeto real;
12. usa os erros do compilador, testes, Prisma e runtime para reparar arquivos relacionados;
13. executa segurança, cobertura do produto e CIG;
14. promove somente o artefato aprovado.

Há, entretanto, dívida técnica no `CognitiveGenerationEngine`: o arquivo concentra milhares de linhas, possui detectores e pipelines históricos duplicados e mantém blocos antigos ao lado do caminho atual. Funciona, mas aumenta risco de regressão e dificulta saber qual decisão veio de qual versão interna.

## 10. Persistência e continuidade de geração

### 10.1 O que já existe

- o job é persistido antes de a API devolver HTTP 202;
- prompt, opções, usuário, token em hash, progresso, diagnósticos e resultado final ficam no repositório;
- a escrita em arquivo usa arquivo temporário e rename;
- jobs prontos sobrevivem ao reinício;
- preview perdido em memória pode ser reconstruído a partir dos arquivos persistidos;
- o frontend guarda o último ID e o token opaco no navegador;
- o endpoint de retry reutiliza a requisição de um job falho;
- regeneração de projeto falha sem substituir a versão certificada anterior.

### 10.2 Recuperação adicionada neste checkpoint

Estados `queued`, `generating`, `validating` e `repairing` agora são carregados como `recovering`. O controller reenfileira automaticamente a solicitação persistida no mesmo ID lógico, preserva token, proprietário, histórico de checkpoints e contagem de recuperações. A interrupção deixou de transformar o job diretamente em falha terminal.

Cada atualização do orquestrador registra um `GenerationCheckpoint` limitado e durável com estágio, estado, progresso, tentativa, data e diagnósticos. Isso permite reconexão e auditoria do ponto alcançado.

A recuperação atual repete o pipeline a partir da solicitação preservada. Ela ainda não retoma a execução exatamente do arquivo candidato produzido no último estágio.

Também faltam:

- persistência dos arquivos candidatos após cada estágio;
- arquivos candidatos duráveis associados a cada checkpoint;
- lease do worker e heartbeat;
- reentrada idempotente por etapa;
- fila durável;
- reentrada idempotente a partir do último artefato candidato;
- continuidade da chamada do provedor com controle de custo;
- botão universal de reconexão ao último job na página de geração;
- promoção transacional de `candidate` para `certified` no job inicial;
- object storage para artefatos grandes;
- repositório compartilhado para múltiplas réplicas.

### 10.3 Arquitetura recomendada para não perder geração

Prioridade P0:

1. Criar `GenerationCheckpoint` canônico com `jobId`, `attemptId`, estágio, entrada, hashes, arquivos candidatos, diagnóstico, custo e timestamps.
2. Persistir checkpoints após Blueprint, geração, cada reparo, build e certificação.
3. Separar `candidateArtifact` de `certifiedArtifact`.
4. Tornar cada estágio idempotente por hash de entrada.
5. Criar lease e heartbeat; outro worker só assume após expiração.
6. Ao iniciar o servidor, reclassificar jobs ativos como `recovering`, não `failed`. Concluído para a instância local.
7. Retomar do último checkpoint válido; repetir apenas estágio incompleto ou não idempotente.
8. Manter todas as tentativas sob o mesmo job lógico, com IDs de tentativa separados.
9. Expor `resume`, `retry-stage` e `restart-from-blueprint` como decisões diferentes.
10. Fazer o frontend reconectar automaticamente usando último ID e token e mostrar o que foi preservado.

Prioridade P1:

- mover jobs para banco compartilhado;
- mover artefatos para object storage;
- usar fila durável com dead-letter queue;
- aplicar circuit breaker por provedor;
- registrar custo e orçamento antes de repetir IA;
- permitir download controlado do candidato falho para diagnóstico;
- criar retenção separada para diagnósticos, candidatos e certificados.

O Builder agora preserva a geração e volta a executá-la automaticamente após a queda, sem exigir um novo job do usuário. A próxima evolução é evitar recomputação ao persistir o candidato e retomar exatamente do último estágio idempotente.

## 11. Frontend do Builder

### Conectado

- home;
- autenticação;
- geração por prompt;
- upload e planejamento de Blueprint;
- progresso por polling;
- resultado, preview e download;
- dashboard;
- lista e detalhe de projetos;
- editor;
- histórico e restauração;
- regeneração incremental;
- configurações;
- preview restaurado por ID persistido.

### Parcial ou fora da navegação pública

- `CollaborationPage`, `DeploymentPage` e `MarketplacePage` existem no código, mas não são rotas de produto ativas;
- colaboração usada no workspace é baseada em API/persistência e polling, não em WebSocket operacional completo;
- o `GenerationService` inicializa Socket.IO, mas as atualizações de geração utilizam polling;
- a página `GeneratePage` retoma jobs recebidos por estado de rota, mas não reconecta automaticamente ao último job em toda abertura;
- existem contratos duplicados entre tipos do frontend, service e backend;
- `enhanceGeneration` no controller ainda responde sucesso sem executar melhoria real e não deve ser exposto como capacidade pronta.

## 12. O que está forte

1. Blueprint antes do código.
2. Identidade visual como contrato, não apenas cor.
3. Domínio e workflows mais ricos que CRUD universal.
4. Geração real de monorepo fullstack.
5. Certificação fechada antes da entrega.
6. Reparos guiados por diagnósticos reais.
7. Runtime e health check na certificação.
8. Segurança e auditoria de dependências.
9. Manifesto e lockfile reproduzíveis.
10. Regeneração que preserva edição do usuário.
11. Artefato único para resultado, ZIP e reconstrução do preview.
12. Exemplos certificados em múltiplos domínios.

## 13. Principais lacunas para uma entrega excelente

### P0 — antes de abertura pública

1. Retomada durável por checkpoint.
2. Prova do isolamento `container-required` em host com Docker ativo.
3. Banco persistente, backup e recuperação testados.
4. CI completa no commit candidato.
5. Teste de queda real durante geração, reparo e preview.
6. Reconexão automática do frontend ao job atual.
7. Remover ou bloquear endpoints que respondem sucesso sem implementação, especialmente enhancement.
8. Garantir que toda arquitetura declarada no Blueprint possua adaptador real; rejeitar Python/GraphQL/mobile quando não suportados.
9. Consolidar detectores de escopo duplicados do Cognitive Generation.
10. Registrar artefatos candidatos de falha sem publicar como prontos.

### P1 — qualidade e escala

1. Banco e fila compartilhados para múltiplos workers.
2. Object storage para bundles, screenshots e candidatos.
3. E2E semântico para prompts inéditos, não apenas domínios catalogados.
4. Mais jornadas de browser com escrita, relações e permissões.
5. Avaliação visual com fingerprint histórico por usuário/projeto.
6. Pipeline real de imagens com licença, origem e otimização.
7. Contrato único frontend/backend para jobs e diagnósticos.
8. Dividir o Cognitive Generation em estágios pequenos e testáveis.
9. Remover código histórico duplicado após migração dos consumidores.
10. Métricas de custo, tokens, cache e taxa de reparo por provedor.

### P2 — módulos posteriores

- deployment real por um provedor de cada vez;
- marketplace com cobrança e licenciamento reais;
- WebSocket de colaboração;
- recuperação de senha e e-mail;
- SSO e 2FA;
- adapters Python, PHP e Rust;
- mobile;
- GraphQL certificado.

## 14. Exemplos existentes

O repositório contém oito exemplos persistidos:

- Acervo Vivo Fullstack;
- Atelier Terra Landing;
- Festival Vivo Fullstack;
- Maison Aurea;
- Rota Clara Fullstack;
- Serena Clínica;
- Talento Vivo Fullstack;
- Viva Skincare.

Eles são úteis como portfólio e regressão visual, mas não substituem a matriz do commit de release. Cada exemplo publicado deve registrar prompt, hash do Builder, data, gates aprovados e limitações.

## 15. Recomendação de release

### Pode ser publicado como

“ORUS Builder TypeScript — geração de aplicações React/Express/Prisma orientada por Product Blueprint, com build, testes, runtime, segurança, CIG, preview e exportação certificados.”

### Ainda não deve ser anunciado como

- gerador universal de qualquer linguagem;
- deployment automático completo;
- marketplace operacional;
- plataforma enterprise pronta;
- geração impossível de perder após qualquer interrupção;
- garantia absoluta de zero erro;
- execução pública segura sem contêiner.

## 16. Próxima sequência recomendada

1. Implementar checkpoint e retomada durável.
2. Implementar reconexão automática do frontend.
3. Criar teste de interrupção e retomada em três estágios.
4. Executar isolamento Docker em CI/host de release.
5. Fechar endpoints incompletos e divergências de stack.
6. Rodar regressão, fullstack, navegador, carga e audit no commit candidato.
7. Gerar capturas reais dos exemplos.
8. Atualizar README e publicar a release TypeScript.

Depois desse fechamento, a expansão para novas linguagens pode usar um contrato de adapter sem duplicar Blueprint, CIG, workspace ou certificação.
