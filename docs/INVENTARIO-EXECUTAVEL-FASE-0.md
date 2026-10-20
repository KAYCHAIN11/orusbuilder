# Inventário Executável — Fase 0

Atualizado em: 2026-10-08  
Estado: concluído como baseline histórico  
Referência: `docs/PLANO-MESTRE-EXECUCAO-PRODUCAO.md`

Este documento preserva o diagnóstico encontrado no início da retomada. O estado corrente, as correções posteriores e as evidências vigentes estão no Plano Mestre e no checklist de release. Em 2026-10-08, a regressão limpa aprovou 48 arquivos e 262 testes backend, 6 arquivos e 20 testes frontend, lint, tipos e os dois builds, sem `.env` ou chave de IA.

## 1. Baseline reproduzido

| Verificação | Resultado | Observação |
| --- | --- | --- |
| Backend type-check | aprovado | `npm run type-check` |
| Frontend e backend lint | aprovado | `npm run lint` |
| Backend unitário e integração | aprovado | 14 suítes e 103 testes |
| Frontend | aprovado | 2 arquivos e 10 testes |
| Build do workspace | aprovado | frontend Vite e backend TypeScript |
| E2E do gerador | falha funcional localizada | 8 de 9 cenários aprovados; fluxo HTTP gerou projeto sem `/api/appointments` |
| Regressão do Blueprint após correção | aprovado | 6 testes; agendamentos e clientes extraídos como domínio explícito |

Os testes que iniciam subprocessos precisam ser executados fora do sandbox do Codex no Windows. Dentro do sandbox, `esbuild`, Vite e `BuildSystem` falham com `spawn EPERM`; a mesma execução fora do sandbox foi aprovada.

O build frontend permanece aprovado, mas emite avisos de sourcemap, CSS nesting, compatibilidade de `justify-content: end`, importação estática e dinâmica do mesmo módulo e bundle principal acima de 1 MB.

## 2. Comparação com `backend/arquivos-ts.txt`

O arquivo enviado é um inventário histórico de 2025 e não representa integralmente o estado atual.

| Medida | Quantidade |
| --- | ---: |
| Arquivos TypeScript registrados no inventário histórico | 192 |
| Arquivos TypeScript atuais em `backend/src` | 201 |
| Arquivos históricos ausentes no código atual | 2 |
| Arquivos atuais ausentes no inventário histórico | 11 |

### Ausentes no código atual

- `src/engines/cig-engine.ts`
- `src/engines/cognitive-generation-v3.ts`

### Adicionados depois do inventário

- `src/blueprint/product-blueprint.ts`
- `src/core/cig/cig-bridge.ts`
- `src/core/cig/engine-output-registry.ts`
- `src/engines/cig-engine-compat.ts`
- `src/engines/engine-registry.ts`
- `src/generation/domain-model-catalog.ts`
- `src/generation/prompt-scope-detector.ts`
- `src/generation/ui-component-catalog.ts`
- `src/generation/visual-intent.ts`
- `src/generation/visual-quality-auditor.ts`
- `src/trinity/deepseek-provider.ts`

## 3. Distribuição atual do backend

| Área | Arquivos TypeScript | Classificação inicial |
| --- | ---: | --- |
| blueprint | 6 | ativa |
| collaboration | 10 | implementação de domínio sem conexão uniforme às rotas |
| controllers | 8 | ativos, com armazenamento temporário em memória em partes |
| core | 21 | ativo e parcial; concentra o CIG histórico |
| deployment | 12 | `BuildSystem` ativo; demais partes exigem prova individual |
| engines | 18 | registro central ativo; algumas engines são fachadas paralelas |
| enterprise | 6 | registrado, sem fluxo público comprovado |
| generation | 17 | núcleo ativo |
| marketplace | 8 | implementação de domínio separada do controller público |
| middleware | 6 | ativo, com verificações de autorização ainda simuladas |
| models | 1 | ativo, insuficiente para persistência completa do workspace |
| monitoring | 10 | parcialmente consumido; várias métricas são simuladas |
| prompt | 10 | parcialmente ativo por meio da Prompt Engine |
| routes | 8 | ativas, com aliases, stubs e endpoints de teste |
| security | 10 | engine ativa no pipeline; módulos avançados exigem prova |
| system | 11 | ativo, incluindo fallback de banco em memória |
| templates | 12 | parcialmente ativo |
| testing | 8 | automação ativa; runner E2E amplo ainda incompleto |
| trinity | 14 | intenção visual ativa; provedores dependem de configuração |
| utils | 4 | suporte |

