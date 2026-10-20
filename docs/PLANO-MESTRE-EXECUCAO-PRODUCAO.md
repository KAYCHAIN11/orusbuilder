# Plano Mestre de Execução do ORUS Builder

Versão: 1.0  
Criado em: 2026-10-06  
Estado: ativo  
Escopo: tornar o ORUS Builder inteiro conectado, verificável e pronto para produção

## 1. Finalidade deste documento

Este é o manual operacional da evolução do ORUS Builder. Ele consolida o plano de integração das engines, o Product Blueprint, a geração visual, a geração fullstack, o CIG, o frontend do Builder, a certificação, o workspace e a preparação para publicação.

O documento deve responder, em qualquer retomada, às seguintes perguntas:

1. Qual é o estado comprovado do sistema?
2. Qual é a próxima entrega de maior prioridade?
3. Quais componentes existentes devem ser reutilizados?
4. Qual é o critério objetivo para considerar uma etapa concluída?
5. Que evidência comprova que a implementação funciona?

Este plano não substitui os documentos arquiteturais existentes. Ele define a ordem de execução e os critérios de aceite para transformar a arquitetura já criada em um produto integrado.

## 2. Princípios obrigatórios

1. Reutilizar engines, componentes, contratos e páginas existentes antes de criar novos módulos.
2. Criar código novo somente quando não houver implementação equivalente ou quando for necessário um adaptador explícito.
3. Não confundir arquivo existente, classe registrada ou resposta `success` com integração funcional.
4. O Product Blueprint é a fonte primária do projeto e deve orientar todos os artefatos gerados.
5. O CRUD é uma capacidade possível, não o modelo universal de produto.
6. Toda funcionalidade solicitada deve possuir rastreabilidade entre requisito, tela, componente, API, dados, teste e resultado de certificação.
7. Nenhum projeto é entregue antes de instalar, compilar, migrar, iniciar e passar pelos testes aplicáveis.
8. Falhas devem alimentar um ciclo limitado e auditável de diagnóstico, reparo e nova certificação.
9. A diversidade visual deve nascer da identidade e do plano de experiência, não de trocas superficiais de cor.
10. O código deve conter somente comentários tecnicamente úteis ao próprio código. Decisões, relatórios e explicações pertencem à documentação.
11. Alterações devem preservar trabalho existente e evitar reescritas amplas sem evidência de necessidade.
12. Toda declaração pública no README deve ser sustentada por teste reproduzível.

## 3. Documentos de referência

Este plano coordena os seguintes documentos:

- `docs/PLANO_INTEGRACAO_PRODUCT_BLUEPRINT.md`: contrato e integração do Product Blueprint.
- `docs/PLANO-INTEGRACAO-ENGINES.md`: reconhecimento e integração das engines.
- `docs/ARCHITECTURE-ENGINES.md`: arquitetura do Cognitive Generation Engine e do Orchestrator.
- `docs/ARCHITECTURE-COMPLETE.md`: inventário histórico das camadas do sistema.
- `docs/RELATORIO_ATUALIZACAO_GERADOR_2026-10-04.md`: alterações recentes do gerador.
- `docs/RELATORIO-MODIFICACOES-CHAT-2026-10-01.md`: histórico consolidado anterior.
- `README.md`: apresentação pública, limitada ao que estiver comprovado.

Em caso de divergência, o código executado e os testes reproduzíveis representam o estado real. Este documento representa a ordem de trabalho vigente.

## 4. Estado inicial comprovado

### 4.1 Capacidades validadas

- O pipeline gera projetos React e TypeScript com backend Express e Prisma quando o escopo exige fullstack.
- Gerações recentes instalaram dependências, compilaram frontend e backend, aplicaram migração SQLite e iniciaram os serviços.
- Autenticação JWT, cadastro, login e rota de identidade funcionaram em teste fullstack real.
- O pipeline assíncrono representa os estados de geração, validação, reparo, pronto e falha.
- O download fica condicionado ao estado certificado.
- O Product Blueprint já influencia entidades, capacidades, telas e intenção visual.
- O gerador visual já possui múltiplos shells, posições de ação, frames de conteúdo, cabeçalhos e navegação móvel.
- A landing page pode respeitar contagem explícita de seções e conteúdo especializado por domínio.
- Testes atuais cobrem Blueprint, intenção visual, geração de UI, backend, CIG e cenários E2E do gerador.

### 4.2 Lacunas confirmadas

- Algumas páginas especializadas usam estado local e dados demonstrativos em vez de APIs reais.
- O modelo de domínio gerado ainda pode ser mais superficial que as capacidades descritas no Blueprint.
- Existem rotas semânticas duplicadas entre páginas especializadas e CRUD genérico.
- Há pluralizações e nomes de recursos incorretos em alguns contratos gerados.
- O gerador de API pode receber recursos vazios e tentar materializar arquivos inválidos antes da deduplicação.
- O analisador de qualidade já registrou nota insuficiente sem bloquear a entrega.
- Documentos de arquitetura gerados ainda podem mencionar controladores e serviços genéricos sem refletir o domínio real.
- A composição visual variou, mas ainda precisa de uma matriz ampla que impeça repetição estrutural entre produtos distintos.
- Imagens, ilustrações e ativos de marca ainda não formam um pipeline completo e rastreável.
- Persistência durável de jobs, cancelamento e recuperação após reinício ainda precisam de validação completa.
- Partes de colaboração, deployment, marketplace, enterprise e seções do dashboard existem, mas ainda não possuem prova uniforme de integração de ponta a ponta.

## 5. Arquitetura de destino

```text
Prompt, documento ou projeto existente
                 |
                 v
Extração e normalização de requisitos
                 |
                 v
Product Blueprint versionado
  produto | domínio | identidade | jornadas | telas | dados | arquitetura | aceite
                 |
                 v
Plano de execução e matriz de rastreabilidade
                 |
                 v
Orquestração das engines existentes
  arquitetura | banco | backend | API | UI | testes | segurança | documentação
                 |
                 v
Workspace executável e editável
                 |
                 v
Instalação -> migração -> build -> testes -> runtime -> segurança -> CIG
                 |                                      |
                 | falha                                | aprovado
                 v                                      v
Diagnóstico -> reparo limitado -> nova certificação   entrega pronta
```

## 6. Responsabilidade dos componentes existentes

| Necessidade | Implementação existente a aproveitar | Resultado esperado |
| --- | --- | --- |
| Interpretação da entrada | `PromptEngine`, `PromptProcessor`, `RequirementsExtractor` | Requisitos normalizados com origem e confiança |
| Documentos e estrutura | `BlueprintEngine`, parsers e reconhecimento de padrões | Conteúdo documental incorporado ao Product Blueprint |
| Planejamento do produto | Product Blueprint e catálogos existentes | Capacidades, fluxos, telas, dados e critérios de aceite |
| Intenção e identidade | `TrinityEngine`, `VisualIntent`, catálogos de UI | Direção visual e experiência coerentes com a marca |
| Orquestração | `OrchestrationEngine` | Plano executado por dependências e contratos explícitos |
| Geração principal | `CognitiveGenerationEngine`, `CodeGenerator` | Código orientado pelo Blueprint, não por CRUD fixo |
| Arquitetura | `ArchitectureDesigner` | Arquitetura específica do produto e decisões rastreáveis |
| Persistência | `DatabaseDesigner` | Entidades, relações, regras e migrações coerentes |
| Backend | `BackendGenerator`, geradores de API | Casos de uso e contratos reais do domínio |
| Interface | `UIGenerator`, `UIComponentCatalog` | Telas conectadas, variadas e orientadas por jornadas |
| Testes | `TestGenerator`, `TestingEngine`, E2E runner | Testes materiais e execução real |
| Certificação | CIG, `BuildSystem`, `SecurityEngine` | Bloqueio de entregas inválidas e evidência auditável |
| Workspace | `Project`, páginas de projeto, editor, preview e chat | Blueprint vivo, código, histórico e operações incrementais |
| Entrega | deployment e empacotamento existentes | preview estável, exportação reproduzível e destinos validados |