## 4. Registro real das engines

O `OrchestrationEngine` registra 16 componentes internos. O próprio orquestrador é apresentado separadamente por `getEngineStatus`, totalizando 17 estados. O header do servidor ainda declara 15 engines e está desatualizado.

| Registro | Obrigatória no registry | Uso comprovado no pipeline principal | Estado inicial |
| --- | --- | --- | --- |
| `cig` | sim | certificação | ativo |
| `learning` | não | registro do resultado | ativo no pipeline |
| `trinity` | sim | intenção visual | ativo |
| `prompt` | sim | análise da entrada com fallback | ativo |
| `cognitive-generation` | sim | geração e reparo | ativo |
| `template` | não | busca e renderização | ativo no pipeline |
| `collaboration` | não | não participa da geração | isolado do pipeline |
| `deployment` | não | não realiza deploy no pipeline | registrado, não comprovado no fluxo principal |
| `build-system` | sim | instalação, banco, testes e build | ativo |
| `monitoring` | não | grava métrica da geração | ativo de forma limitada |
| `testing` | não | materializa e registra testes | ativo no pipeline |
| `security` | não | scan antes da entrega | ativo no pipeline |
| `marketplace` | não | não participa da geração | isolado do pipeline |
| `enterprise` | não | não participa da geração | isolado do pipeline |
| `blueprint` | não | cria e valida Product Blueprint | ativo no pipeline |
| `ui-enhancement` | não | executado quando solicitado | ativo condicionalmente |
| `orchestration` | n/a | coordena o fluxo | ativo |

Há divergência entre `required: false` e o uso de `requireEngine()` para template, blueprint, testing, security, learning e monitoring. Essas dependências são efetivamente obrigatórias no caminho atual e precisam ter essa condição formalizada ou receber degradação real.

## 5. Caminhos públicos de geração

### Pipeline canônico atual

```text
GenerationController
  -> OrchestrationEngine.executeWorkflow
  -> Product Blueprint
  -> CognitiveGenerationEngine
  -> CodeGenerator
  -> TestingEngine
  -> BuildSystem
  -> reparo
  -> SecurityEngine
  -> CIG
  -> cache em memória
  -> preview, resultado e ZIP
```

### Entradas HTTP

| Endpoint | Ação | Observação |
| --- | --- | --- |
| `POST /api/v1/generation` | prompt | entrada principal atual |
| `POST /api/v1/generation/prompt` | prompt | alias |
| `POST /api/v1/generation/generate` | prompt | alias |
| `POST /api/v1/generation/blueprint/plan` | planejamento | cria Product Blueprint |
| `POST /api/v1/generation/blueprint` | Blueprint | encaminha para o mesmo fluxo canônico |
| `POST /api/v1/generation/:id/retry` | nova tentativa | depende do cache em memória |

O `ProjectController` também chama o orquestrador para geração vinculada a projeto. Esse caminho precisa compartilhar o mesmo serviço de job, certificação e persistência do `GenerationController`.

## 6. Duplicidades e separações encontradas

### CIG

- `core/cig/cig-protocol.ts` contém a implementação histórica principal.
- `engines/cig-engine-compat.ts` adapta o ciclo de vida das engines ao protocolo histórico.
- `generation/cig-validator.ts` executa validações durante a geração.
- A compatibilidade já delega ao protocolo central, mas os contratos e relatórios ainda estão distribuídos.

### Engines e módulos de domínio

Existem pares em `engines/*-engine.ts` e em diretórios de domínio para collaboration, deployment, monitoring, marketplace e security. O registro do orquestrador usa as engines. Controllers de collaboration, deployment e marketplace mantêm estado próprio em `Map` e não delegam às engines nem aos módulos de domínio correspondentes.

### Contratos

- `GenerationResult` existe no `CodeGenerator`, no `CognitiveGenerationEngine`, no provider de IA e em tipos auxiliares.
- O frontend mantém contratos próprios de geração, Blueprint e projeto.
- Diagnósticos de build, qualidade, CIG, segurança e controller não usam um envelope único.
- O estado do job é um objeto sem tipo persistido dentro do `GenerationController`.