Antes de criar um componente, a fase deve registrar qual implementação existente foi examinada e por que ela não atende ao contrato necessário.

## 7. Definições de pronto

### 7.1 Projeto gerado pronto

Um projeto só recebe estado `ready` quando:

- o Blueprint está válido e sem decisões críticas abertas;
- todos os requisitos prioritários possuem artefatos rastreáveis;
- as dependências são instaladas a partir de um ambiente limpo;
- migrations e seed aplicáveis são executados;
- type-check, lint, testes e build são aprovados;
- frontend e backend iniciam sem erro;
- health checks respondem;
- fluxos críticos são testados por API e navegador;
- autenticação e autorização respeitam o Blueprint;
- não há segredo embutido, vulnerabilidade crítica ou configuração insegura conhecida;
- o CIG aprova todos os gates obrigatórios;
- o relatório final informa capacidades, limitações e comandos de execução.

### 7.2 ORUS Builder pronto para produção

O Builder só é considerado pronto quando:

- o pipeline canônico funciona para landing page, frontend, backend e fullstack;
- projetos de domínios diferentes resultam em modelos, fluxos, telas e composições diferentes;
- o workspace permite criar, acompanhar, visualizar, editar, regenerar e exportar projetos;
- jobs sobrevivem a reinícios e podem ser cancelados ou retomados com segurança;
- erros reproduzíveis acionam diagnóstico e reparo sem mascarar falhas;
- os limites de uso, tempo e recursos estão aplicados;
- logs, métricas e trilhas de auditoria permitem diagnosticar cada geração;
- o processo de release é reproduzível em ambiente limpo;
- documentação pública e exemplos correspondem ao comportamento real.

## 8. Protocolo de trabalho para cada sessão

Toda sessão de implementação deve seguir esta sequência:

1. Ler este plano e localizar a primeira fase ativa sem bloqueio.
2. Ler os contratos e arquivos existentes relacionados à fase.
3. Executar os testes de baseline relevantes antes da alteração.
4. Registrar no plano qualquer divergência entre documentação e código real.
5. Implementar a menor integração completa que produza valor verificável.
6. Criar ou atualizar testes antes de declarar conclusão.
7. Executar validação proporcional ao risco: unidade, integração, geração real, build e runtime.
8. Atualizar o quadro de execução, evidências, riscos e próxima ação.
9. Não avançar para uma fase dependente se o gate atual falhar.

Formato mínimo de evidência:

```text
Data:
Fase e item:
Arquivos alterados:
Comandos executados:
Resultado:
Falhas restantes:
Próxima ação:
```

## 9. Fases de execução

## Fase 0 — Baseline, inventário e contratos reais

Objetivo: estabelecer uma visão verificável do código antes de ampliar funcionalidades.

### Entregas

- Inventário das engines, geradores, serviços, componentes frontend, rotas e consumidores.
- Grafo de dependências entre engines e estágios do pipeline.
- Classificação de cada módulo: ativo, parcial, simulado, duplicado, órfão ou legado.
- Catálogo dos testes existentes e das capacidades que realmente comprovam.
- Lista canônica de comandos de instalação, lint, type-check, testes, build e E2E.
- Relatório de divergências entre arquitetura documentada e implementação.

### Gate de saída

- Nenhum módulo crítico permanece sem proprietário, consumidor conhecido ou classificação.
- O baseline roda em ambiente limpo ou suas falhas estão registradas com causa reproduzível.

## Fase 1 — Contratos canônicos e fonte primária

Objetivo: impedir que engines diferentes operem com interpretações incompatíveis.

### Entregas

- Consolidar os tipos canônicos de `ProductBlueprint`, `ExecutionPlan`, `GenerationArtifact`, `Diagnostic`, `RepairAction` e `CertificationReport`.
- Versionar o schema do Blueprint e criar migração entre versões.
- Definir identificadores estáveis para requisitos, capacidades, fluxos, telas, componentes, dados, APIs e testes.
- Definir proveniência, confiança, premissas e perguntas abertas.
- Remover tipos paralelos somente depois de migrar seus consumidores.
- Implementar validação de entrada e saída nas fronteiras do pipeline.

### Gate de saída

- Prompt e documento convergem para o mesmo contrato.
- Todos os geradores críticos recebem a mesma versão do Blueprint.
- Contratos inválidos falham antes da escrita de código.

## Fase 2 — ExtractionCore e interpretação adaptativa

Objetivo: transformar entradas simples ou extensas em uma definição de produto executável.

### Entregas

- Integrar o método de extração aos parsers e engines existentes.
- Detectar produto, público, problema, valor, escopo, restrições e sucesso esperado.
- Extrair capacidades, regras, atores, permissões, estados, exceções e integrações.
- Suportar níveis Essencial, Produto e Completo sem reduzir a qualidade mínima.
- Gerar perguntas somente quando uma decisão crítica não puder ser inferida com segurança.
- Preservar trechos de origem e registrar inferências.

### Gate de saída

- Uma matriz de prompts simples, detalhados e documentos produz Blueprints coerentes e distintos.
- Requisitos contraditórios, ausentes ou inseguros são identificados antes da geração.

## Fase 3 — Domain Model Engine e lógica de negócio

Objetivo: substituir entidades genéricas por um modelo de domínio fiel ao produto.

### Entregas

- Mapear capacidades para agregados, entidades, valores, eventos e serviços de domínio.
- Inferir campos, relações, cardinalidade, unicidade, índices e regras de transição.
- Modelar papéis, propriedade, organização e políticas de acesso quando aplicáveis.
- Separar CRUD, workflow, cálculo, integração, automação e conteúdo.
- Validar nomenclatura, singular, plural, rotas e colisões.
- Gerar dados de demonstração coerentes com o domínio.

### Gate de saída

- Produtos diferentes não recebem automaticamente `Task`, `Project` ou `Item`.
- As capacidades prioritárias possuem modelo de dados suficiente para funcionar.
- Nenhum recurso vazio ou nome inválido chega ao gerador de API.

## Fase 4 — Planejamento de produto, experiência e execução

Objetivo: determinar o que será criado antes de produzir arquivos.

### Entregas

- Criar jornadas principais, decisões, exceções e resultados esperados.
- Converter capacidades em mapa de telas e wireframes estruturais.
- Definir estados de carregamento, vazio, erro, sucesso e permissão.
- Criar inventário de componentes e eventos por tela.
- Produzir plano técnico por dependências e responsável de engine.
- Criar matriz de rastreabilidade e cobertura prevista.
- Expor o plano no frontend para revisão quando necessário.

### Gate de saída

- Nenhum gerador começa antes de existir um plano validado.
- Cada arquivo planejado possui motivo e vínculos com o Blueprint.

## Fase 5 — Identidade visual e sistema de composição

Objetivo: gerar experiências que façam sentido para a marca e para o tipo de produto.

### Entregas

- Consolidar direção de marca, personalidade, voz, paleta, tipografia, densidade, forma e movimento.
- Expandir shells, navegação, grids, hierarquia, headers, ações, painéis, detalhes e fluxos focados.
- Selecionar composição por jornada, densidade, dispositivo e contexto, não por aleatoriedade isolada.
- Aplicar tokens semânticos e componentes acessíveis.
- Criar pipeline de imagens e ativos com fonte, licença, fallback e otimização.
- Criar fingerprints estruturais e detectar repetição excessiva entre gerações.
- Validar responsividade, contraste, teclado, foco e conteúdo localizado.

### Gate de saída

- A matriz visual demonstra variedade estrutural entre pelo menos seis classes de produto.
- Pedidos com identidade explícita mantêm coerência entre todas as telas.
- A auditoria visual bloqueia composições genéricas incompatíveis com o Blueprint.

## Fase 6 — Geração canônica de código

Objetivo: eliminar caminhos paralelos e garantir que todos os artefatos nasçam do mesmo plano.

### Entregas