Esses contratos não devem ser removidos diretamente. A Fase 1 deve criar um contrato canônico e adaptadores temporários, migrar consumidores e somente então eliminar estruturas redundantes.

## 7. Persistência e funcionalidades encontradas no baseline

As listas abaixo registram o estado anterior às fases de integração. Jobs, Blueprints, workspace, usuários e colaboração receberam persistência local atômica; editor, preview, histórico e regeneração passaram a consumir projetos reais. Deployment, marketplace e enterprise continuam fora da API pública por dependerem de provedores reais.

### Estado apenas em memória no início da retomada

- jobs, resultados e previews de geração;
- blueprints enviados;
- sessões e chat de colaboração;
- deployments do controller;
- listings e compras do marketplace.

### Frontend no início da retomada

- `BlueprintUploadPage.tsx`, `CollaborationPage.tsx`, `DeploymentPage.tsx` e `MarketplacePage.tsx` estão vazios.
- A sidebar aponta para collaboration, deployment e marketplace, mas o `App.tsx` não registra essas rotas.
- O editor inicia com uma árvore demonstrativa local.
- Existem rotas `/test/*` dentro da aplicação principal.

### Backend no início da retomada

- As rotas de projeto para arquivos, compartilhamento e configurações estão comentadas por ausência de implementação.
- A geração mantém aliases públicos e cache volátil.
- O servidor expõe vários endpoints `/test/*` e `/api/test/*`.
- Middlewares de autorização possuem verificações de projeto ainda não conectadas ao banco.
- Foram encontrados 65 arquivos com `TODO`, `Coming soon` ou indicação de implementação ausente; a maior concentração está em deployment, core, collaboration e engines.

## 8. Problema funcional encontrado e correção

O E2E HTTP pediu “sistema fullstack de agendamentos e clientes”, mas a classificação genérica não convertia esses substantivos em domínio explícito. O projeto compilava e recebia certificação, porém não expunha `/api/appointments`.

Correção aplicada:

- capacidades explícitas `Agendamentos` e `Clientes` adicionadas ao Product Blueprint;
- entidades `Appointment` e `Customer` passam a substituir o núcleo genérico em produtos genéricos, SaaS ou dashboards;
- rotas e telas `/appointments` e `/customers` tornam-se parte do plano;
- teste de regressão adicionado.

Essa falha comprova que build, CIG e segurança não são suficientes sem validação comportamental derivada do Blueprint.

## 9. Matriz inicial de módulo, consumidor e lacuna

| Módulo | Consumidor real | Evidência | Lacuna prioritária |
| --- | --- | --- | --- |
| Product Blueprint | Orchestrator, Cognitive Generation e UI | testes e E2E | ampliar domínio e versionar contrato |
| Cognitive Generation | Orchestrator e controller legado | 116 testes | unificar resultados e remover caminhos paralelos |
| Code Generator | Cognitive Generation e scripts | builds gerados | garantir capacidades além de CRUD |
| BuildSystem | Orchestrator, preview e testes | suíte deployment | isolamento e classificação ambiental |
| CIG | Orchestrator, templates e geração | testes CIG | relatório e decisão canônicos |
| UI Generator | Code Generator e previews | testes visuais e builds | conectar páginas especializadas às APIs |
| Backend Generator | Code Generator | build e E2E | modelos e casos de uso mais profundos |
| Testing Engine | Orchestrator | geração e execução registradas | navegador e aceite por capacidade |
| Security Engine | Orchestrator | gate de segurança | consolidar com módulos de security |
| Collaboration | rotas/controller próprios | apenas código e endpoints | delegar para engine e persistir |
| Deployment | rotas/controller próprios | apenas código e testes isolados | delegar para engine e validar adaptadores reais |
| Marketplace | rotas/controller próprios | dados demonstrativos | delegar para engine e persistir |
| Monitoring | middleware, UI enhancement e pipeline | métricas limitadas | remover medições simuladas |
| Enterprise | somente registry | estado de engine | definir consumidores ou retirar do release inicial |
| Workspace frontend | rotas principais | build e 10 testes | páginas vazias, editor demonstrativo e ações faltantes |

## 10. Próxima ordem de execução

1. Fazer controller de projeto e controller de geração consumirem o mesmo serviço de jobs.
2. Conectar persistência ao contrato `GenerationJobRepository` sem alterar o fluxo de geração.
3. Ampliar o gate do Product Blueprint para critérios de aceite e jornadas executáveis.
4. Ampliar as telas especializadas já conectadas à API com contratos tipados e comportamento próprio por capacidade.
5. Remover caminhos paralelos de geração e contratos duplicados restantes.
6. Tratar os avisos de bundle, CSS e sourcemap do frontend.

## 11. Fechamento do baseline e primeiro bloco P0

Entregas concluídas em 2026-10-06:

- E2E HTTP completo aprovado após a correção de domínio: geração, certificação, instalação, migração, seed, build, execução, API e download;
- contrato único de nomes de recursos aplicado ao Backend Generator, API Generator e UI Generator;
- pluralização consistente para rotas como `/api/companies`, `/api/activities` e `/api/work-orders`;
- Product Blueprint promovido a gate de implementação, verificando telas, rotas de API, capacidades prioritárias e ausência de fallback `Item` indevido;
- score do Quality Analyzer corrigido de `score` para `overallScore` no pipeline e no controller;
- armazenamento dos jobs extraído do `GenerationController` para `GenerationJobStore`, com repositório substituível;
- contratos canônicos de status, diagnóstico, resultado e certificação adicionados;
- origem real do score dos geradores especializados preservada, removendo o valor fixo aplicado a todos os arquivos.

Validação consolidada:

- lint frontend e backend: aprovado;
- TypeScript backend: aprovado;
- backend: 19 suítes e 116 testes aprovados;
- frontend: 2 arquivos e 10 testes aprovados;
- build frontend e backend: aprovado;
- E2E HTTP fullstack: aprovado em 341 segundos;
- banco de dados: nenhuma alteração de contrato ou nomenclatura realizada neste bloco.

## 12. Continuação: telas do Blueprint e certificação

O bloco seguinte conectou as páginas especializadas ao cliente de API existente, removeu métricas e ações simuladas e usou o catálogo de transições do backend. O auditor passou a seguir os componentes utilizados pelo roteador. Os controllers exigem certificação explícita para marcar o projeto pronto.

Verificação atual: 21 suítes e 125 testes backend aprovados; TypeScript e ESLint backend aprovados. As verificações de comportamento das telas usam código gerado com APIs controladas, e uma matriz cobre as rotas de CRM, clínica e loja. O resultado do E2E fullstack e as limitações estão no [relatório de integração](RELATORIO-INTEGRACAO-TELAS-BLUEPRINT.md).

O consumo de dados não equivale a entregar todas as capacidades de negócio. Checkout, permissões, relatórios especializados, comunicação e provedores externos ainda precisam de implementação e critérios de aceite próprios.

## 13. Continuação: contratos, persistência e comportamento gerado

Atualização de 2026-10-06; as seções anteriores preservam o baseline histórico.

- Os controllers de geração e projeto usam `GenerationExecutionService` para executar o workflow e normalizar os diagnósticos.
- O Product Blueprint possui contrato versionado, normalização de versões legadas e validação de referências.
- Os jobs usam repositório local persistido fora dos testes. Reinícios convertem execuções interrompidas em falhas explícitas; não retomam a geração automaticamente. Arquivos inválidos são preservados em cópia de recuperação.
- O cancelamento alcança a preparação do contexto e impede certificação de resultados tardios. A operação ainda depende de cada etapa respeitar o sinal para interromper trabalho em andamento.
- O CIG de compatibilidade e o validador de geração delegam ao serviço canônico; a consolidação de todos os usos históricos ainda não está concluída.
- Os projetos incluem manifesto de critérios de aceite e testes de rastreabilidade. Esses testes não comprovam a implementação de cada capacidade de negócio.
- O catálogo de domínio ganhou campos e workflows para operações, mensagens, relatórios, arquivos, assinaturas, integrações e pagamentos. Modelar essas entidades não implementa entrega de mensagens, provedores de pagamento ou integrações externas.
- Capacidades computadas possuem endpoint de resumo agregado. O repositório usa agregações transacionais sem limitar a leitura aos primeiros 1.000 registros. Os valores são somas e contagens genéricas, não fórmulas de negócio específicas.
- Edições via PUT também validam as transições de workflow. Transições inválidas retornam erro de validação; registros inexistentes retornam erro de recurso ausente.
- Páginas computadas respeitam a modalidade local ou API. O comportamento de cálculo e nova leitura tem regressão com código gerado e dependências controladas.
- O frontend do Builder carrega páginas sob demanda e restringe rotas de teste ao desenvolvimento. Avisos de CSS e sourcemap ainda precisam de tratamento.