- Implementar completamente `PROMPT_TO_DEPLOY` e `BLUEPRINT_TO_DEPLOY` sobre o mesmo núcleo.
- Fazer `CognitiveGenerationEngine`, `OrchestrationEngine` e `CodeGenerator` compartilharem contratos e estados.
- Conectar `ArchitectureDesigner`, `DatabaseDesigner`, `BackendGenerator`, gerador de API, `UIGenerator` e `TestGenerator` ao Blueprint completo.
- Substituir decisões fixas de perfil CRUD por estratégias de capacidade.
- Garantir ordem determinística, idempotência e deduplicação de arquivos.
- Gerar manifestos de arquivos, dependências e vínculos de rastreabilidade.

### Gate de saída

- Não existe caminho público que ignore o Blueprint.
- A mesma entrada e configuração produzem plano reproduzível.
- Nenhum arquivo inválido é silenciosamente sobrescrito ou descartado.

## Fase 7 — Aplicações realmente funcionais

Objetivo: conectar cada tela gerada a casos de uso, APIs e persistência reais.

### Entregas

- Substituir dados locais demonstrativos por clientes de API tipados.
- Gerar casos de uso específicos para workflows, cálculos, dashboards e automações.
- Conectar formulários, filtros, buscas, paginação, relacionamentos e uploads quando solicitados.
- Implementar autenticação, autorização, propriedade e papéis derivados do Blueprint.
- Gerar tratamento de erro, optimistic update somente quando seguro e recuperação de sessão.
- Remover duplicidade entre página especializada e CRUD genérico.
- Testar jornadas completas pelo navegador e pela API.

### Gate de saída

- Ações visíveis na interface persistem e retornam após recarregar a página.
- Fluxos críticos funcionam com usuário real, permissões e dados relacionados.
- Uma tela especializada nunca é aprovada se operar somente com `useState` demonstrativo.

## Fase 8 — Agente de execução, diagnóstico e autorreparo

Objetivo: entregar projetos funcionais sem transferir erros previsíveis ao usuário.

### Entregas

- Executar instalação, geração de cliente, migrations, seed, type-check, lint, testes, build e smoke runtime.
- Normalizar diagnósticos por fase, arquivo, severidade e provável origem.
- Relacionar falhas ao requisito e ao gerador responsável.
- Aplicar reparos mínimos, registrar diff e repetir somente os gates afetados.
- Limitar tentativas, tempo, disco, memória e processos.
- Preservar artefatos de falha para investigação.
- Diferenciar falha de código, ambiente, provedor e requisito.

### Gate de saída

- Nenhuma falha conhecida é convertida em entrega `ready`.
- O reparo corrige erros reais sem apagar código válido não relacionado.
- Falhas não reparáveis geram relatório acionável, sem falso sucesso.

## Fase 9 — CIG único e certificação obrigatória

Objetivo: transformar qualidade em uma barreira técnica única e auditável.

### Entregas

- Unificar protocolo antigo e implementação ativa do CIG.
- Definir gates obrigatórios e informativos por tipo de projeto.
- Bloquear notas abaixo do mínimo, independentemente de build aprovado.
- Certificar cobertura do Blueprint, comportamento, segurança, acessibilidade e execução.
- Assinar o relatório com versões de ferramentas, ambiente, comandos e hashes dos artefatos.
- Exibir ao usuário os resultados em linguagem clara.

### Gate de saída

- Existe uma única decisão canônica de certificação.
- Nenhum controller, script ou endpoint pode contornar o gate de entrega.

## Fase 10 — Workspace, manutenção e regeneração incremental

Objetivo: permitir que o ORUS crie e também mantenha o projeto.

### Entregas

- Persistir Blueprint, versões, decisões, arquivos, vínculos e histórico de geração.
- Implementar jobs duráveis, recuperação após reinício, cancelamento e retomada.
- Detectar alterações do usuário e preservar regiões não gerenciadas.
- Planejar regenerações por impacto em vez de recriar o projeto inteiro.
- Exibir diff antes de alterações amplas.
- Integrar editor, preview, chat, atividades e histórico ao projeto real.
- Definir importação e reanálise de projetos existentes.

### Gate de saída

- Um projeto pode evoluir por novo prompt sem perder mudanças independentes.
- O usuário consegue rastrear por que cada arquivo mudou.

## Fase 11 — Frontend completo do ORUS Builder

Objetivo: tornar toda a capacidade do backend acessível com boa usabilidade.

### Entregas

- Consolidar onboarding, criação por prompt e upload de documentos.
- Criar revisão visual do Blueprint, perguntas e aprovação do plano.
- Exibir progresso real por engine, logs resumidos e tentativas de reparo.
- Estabilizar preview incorporado com isolamento e mensagens de erro úteis.
- Completar workspace, editor, árvore, chat, atividades, testes, versões e exportação.
- Conectar seções existentes do dashboard a dados reais.
- Corrigir ESLint, configuração de ambiente, testes e ações incompletas.
- Validar desktop, tablet, mobile, teclado e leitores de tela.

### Gate de saída

- Todas as ações principais do frontend possuem resultado backend verificável.
- Não existem botões de produção sem ação, dados falsos ou estados silenciosos.

## Fase 12 — Segurança e isolamento

Objetivo: executar código gerado sem comprometer o Builder ou os usuários.

### Entregas

- Isolar instalação, build, testes e runtime por job.
- Aplicar allowlists, limites de recursos, timeout e encerramento de processos descendentes.
- Validar caminhos, arquivos, uploads e extrações contra traversal.
- Implementar gestão de segredos, rotação e separação por ambiente.
- Auditar dependências, licenças, autenticação, autorização, CORS e headers.
- Criar threat model do Builder e dos projetos gerados.
- Aplicar retenção e descarte seguro de artefatos.

### Gate de saída

- Testes de abuso e isolamento são aprovados.
- Nenhum segredo real aparece no código, ZIP, log ou preview.

## Fase 13 — Preview, exportação e deployment

Objetivo: garantir que o resultado certificado seja exatamente o que o usuário recebe.

### Entregas

- Unificar o artefato usado em preview, download e deploy.
- Implementar lifecycle estável do preview e limpeza segura.
- Validar ZIP em diretório limpo antes da liberação.
- Gerar README do projeto, `.env.example`, comandos e requisitos.
- Conectar destinos de deployment existentes somente após validação individual.
- Registrar URL, versão, logs e rollback quando houver publicação.

### Gate de saída

- O ZIP reinstalado reproduz o projeto certificado.
- Preview e artefato exportado correspondem ao mesmo manifesto.

## Fase 14 — Observabilidade, confiabilidade e desempenho

Objetivo: operar o Builder com diagnóstico e previsibilidade.

### Entregas

- Adotar correlação por geração, projeto, engine e tentativa.
- Medir duração, fila, falhas, reparos, custo, cache e uso de recursos.
- Definir SLOs para API, geração, preview e recuperação de jobs.
- Aplicar retry apenas a operações idempotentes e falhas transitórias.
- Testar concorrência, interrupção, reinício e degradação de provedores.
- Criar alertas e painéis operacionais mínimos.

### Gate de saída

- Uma falha de geração pode ser localizada sem reproduzir manualmente toda a sessão.
- Carga esperada e limites publicados são sustentados por testes.

## Fase 15 — Matriz final de testes e release

Objetivo: comprovar o produto em cenários diversos antes da publicação.

### Cenários mínimos de geração

1. Landing page editorial com quatro seções.
2. Site institucional com conteúdo e captação.
3. Dashboard analítico sem CRUD dominante.
4. CRM com pipeline e atividades.
5. Clínica com agenda, pacientes, permissões e dados relacionados.
6. Operação de campo com ordens, técnicos, ativos e inspeções.
7. Marketplace com catálogo, busca e fluxo transacional simulado de forma segura.
8. Plataforma de conteúdo com papéis, publicação e moderação.
9. Prompt curto e ambíguo.
10. Documento detalhado com requisitos e arquitetura.
11. Regeneração incremental de projeto alterado pelo usuário.
12. Falhas intencionais de dependência, build, teste, runtime e segurança.

### Dimensões obrigatórias

- fidelidade ao Blueprint;
- diversidade estrutural e visual;
- persistência e relações;
- autenticação e autorização;
- responsividade e acessibilidade;
- build limpo e runtime;
- diagnóstico e reparo;
- exportação reproduzível;
- segurança e isolamento;
- desempenho e recuperação.

### Gate de saída

- Todos os cenários críticos passam em máquina limpa.
- Falhas esperadas são bloqueadas e explicadas.
- Evidências, capturas reais e projetos de demonstração podem sustentar o README.

## Fase 16 — Documentação, open source e publicação

Objetivo: publicar uma versão honesta, executável e sustentável.

### Entregas

- Atualizar README em português com proposta, arquitetura, exemplos reais e início rápido verificado.
- Publicar capturas reais dos sistemas gerados e indicar os prompts correspondentes.
- Revisar `CONTRIBUTING`, `SECURITY`, licença, setup de provedores e troubleshooting.
- Documentar arquitetura atual, extensão de engines e contratos públicos.
- Criar changelog da retomada e notas da versão.
- Configurar CI com lint, type-check, testes, build, E2E seletivo e segurança.
- Definir processo de issues, releases e suporte da comunidade.

### Gate de saída

- Um colaborador novo consegue instalar, testar e gerar um projeto usando apenas a documentação.
- Todas as afirmações do README apontam para comportamento ou evidência verificável.

## Fase 17 — Expansão de linguagens e stacks

Objetivo: suportar Python, PHP, Rust e outras stacks sem duplicar o núcleo cognitivo.

Esta fase somente começa depois da estabilização completa do pipeline TypeScript.

### Entregas

- Definir contrato de adaptador de stack.
- Separar planejamento agnóstico de linguagem da materialização técnica.
- Implementar um adaptador por vez com instalação, lint, testes, build e segurança próprios.
- Manter a mesma rastreabilidade, CIG e definição de pronto.

### Gate de saída

- Cada stack possui paridade funcional declarada e matriz de testes própria.
- A inclusão de uma linguagem não introduz caminhos alternativos de certificação.

## 10. Backlog crítico inicial

Ordem obrigatória para iniciar a implementação:

| Prioridade | Item | Fase | Estado atual |
| --- | --- | --- | --- |
| P0 | Inventariar engines, consumidores e caminhos públicos de geração | 0 | concluído no inventário executável |
| P0 | Definir contrato canônico e fluxo único do Product Blueprint | 1 | concluído no pipeline público |
| P0 | Impedir recursos vazios e corrigir nomenclatura/pluralização | 3 | concluído e coberto por regressão |
| P0 | Fazer telas especializadas consumirem APIs reais | 7 | concluído para as capacidades certificadas |
| P0 | Enriquecer modelos com campos, relações e workflows do Blueprint | 3 e 7 | concluído para a matriz TypeScript atual |
| P0 | Bloquear entrega com nota de qualidade abaixo do mínimo | 9 | concluído |
| P0 | Unificar CIG antigo e ativo | 9 | concluído por adaptadores canônicos |
| P1 | Eliminar rotas duplicadas entre experiência e CRUD | 6 e 7 | concluído no gerador ativo |
| P1 | Tornar jobs duráveis e recuperáveis | 10 | concluído para instância única, incluindo candidato íntegro por checkpoint; repositório distribuído exigido antes de múltiplas réplicas |
| P1 | Concluir runner E2E com navegador e isolamento | 8 e 12 | navegador e isolamento Docker concluídos localmente; job dedicado mantido na CI |
| P1 | Estabilizar preview incorporado | 11 e 13 | concluído com artefato certificado e acesso protegido |
| P1 | Validar diversidade estrutural em matriz de produtos | 5 e 15 | concluído com doze fingerprints e pelo menos seis estruturas materiais |
| P2 | Conectar dashboard, colaboração, deployment e módulos avançados | 11 a 14 | dashboard, workspace e colaboração concluídos; deployment, marketplace e enterprise indisponíveis sem provedor real |
| P2 | Pipeline de ativos visuais e imagens | 5 | ativos locais SVG e manifesto de origem/licença concluídos; provedores externos permanecem fora do release |
| P3 | Adaptadores Python, PHP e Rust | 17 | futuro |

## 11. Métricas de acompanhamento

- Cobertura de requisitos prioritários: meta 100%.
- Projetos certificados que reinstalam em ambiente limpo: meta 100%.
- Fluxos críticos aprovados em navegador e API: meta 100%.
- Falsos estados `ready`: meta 0.
- Recursos ou arquivos gerados com nome inválido: meta 0.
- Telas de produção com dados demonstrativos locais: meta 0.
- Vulnerabilidades críticas conhecidas: meta 0.
- Repetição de fingerprint estrutural em produtos distintos: limite a definir após baseline, com justificativa para exceções.
- Tempo e taxa de reparo: medir antes de fixar metas.
- Cobertura de módulos do Builder por integração real: meta 100% para release.

## 12. Registro de execução

O registro abaixo deve ser atualizado ao final de cada bloco de trabalho.