Verificação deste bloco: regressão backend aprovada antes do fechamento do E2E; compilação, TypeScript e ESLint aprovados. O E2E fullstack direcionado passou em 445 segundos com zero reparos: geração, certificação, ZIP, reinstalação, Prisma, migração e seed temporários, build, servidor, JWT, persistência, transições e relatório agregado. Não houve migração do banco do Builder; os testes fullstack utilizam projetos e bancos temporários.

Um timeout anterior revelou que `SIGTERM` não encerrava toda a árvore de `npm` e Prisma no Windows. A automação agora encerra a árvore, recebe o sinal de cancelamento e o propaga para a validação de projeto. Há testes com subprocessos reais para timeout, cancelamento ativo e sinal já cancelado.

O histórico autenticado não depende mais de um `projectId` inexistente e não inclui jobs legados ou de outros usuários. Cada nova geração recebe uma credencial aleatória; somente o hash é persistido. Status, resultado, retry, cancelamento, preview e download exigem o proprietário autenticado ou a credencial. O preview troca a credencial por cookie `HttpOnly` e redireciona para uma URL limpa. Expiração, revogação e limites de consumo permanecem pendentes.

## 14. Continuação: variedade estrutural orientada pelo Blueprint

A tela inicial agora pode ser materializada diretamente do screen raiz do Product Blueprint. As páginas especializadas usam composições distintas para `catalog`, `calendar`, `conversation`, `checkout`, `stepper`, `timeline`, `billing`, `payment-operations`, `integration-hub` e `permission-matrix`. Cabeçalhos focados, imersivos e operacionais também deixam de ocupar sempre a mesma posição.

As composições de workflow preservam as ações de transição. Um build real do marketplace Aurora inicialmente bloqueou variáveis sem uso em carrinho, checkout e pedidos; a correção conectou as transições a esses layouts e removeu dependências geradas desnecessárias. A repetição do E2E de layout passou em 77 segundos com instalação e build limpos.

Essa evolução cria variação real de hierarquia e interação, mas não encerra a diversidade: formulários, telas de detalhe, ativos visuais e jornadas especializadas ainda precisam da mesma diferenciação orientada pelo Blueprint.

## 15. Baseline consolidado de 2026-10-07

O inventário histórico acima permanece útil para rastrear as lacunas encontradas, mas diversos itens já evoluíram:

- geração e projeto compartilham o mesmo serviço de execução e a mesma decisão de certificação;
- jobs, tokens opacos, expiração, revogação, ownership, histórico, diff, restauração, regeneração e colaboração de projeto possuem contratos e testes;
- preview, download e incorporação usam o manifesto do artefato certificado;
- páginas de Blueprint, projeto, editor, preview, autenticação e configurações estão conectadas;
- rotas simuladas de deployment e marketplace não são públicas;
- fila de geração possui concorrência e capacidade limitadas;
- segurança do projeto gerado e do subprocesso foi endurecida, com riscos residuais documentados no Plano Mestre.

Baseline atual reproduzido fora do sandbox do Codex:

| Verificação | Resultado |
| --- | --- |
| Lint frontend e backend | aprovado, zero warnings do ESLint |
| TypeScript frontend e backend | aprovado |
| Backend | 37 suítes e 219 testes aprovados |
| Frontend | 3 arquivos e 13 testes aprovados |
| Build de produção | frontend e backend aprovados |
| E2E HTTP fullstack direcionado | aprovado em 363 segundos |

O build frontend ainda informa dados de compatibilidade desatualizados e um `justify-content: end` originado em CSS de dependência do editor. O scanner de dependências interno avalia especificações e fontes, não advisories publicados. O runtime temporário é controlado por processo, diretório, ambiente, timeout e limite de saída, mas ainda requer isolamento por contêiner ou sandbox de sistema operacional antes da abertura pública irrestrita.