| Data | Fase | Entrega | Evidência | Estado | Próxima ação |
| --- | --- | --- | --- | --- | --- |
| 2026-10-06 | Preparação | Plano Mestre criado a partir dos planos existentes e dos testes reais | Este documento | concluído | Iniciar inventário executável da Fase 0 |
| 2026-10-06 | Fase 0 | Baseline, inventário histórico, engines, entradas de geração e lacunas críticas mapeados | `docs/INVENTARIO-EXECUTAVEL-FASE-0.md`; lint; type-check; 116 testes backend; 10 testes frontend; build | concluído | Prosseguir com a consolidação arquitetural da Fase 1 |
| 2026-10-06 | Fase 1 | Contratos canônicos de job, diagnóstico, resultado e certificação; cache extraído para `GenerationJobStore` com repositório substituível | `generation-contracts.ts`; `generation-job-store.ts`; testes unitários e controller | em andamento | Conectar o controller de projeto ao mesmo serviço e adicionar persistência |
| 2026-10-06 | Fase 3 | Extração de domínio, contrato plural de recursos e gate de cobertura do Product Blueprint integrados | E2E HTTP fullstack aprovado; `product-implementation-auditor.ts`; 19 suítes backend aprovadas | em andamento | Cobrir critérios de aceite e jornadas além de rotas e entidades |
| 2026-10-06 | Fase 4 | Score real do gerador propagado e leitura de `overallScore` corrigida | Type-check, testes de geradores e build completo | em andamento | Tornar a análise de qualidade consciente de projeto e definir limiares confiáveis |
| 2026-10-06 | Fases 7 e 9 | Telas do Blueprint consultam recursos reais; estados de workflow usam as transições do catálogo; métricas artificiais e controles sem operação removidos; auditor segue módulos alcançáveis pela rota | 125 testes backend; lint e TypeScript aprovados; E2E HTTP fullstack aprovado em 376 s; `RELATORIO-INTEGRACAO-TELAS-BLUEPRINT.md` | em andamento | Implementar e testar critérios de aceite próprios de cada capacidade |
| 2026-10-06 | Fase 1 | Controllers de projeto e geração exigem `deployment.ready === true` para aceitar uma entrega | `project-controller.test.ts` | em andamento | Extrair a execução compartilhada e unificar a montagem dos resultados |
| 2026-10-06 | Fase 1 | Execução compartilhada nos dois controllers; Product Blueprint versionado e normalizado; diagnósticos unificados | `generation-execution-service.ts`; `product-blueprint-contract.ts`; testes de contrato | em andamento | Remover duplicidades restantes e validar todos os caminhos públicos |
| 2026-10-06 | Fase 9 | Adaptadores de CIG delegam ao serviço canônico; manifesto de critérios de aceite acompanha o projeto | `cig-certification-service.ts`; `.orus/acceptance-plan.json`; testes de rastreabilidade | em andamento | Converter rastreabilidade estrutural em testes reais de cada capacidade |
| 2026-10-06 | Fase 10 | Jobs persistidos em arquivo, recuperação de interrupções, preservação de arquivo corrompido e cancelamento protegido contra conclusão tardia | `generation-job-store.test.ts`; `generation-execution-service.test.ts` | em andamento | Validar concorrência, limites, ownership, retenção e retomada; arquivo local não é fila distribuída |
| 2026-10-06 | Fases 3 e 7 | Catálogo ampliado; resumos agregados na API sem limite de 1.000 registros; relatórios locais compatíveis; transições validadas também em PUT | Testes do código gerado; E2E HTTP fullstack sem reparos aprovado em 445 s | validando | Jornadas de navegador e regras especializadas |
| 2026-10-06 | Fases 8 e 10 | Cancelamento propagado à preparação, workflow e árvores de processos de instalação, teste e build; timeouts encerram subprocessos no Windows | `command-execution.test.ts`; `build-system.test.ts`; `generation-execution-service.test.ts` | em andamento | Validar cancelamento HTTP durante instalação real e política de recursos por job |
| 2026-10-06 | Fase 12 | E2E ampliado valida JWT, conflitos, persistência após nova leitura, transições via PUT e PATCH e relatórios agregados | `generator-build.e2e.ts`: geração, certificação, ZIP, instalação limpa, Prisma, seed, build e API; zero reparos | em andamento | Adicionar navegador real, isolamento e matriz de produtos completa |
| 2026-10-06 | Fase 10 | Histórico deixou de exigir `projectId` e passou a retornar somente jobs com proprietário autenticado explícito | `generation-routes.test.ts`; `generation-controller.test.ts` | em andamento | Proteger status, resultado, preview e download de jobs anônimos com credencial opaca |
| 2026-10-06 | Fases 5 e 7 | Telas materializam composição por layout do Blueprint: catálogo, calendário, conversa, checkout, timeline, pagamentos, integrações e permissões | Build limpo do marketplace Aurora em instalação nova; `ui-generator.test.ts`; runtime de agenda | em andamento | Ampliar a matriz visual em navegador e eliminar padrões restantes nos formulários e detalhes |
| 2026-10-06 | Fases 10 e 14 | Jobs públicos recebem token aleatório armazenado somente como hash; proprietário autenticado ou token controla status, resultado, cancelamento, retry, preview e download | `generation-access.middleware.ts`; testes de proprietário, token ausente, incorreto, correto e cookie do preview | em andamento | Expiração, revogação, limites por usuário/IP e política de retenção |
| 2026-10-06 | Fase 13 | Páginas do Builder carregadas sob demanda; rotas de teste frontend restritas ao modo de desenvolvimento | Build frontend aprovado no bloco anterior; bundle principal reduzido de aproximadamente 1.199 kB para 668 kB | em andamento | Tratar avisos de CSS e sourcemap; conectar páginas e editor pendentes |
| 2026-10-06 | Fases 10 e 11 | Gerações certificadas podem ser incorporadas ao workspace; projetos e arquivos possuem ownership, persistência local atômica, listagem real, edição, renomeação, duplicação, exclusão e exportação ZIP | `project.controller.ts`; `project.routes.ts`; `project.service.ts`; `EditorPage.tsx`; `ProjectPage.tsx`; testes de isolamento e operações de arquivo | em andamento | Conectar histórico, diff, regeneração incremental, chat e atividade a dados reais |
| 2026-10-06 | Fases 8 e 9 | Manifests npm são normalizados no limite do orquestrador; o otimizador textual não altera saídas já validadas; CIG e BuildSystem bloqueiam nomes de pacote inválidos antes do npm | regressões de CodeGenerator, CIG e preflight de workspace; type-check aprovado | validando | Concluir E2E fullstack e ampliar o gate para comandos e versões de dependência |
| 2026-10-07 | Fases 11 e 14 | Cadastro, login, refresh, logout com revogação, perfil e troca de senha usam o serviço JWT existente e um repositório local atômico; frontend recebeu fluxo real de acesso e configurações | `auth.controller.ts`; `authentication-service.ts`; `authentication.middleware.ts`; `user-store.ts`; `AuthPage.tsx`; jornadas de controller e rotas aprovadas; lint, type-check e build frontend aprovados | em andamento | Adicionar recuperação de senha com provedor de e-mail e política de sessão por dispositivo |
| 2026-10-07 | Fases 5 e 9 | Contrato visual passou a certificar explicitamente shell, posicionamento de ação, padrão de experiência e visualização primária materializados na interface | `visual-quality-auditor.ts`; `ui-generator.ts`; suíte do UI Generator aprovada | validando | Executar a matriz visual em navegador e registrar fingerprints por categoria de produto |
| 2026-10-07 | Fases 8, 10 e 12 | Fluxo HTTP fullstack preserva a credencial opaca até o estado `ready` e foi aprovado de ponta a ponta sem reparos: geração, CIG, download, instalação limpa, Prisma, seed, build, servidor e operações reais da API | `generator-build.e2e.ts`: cenário `Builder HTTP generation and download` aprovado em 388 s; `generation.controller.ts`; `generation-job-store.test.ts` | concluído | Ampliar a matriz para navegador real e produtos estruturalmente distintos |
| 2026-10-07 | Regressão | Backend completo aprovado após autenticação, workspace, contrato visual e preservação de acesso dos jobs | 28 suítes e 177 testes aprovados; backend lint e TypeScript aprovados; frontend 2 suítes e 10 testes, lint, TypeScript e build aprovados | concluído | Avançar para histórico, diff e regeneração incremental |
| 2026-10-07 | Fase 10 | Workspace registra histórico limitado de conteúdo, renomeação, exclusão e duplicação, incluindo estado anterior e posterior para diff; endpoints protegidos expõem revisões e o frontend consome o contrato real | `project.controller.ts`; `project.routes.ts`; `project.service.ts`; `project-controller.test.ts` | em andamento | Exibir o diff no editor e usar revisões como limite de segurança da regeneração incremental |
| 2026-10-07 | Fases 10 e 11 | Editor exibe histórico e diff lado a lado; regeneração incremental reconstrói o Product Blueprint, certifica a nova geração e preserva caminhos editados, renomeados, duplicados ou excluídos pelo usuário | `EditorPage.tsx`; `project.controller.ts`; `project.routes.ts`; testes de merge preservando edição do usuário | em andamento | Adicionar seleção explícita de arquivos, conflitos de merge e restauração de revisão |
| 2026-10-07 | Fase 14 | Middleware de autorização deixou de permitir projetos indiscriminadamente e consulta ownership real do workspace | `authorization.middleware.ts`; `project-routes.test.ts` com proprietário e usuário externo | concluído | Evoluir para colaboradores e permissões granulares |
| 2026-10-07 | Regressão | Histórico, diff, autorização real e regeneração incremental aprovados | 29 suítes e 178 testes backend; frontend 10 testes, lint, TypeScript e build de produção aprovados | concluído | Validar regeneração incremental com geração real em cenário E2E |
| 2026-10-07 | Fases 10 e 11 | Página do projeto deixou de exibir usuários, comentários e atividades demonstrativas; presença usa o usuário autenticado e atividades/estatísticas derivam das revisões reais do workspace | `ProjectPage.tsx`; `Chat.tsx`; `project.service.ts` sem endpoints legados inexistentes | em andamento | Persistir chat e presença no backend antes de declarar colaboração completa |
| 2026-10-07 | Fases 8, 9, 12, 13 e 14 | Falha fechada sem artefato, fila limitada, autenticação tipada, segurança do projeto gerado, cobertura honesta do scanner, APIs públicas sem módulos simulados e paridade do artefato certificado | `npm run verify`: 37 suítes/219 testes backend, 13 frontend e builds; `npm run verify:e2e`: fullstack HTTP aprovado em 363 s | validando | Navegador real, isolamento por SO, advisories de dependências e carga operacional |
| 2026-10-07 | Fases 5 e 15 | Matriz real em Chrome para sete classes de produto, desktop e mobile, com axe WCAG A/AA, overflow, erros de página e fingerprints de composição | `generated-browser.e2e.ts`: 8 casos aprovados em 283 s; sete fingerprints visuais únicos e pelo menos seis composições materiais distintas | concluído | Manter a matriz como gate seletivo e ampliar jornadas interativas por capacidade |
| 2026-10-07 | Fases 8 e 12 | Certificador limita arquivos, bytes de origem, tamanho do workspace, quantidade de arquivos, heap Node, saída, tempo e árvores de processos; instalações ignoram scripts implícitos | `build-system.test.ts`: limites de entrada/workspace, `--ignore-scripts`, timeout, cancelamento e runtime; 21 testes focados aprovados | validando | Adicionar contêiner ou sandbox de SO antes da execução pública irrestrita |
| 2026-10-07 | Fases 12 e 15 | Dependências do Builder e do projeto gerado recebem gate reproduzível de advisories; DOCX não depende mais de `mammoth`; projetos certificados incluem lockfile e reinstalam por `npm ci` | `npm audit --omit=dev`: zero vulnerabilidades do Builder; E2E fullstack aprovado em 503 s com audit moderado+, lockfile, `npm ci --ignore-scripts`, Prisma, testes, build, runtime e API | concluído | Registrar ambiente e versões completas no relatório canônico de certificação |
| 2026-10-07 | Fases 3, 7 e 9 | Critérios de aceite passaram a executar comportamentos próprios de agenda, mensagens, relatórios, integrações, conteúdo, pagamentos, papéis e capacidades personalizadas; agenda bloqueia conflito de horário e papéis possuem escopo e permissões | `testing-engine.test.ts`; `product-implementation-auditor.test.ts`; `backend-generator.test.ts`; `product-blueprint.test.ts`; E2E fullstack aprovado em 405 s | concluído | Evoluir adaptadores de integrações externas somente quando houver provedores configurados |
| 2026-10-07 | Fase 10 | Regeneração incremental preserva histórico Prisma, compara schemas, bloqueia mudanças destrutivas e produz migração aditiva determinística validada sobre banco temporário novo | `build-system.test.ts`; `project-incremental.e2e.ts`: caso válido aprovado em 185 s com migração `orus_*` e arquivo manual preservado | concluído | Exigir decisão explícita para qualquer evolução destrutiva de dados |
| 2026-10-07 | Fases 10 e 14 | Fila passou a medir envios, resultados, cancelamentos, recusas, timeout, espera e execução p50/p95; health expõe SLOs; retenção remove somente jobs terminais expirados | `generation-execution-service.test.ts`; `generation-job-store.test.ts`; `api-routes.test.ts` | validando | Executar carga controlada e calibrar SLOs com baseline reproduzível |
| 2026-10-07 | Fase 11 | Portfólio do Builder possui página real, carregamento, navegação, exclusão e sincronização com o estado; aliases de teste refletem o Vite | `ProjectsPage.test.tsx`; frontend com 4 arquivos e 15 testes | concluído | Completar conflitos de regeneração e colaboração no workspace |
| 2026-10-07 | Regressão | Estado integrado aprovado após aceite por capacidade, migrações incrementais, métricas, retenção e portfólio | `npm run verify`: 39 suítes e 236 testes backend; 4 arquivos e 15 testes frontend; lint, TypeScript e builds aprovados; audit de produção com zero vulnerabilidades | concluído | Avançar para isolamento de SO, carga e colaboração persistente |
| 2026-10-08 | Fases 8 e 12 | BuildSystem recebeu modo `container-required` com falha fechada; instalação e audit usam rede controlada; testes e build usam rede desativada; runtime e `/health` executam em contêiner efêmero sem rede, com limites de memória, CPU e processos | `build-system.test.ts`; `container-builder.test.ts`: 26 testes focados aprovados; Docker indisponível no host impede somente a prova com daemon real | validando | Executar a mesma matriz com Docker ativo antes da abertura pública e configurar produção com `ORUS_EXECUTION_ISOLATION=container-required` |
| 2026-10-08 | Fase 14 | Carga controlada de 48 jobs comprovou concorrência máxima de quatro, drenagem completa da fila, 100% de sucesso e p95 abaixo do SLO configurado | `generation-execution-load.test.ts`; 48 amostras operacionais sem rejeição ou timeout | concluído | Repetir com carga HTTP distribuída no ambiente de publicação |
| 2026-10-08 | Fases 9 e 15 | Cada entrega aprovada inclui `.orus/certification.json` com ambiente, Blueprint, gates, isolamento, runtime, lockfile/audit e comandos sem saída sensível | `orchestrator-integration.test.ts`; suíte integrada de isolamento, carga e manifesto com 34 testes aprovados | concluído | Incorporar evidências de navegador por geração quando o runner público estiver isolado |
| 2026-10-08 | Fases 10 e 11 | Colaboração do workspace usa sessões persistentes, chat, presença e comentários por arquivo com respostas, edição, exclusão e resolução; editor e cabeçalho consomem os participantes reais | `collaboration-routes.test.ts`; `collaboration.service.test.ts`; frontend com 5 arquivos e 18 testes aprovados | concluído | Adicionar transporte WebSocket real somente quando substituir o polling sem criar um segundo contrato |
| 2026-10-08 | Fase 15 | Copy pública deixou de afirmar números de usuários, superioridade absoluta, cursores inexistentes ou garantia genérica de zero erro; descreve apenas gates e recursos materializados | `HomePage.tsx`; lint e TypeScript aprovados | concluído | Auditar README após o fechamento técnico |
| 2026-10-08 | Fases 12, 15 e 16 | Toolchain migrada para Vite 8, Vitest 5 e Tailwind 4; auditoria completa zerada; CI recebeu gates de browser, advisories e contêiner; configuração e checklist de produção foram consolidados | `npm run verify`: 40 arquivos/242 testes backend e 5 arquivos/18 testes frontend; fullstack 336,76 s; incremental válido 291,98 s; rollback inválido 159,91 s; navegador 8/8 em 274,95 s; `npm audit`: zero | validando | Executar o job de contêiner em host com Docker ativo e concluir README/capturas do release |
| 2026-10-08 | Fase 5 | Projetos gerados receberam favicon e visual local derivados dos tokens, sem placeholder remoto; `.orus/visual-assets.json` registra origem, licença, finalidade e fallback offline | `ui-generator.test.ts`: 26 testes; integração de geração, auditoria e orquestração: 18 testes; lint e tipos aprovados | concluído | Incorporar ativos externos somente com adaptador de origem, licença e otimização verificável |
| 2026-10-08 | Fases 11, 12, 15 e 16 | Salvamento legado usa o workspace certificado; provedor de IA é lazy; terminal migrou para `@xterm/*` e não simula build/teste; ESLint 10 ativo; instalação limpa não depende de `.env`; CORS normaliza as origens configuradas; ConfigManager é obrigatório no startup | `npm run verify`: 42 arquivos/245 testes backend e 5 arquivos/18 testes frontend; clean install com 263 testes e builds; fullstack repetido em 327,83 s; audit zero; contratos de configuração e origens aprovados | concluído | Executar Docker e CI no host de release; produzir capturas finais |
| 2026-10-08 | Fases 6, 13 e 15 | O frontend consulta o endpoint canônico de engines e representa Trinity como uma única engine real; ALMA, CÉREBRO e VOZ permanecem responsabilidades internas, sem três estados de saúde simulados | `generation.service.test.ts`; instalação limpa sem `.env`: 42 arquivos/245 testes backend e 6 arquivos/20 testes frontend; lint, tipos e builds aprovados | concluído | Manter o contrato de saúde alinhado ao registry de engines |
| 2026-10-08 | Fases 6, 10 e 11 | Template Manager deixou de usar catálogo demonstrativo e conecta Library, Customizer e Validator; Component Builder não produz mais `TODO` ou TypeScript estruturalmente inválido; Learning Engine persiste padrões e modelos de forma atômica com assinaturas SHA-256 sem armazenar prompts | testes de `component-builder`, `template-manager` e `learning-engine`; lint e tipos backend aprovados | concluído | Manter o aprendizado local limitado a uma instância até existir repositório compartilhado |
| 2026-10-08 | Fases 12, 13 e 15 | Monitoring Engine removeu CPU aleatória e estados fixos de saúde; métricas usam deltas reais do processo, memória RSS/heap e tráfego efetivamente registrado; identificadores operacionais usam UUID | `monitoring-engine.test.ts`; regressão limpa com 46 arquivos/254 testes backend, 6 arquivos/20 testes frontend, lint, tipos e builds; 274 testes no total sem `.env`; fullstack aprovado em 317,19 s | concluído | Executar o gate Docker/CI em host de release e conectar observabilidade externa somente com provedor real |
| 2026-10-08 | Fases 1, 6, 10, 12 e 15 | Documentos e Product Blueprints ganharam repositório atômico e restauração; o Template Manager tornou-se o único seletor do pipeline; rotas internas são opt-in e impossíveis em produção; Trinity usa somente o status canônico | `blueprint-store.test.ts`, `template-engine.test.ts`, `server-origins.test.ts`; `npm run verify`: 48 arquivos/262 testes backend e 6 arquivos/20 testes frontend; instalação limpa com 282 testes; fullstack aprovado em 276,49 s | concluído | Executar Docker e CI no commit candidato; configurar banco, segredos e volume persistente do ambiente público |
| 2026-10-08 | Fases 2, 3, 5, 7 e 12 | Prompts de recrutamento, educação, logística, eventos e restaurantes deixam de herdar o núcleo genérico e materializam capacidades, entidades, relações, workflows, rotas, layouts, componentes, identidades e homes próprias; emissão condicional de contratos de estado corrigiu páginas especializadas sem workflow | Matriz de Blueprint, UI e backend aprovada para cinco domínios; cinco fullstacks aprovados com instalação, Prisma e builds em 558,11 s; `npm run verify`: 48 arquivos/295 testes backend e 6 arquivos/20 testes frontend | concluído | Ampliar as jornadas interativas de navegador e medir fidelidade semântica sobre prompts não catalogados |
| 2026-10-08 | Fases 5, 9, 12 e 15 | Matriz de navegador ampliada para recrutamento, educação, logística, eventos e restaurantes; leitura do contrato visual foi separada entre shell externo e experiência da página; contraste da experiência de hospitalidade foi corrigido | `generated-browser.e2e.ts`: 13/13 testes sobre 12 produtos em 536,62 s, com desktop, mobile, build, erros de página, overflow, axe WCAG A/AA e 12 fingerprints; `npm run verify`: 48 arquivos/295 testes backend e 6 arquivos/20 testes frontend | concluído | Medir fidelidade semântica sobre prompts não catalogados e executar o gate de contêiner no host de release |
| 2026-10-08 | Fases 2, 3, 7 e 12 | O Product Blueprint passou a derivar capacidades de listas funcionais em domínios não catalogados, inferindo estratégia, entidade, rota, layout e componentes; termos de catálogo sem sinais de compra não forçam mais o arquétipo de comércio | Corpus de biblioteca, proteção animal e construção sem `Item`, `Task`, `Project` ou `Workspace`; biblioteca fullstack aprovada com instalação, Prisma e builds em 109,71 s; `npm run verify`: 48 arquivos/298 testes backend e 6 arquivos/20 testes frontend | concluído | Permitir enriquecimento por IA sem tornar a geração dependente de rede |
| 2026-10-08 | Fases 8 e 12 | Cancelamento de comandos no Windows ganhou fallback limitado quando `taskkill` demora sob paralelismo, impedindo espera indefinida e contaminação da certificação seguinte | `build-system.test.ts`: 22/22; falha reproduzida na suíte paralela e eliminada; `npm run verify` aprovado com 318 testes totais e ambos os builds | concluído | Manter a regressão paralela como prova do caminho de cancelamento |
| 2026-10-08 | Fases 12 e 15 | Coleção persistente atualizada com Acervo Vivo, Talento Vivo, Rota Clara, Festival Vivo e Atelier Terra, cobrindo domínio aberto, recrutamento, logística, eventos e landing editorial | Cinco instalações e builds aprovados; cinco auditorias de produção com zero vulnerabilidades; quatro schemas Prisma válidos; fontes preservadas em `examples/generated` | concluído | Produzir capturas reais e pacotes de release após o gate Docker |
| 2026-10-09 | Fases 9, 10, 12 e 13 | Preview incorporado ao gate de certificação antes da promoção do artefato; falhas de preparação, assets ou backend entram no reparo cognitivo e repetem validação completa; jobs interrompidos passam a `recovering`, preservam a solicitação e checkpoints e são reenfileirados automaticamente no mesmo ID lógico | `build-system.ts`; `orchestrator-engine.ts`; `generation-job-store.ts`; 48 arquivos e 304 testes backend aprovados; lint e TypeScript aprovados | concluído na instância única | Persistir artefatos candidatos por estágio para retomada exata e adicionar browser smoke interativo ao gate síncrono |

Estados permitidos: `a iniciar`, `em andamento`, `bloqueado`, `validando`, `concluído`.

### Retomada após desligamento — 2026-10-07

- Alterações de autenticação, workspace e regeneração encontradas salvas. A segunda execução E2E anterior não possui resultado final recuperado.
- O primeiro E2E incremental anterior comprovava a execução do gerador, mas não certificava o workspace após incorporar edições. Essa evidência não basta para declarar a regeneração pronta.
- Corrigido o ponto de incorporação: arquivos protegidos e exclusões entram no orquestrador antes de instalação, testes, build, cobertura do Blueprint, segurança e CIG. Cada tentativa de reparo reaplica essa proteção. O controller publica somente os arquivos devolvidos pela certificação.
- Cancelamento, edição concorrente ou exclusão do projeto impedem a publicação da regeneração. Uma segunda regeneração simultânea recebe HTTP 409. A proteção dos arquivos é persistida separadamente do histórico limitado a 200 revisões.
- O Blueprint de evolução recebe a descrição original e a mudança solicitada separadas das instruções de execução. A palavra singular `produto` não é mais evidência suficiente de comércio. A versão e identidade do Blueprint são preservadas na evolução funcional. A inclusão de pagamentos ou analytics mantém o arquétipo e o núcleo de domínio existentes; palavras como `sistema`, `corrija` e `indicadores` não disparam uma mudança visual por conter fragmentos de palavras-chave.
- Backend: 29 suítes / 183 testes aprovados na regressão com subprocessos habilitados; lint aprovado. A execução inicial no sandbox falhou em seis verificações por `spawn EPERM`; a repetição autorizada passou.
- Frontend: dez testes, lint e build de produção aprovados. Corrigidos CSS aninhado do editor e avisos de sourcemap ligados a diretivas `use client` desnecessárias no Vite. Restam avisos informativos de base de navegadores desatualizada e CSS de dependência (`justify-content: end`).
- E2E incremental aprovado: `npm run test:e2e:generator -- --runTestsByPath tests/e2e/project-incremental.e2e.ts --silent`. Dois casos aprovados em 441 s: edição TypeScript válida preservada com certificação; edição TypeScript inválida bloqueada sem substituir o workspace.
- Nova lacuna identificada após esse E2E: `validateGeneratedProject` instalava, migrava, testava e compilava, mas não iniciava o servidor compilado. A inicialização existia somente no preview e nos testes externos.
- O BuildSystem agora reaproveita o inicializador do preview para executar `npm run start` com `NODE_ENV=production`, porta temporária e banco de validação. Exige `/health` com JSON saudável, limita o tempo de resposta, propaga cancelamento e encerra a árvore de processos. Falhas possuem diagnóstico `runtime` e bloqueiam a certificação.
- Testes do BuildSystem: nove aprovados, incluindo servidor saudável, falha de inicialização, resposta de saúde inválida, cancelamento e encerramento do servidor temporário. A regressão geral passou em 29 suítes / 187 testes. Após o refinamento final de preservação do domínio, 16 testes de Blueprint e controller passaram, incluindo uma nova regressão.
- E2E do caso válido repetido com o novo gate de produção: aprovado em 234 s, incluindo asserção de `runtime.passed`, modo `production` e `/health`. Comando: `npm run test:e2e:generator -- --runTestsByPath tests/e2e/project-incremental.e2e.ts --testNamePattern="invalid=false" --silent`.

Limites ainda abertos: evolução de Blueprints com regras personalizadas fora do catálogo, migração incremental de schemas, restauração de revisões e aceite comportamental por capacidade. A conclusão destes testes não encerra o plano de produção inteiro.

### Fechamento do bloco de confiabilidade e segurança — 2026-10-07

- O fluxo público de geração falha fechado quando a certificação não devolve arquivos. O fallback que poderia publicar um `App.tsx` demonstrativo após falha foi removido.
- O conteúdo integral de prompts, especificações, resultados e arquivos deixou de ser registrado nos logs do pipeline ativo. A correlação preserva identificadores, contagens e comprimentos.
- Tokens JWT de acesso e refresh possuem tipos distintos. Refresh não autentica como acesso e logout revoga as duas credenciais da sessão informada.
- A execução de gerações possui limite configurável de concorrência e fila, cancelamento antes e durante a espera e recusa explícita quando a capacidade é excedida. O health check expõe somente contagens e limites operacionais.
- Projetos fullstack gerados aplicam Helmet, CORS por allowlist, limite de corpo, segredo JWT obrigatório, senha forte, rate limit de autenticação e administradores declarados em `ADMIN_EMAILS`. O primeiro usuário cadastrado não recebe privilégio automaticamente.
- A Security Engine deixou de declarar scanner de dependências e conformidade simulados. O gate atual avalia padrões estáticos, política de especificações de dependência e configurações OWASP materialmente verificáveis. Base externa de advisories e certificações organizacionais continuam fora da cobertura e são declaradas como tal.
- Deployment e marketplace simulados foram retirados das rotas públicas. `/api/info` os apresenta como indisponíveis até existirem adaptadores reais configurados.
- A validação de prompt usa a rota canônica do controller; o frontend não inventa mais uma resposta local quando essa validação falha.
- Links e ações sem destino real foram removidos ou redirecionados para projetos e Blueprints existentes. O botão de deploy indisponível deixou de aparecer como ação de produto.
- Foram adicionados `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md` e CI com regressão principal e E2E direcionado.
- O script E2E raiz passou a encaminhar os argumentos ao Jest no Windows e executa somente o cenário solicitado.

Evidência consolidada deste bloco:

- `npm run verify`: aprovado fora do sandbox, com lint e TypeScript frontend/backend, 37 suítes e 219 testes backend, 3 arquivos e 13 testes frontend e builds de produção aprovados;
- `npm run verify:e2e`: aprovado em 363 segundos, com um cenário executado e nove corretamente filtrados;
- o E2E comprovou geração, certificação, digest e paridade do ZIP, reinstalação limpa, Prisma, migração, seed, build, runtime, JWT, autorização por papel, persistência, transições e agregação;
- nenhum servidor persistente foi iniciado e nenhuma alteração foi feita no banco do Builder.

Riscos residuais confirmados:

- subprocessos possuem allowlist de ambiente, timeout, limite de saída, encerramento de árvore e diretório temporário; o modo público exige contêiner e falha fechado sem Docker;
- a política de dependências impede fontes e versões inseguras e consulta `npm audit`; indisponibilidade do scanner bloqueia a certificação;
- os testes comportamentais executam APIs, runtime e treze jornadas em navegador real com auditoria visual responsiva e acessibilidade;
- deployment, marketplace e recuperação de senha permanecem indisponíveis em produção até receberem provedores reais;
- fila local, artefatos locais e métricas do processo não substituem uma fila distribuída nem observabilidade de produção.

### Continuação: navegador, dependências e limites de execução — 2026-10-07

- A matriz de navegador real cobre landing editorial, clínica, CRM, finanças, operação de campo, marketplace e estúdio de conteúdo em viewport desktop e mobile. O gate bloqueia erro de página, overflow horizontal e violações axe de impacto sério ou crítico.
- Ajustes orientados pelos resultados corrigiram contraste de paletas, opacidade em painéis, semântica da paleta financeira e uma variável inválida na agenda clínica. A matriz final produziu sete fingerprints visuais únicos e ao menos seis assinaturas estruturais distintas.
- As dependências diretas foram atualizadas sem migração destrutiva de framework. React Router passou à versão 7 e os templates gerados foram migrados sem flags legadas da versão 6.
- O parser DOCX existente passou a extrair WordprocessingML diretamente com limites de pacote e XML. A cadeia vulnerável de `mammoth`, `argparse` e `sprintf-js` foi removida.
- O audit de produção do Builder passou de 38 vulnerabilidades para zero. O certificador executa `npm audit --omit=dev --audit-level=moderate --json` e falha fechado em advisory ou indisponibilidade do comando.
- O E2E detectou `bcrypt` nativo dependente de script de instalação. O gerador passou a emitir `bcryptjs`, preservando hash e comparação sem executar binário de pacote na instalação.
- O E2E detectou vulnerabilidades altas no Prisma 6.19.3. Os templates passaram a fixar Prisma e Client em 6.12.0, versão segura indicada pelo advisory e comprovada pelo fluxo real.
- Cada certificação bem-sucedida preserva `package-lock.json`, SHA-256, nível e horário da auditoria. O ZIP contém o mesmo lockfile e foi reinstalado com `npm ci --ignore-scripts`.
- O BuildSystem aplica limites configuráveis de arquivos gerados, bytes de origem, tamanho por arquivo, bytes e arquivos do workspace, saída de comandos e runtime, heap Node, timeout e árvores de subprocessos.
- O modo local pode usar processo com ambiente reduzido e diretório temporário. Em produção, `container-required` é obrigatório; o gate Docker aprovou comando e runtime sem rede, e a persistência do MongoDB foi comprovada após recriação do contêiner sobre o mesmo volume.

## 13. Registro de decisões

| ID | Data | Decisão | Motivo | Impacto |
| --- | --- | --- | --- | --- |
| DEC-001 | 2026-10-06 | Evoluir a arquitetura existente em vez de reescrever o Builder | Preservar componentes reais e reduzir risco | Toda fase começa por inventário e reaproveitamento |
| DEC-002 | 2026-10-06 | Tornar o Product Blueprint a fonte primária | Evitar geração CRUD genérica e decisões divergentes | Engines e geradores devem consumir o mesmo contrato |
| DEC-003 | 2026-10-06 | Certificar comportamento executado antes da entrega | Build isolado não prova funcionalidade | Runtime, API, navegador e rastreabilidade integram o CIG |
| DEC-004 | 2026-10-06 | Adiar novas linguagens até a estabilização TypeScript | Evitar multiplicar falhas de arquitetura | Python, PHP e Rust pertencem à Fase 17 |

## 14. Riscos ativos

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Componentes registrados, mas sem execução real | alta | alto | Inventário de consumidores e testes por fluxo |
| Múltiplos contratos para o mesmo conceito | alta | alto | Fase 1 antes de ampliar geração |
| UI especializada sem domínio correspondente | alta | alto | Gates de rastreabilidade e E2E funcional |
| Reparo automático mascarar defeitos | média | alto | Limite, diff, diagnóstico e recertificação integral afetada |
| Execução de código gerado comprometer a máquina | média | crítico | Isolamento, limites, allowlists e descarte seguro |
| README prometer capacidades não comprovadas | média | alto | Publicar somente após evidência da Fase 15 |
| Crescimento de escopo impedir fechamento | alta | alto | Gates por fase e prioridade P0 antes de módulos avançados |
| Scanner externo indisponível durante uma certificação | baixa | alto | `npm audit` falha fechado; lockfile, nível e horário ficam no manifesto |
| Produção iniciada sem daemon de contêiner | média | crítico | Exigir `ORUS_EXECUTION_ISOLATION=container-required`; health operacional e certificação falham fechado sem Docker |

## 15. Próxima execução obrigatória

1. Criar o commit candidato e executar a CI remota, anexando auditoria, regressão, fullstack, navegador e contêiner à release.
2. Publicar a release open source TypeScript; recuperação de senha, SSO, 2FA, deployment e marketplace exigem provedores reais antes de serem habilitados.
3. Manter configuração, backup, restauração, HTTPS, banco e segredos como responsabilidades documentadas de cada instalação exposta à internet.
4. Iniciar adaptadores Python, PHP e Rust somente depois do fechamento da release TypeScript.

Nenhuma fase posterior deve ser tratada como completa com base apenas na documentação histórica. A conclusão exige código conectado e evidência executável.
