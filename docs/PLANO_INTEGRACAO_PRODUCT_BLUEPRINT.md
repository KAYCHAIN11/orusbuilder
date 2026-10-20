# Plano de Integração do Product Blueprint

## Objetivo

Transformar o ORUS Builder de um gerador orientado principalmente a entidades e CRUD em um sistema orientado por produto. Antes de produzir código, o ORUS deverá interpretar a entrada, criar um Blueprint versionado, planejar a experiência, definir capacidades e arquitetura, validar a cobertura e somente então executar a geração.

O CRUD permanece disponível como capacidade básica. Ele não será mais a estrutura obrigatória de todos os projetos.

## Princípios

1. O Blueprint é a fonte primária do workspace.
2. Prompt simples e documento detalhado convergem para o mesmo contrato estruturado.
3. Toda inferência deve registrar origem, confiança e premissa.
4. Cada artefato gerado deve ser rastreável até um requisito do Blueprint.
5. A profundidade da documentação deve acompanhar a complexidade do produto.
6. Engines e componentes existentes serão reutilizados antes da criação de novos módulos.
7. Templates e CRUD são ferramentas de execução, não decisões de produto.
8. Compilação, testes e segurança continuam obrigatórios, mas passam a incluir cobertura funcional do Blueprint.

## Estado Atual Relevante

O projeto já possui os blocos necessários para a integração:

- `PromptEngine`, `PromptProcessor` e `RequirementsExtractor` interpretam a entrada.
- `BlueprintEngine` coordena parser, reconhecimento, metadados, árvore e validação.
- `TrinityEngine` produz contexto e intenção visual.
- `OrchestrationEngine` registra engines e executa `PROMPT_TO_DEPLOY`.
- `CognitiveGenerationEngine` coordena a geração.
- `CodeGenerator` executa arquitetura, banco, backend, API, UI e testes.
- `ArchitectureDesigner`, `DatabaseDesigner`, `BackendGenerator`, `UIGenerator` e `TestGenerator` já são geradores ativos.
- `UIComponentCatalog`, `DomainModelCatalog` e `VisualIntent` já oferecem vocabulário visual e de domínio.
- `CIG`, `BuildSystem`, `TestingEngine` e `SecurityEngine` certificam a entrega.
- `Project` já representa o workspace e seus arquivos.
- `BlueprintUploadPage`, `BlueprintUploader`, `BlueprintParser` e `TreeVisualization` já fornecem a base do frontend.
- `ProjectPage`, editor, preview, chat e atividades já formam a base do workspace.

As principais lacunas atuais são:

- `PROMPT_TO_DEPLOY` gera código antes de existir um Product Blueprint formal.
- `BLUEPRINT_TO_DEPLOY` está declarado, mas não implementado.
- `generateFromBlueprint` ainda retorna `Coming soon`.
- O Blueprint atual reconhece principalmente estrutura documental e padrões ORUS.
- O `CodeGenerator` recebe descrição, entidades e intenção visual, mas não recebe jornadas, capacidades, telas ou critérios de aceite.
- O banco ainda recebe perfil `crud` fixo.
- A UI cria lista, detalhe, criação e edição para todas as entidades.
- A certificação valida o projeto técnico, mas não a cobertura do produto.
- O workspace não mantém o Blueprint vivo, suas versões e seus vínculos com o código.

## Arquitetura Alvo

```text
Prompt ou documento
        |
        v
Prompt Engine e Blueprint Parser
        |
        v
Product Blueprint normalizado e versionado
        |
        +--> Produto e escopo
        +--> Identidade visual
        +--> Jornadas e capacidades
        +--> Telas e componentes
        +--> Dados, APIs e arquitetura
        +--> Critérios de aceite
        |
        v
Plano de execução por engine
        |
        v
Geração de código orientada por capacidades
        |
        v
CIG + testes funcionais + build + segurança
        |
        v
Workspace com Blueprint, código, cobertura e histórico
```

## Product Blueprint v1

O contrato canônico deve ser TypeScript e serializável em JSON. A documentação legível será derivada desse contrato.

### Identidade e proveniência

- `blueprintId`
- `projectId`
- `version`
- `status`: `draft`, `ready`, `generating`, `implemented`, `outdated`
- `sourceType`: `prompt`, `document`, `hybrid`
- `sourcePrompt`
- `sourceDocuments`
- `createdAt`
- `updatedAt`
- `assumptions`
- `openQuestions`
- `confidence`

### Definição do produto

- nome e descrição
- problema central
- proposta de valor
- público e personas
- objetivos
- escopo do MVP
- itens fora do escopo
- métricas de sucesso

### Identidade visual

- personalidade e voz
- direção visual
- paleta e tipografia
- densidade e ritmo
- navegação
- princípios de UI e UX
- acessibilidade
- referências fornecidas pelo usuário

### Capacidades

Cada capacidade terá um identificador `CAP-*` e incluirá:

- nome e propósito
- prioridade
- atores
- entradas e saídas
- regras de negócio
- dependências
- estados
- erros esperados
- critérios de aceite
- estratégia de implementação: `custom`, `workflow`, `crud`, `integration`, `computed`, `content`

### Jornadas e workflows

Cada fluxo terá um identificador `FLOW-*` e incluirá:

- ator
- gatilho
- sequência de passos
- decisões
- estados e transições
- exceções
- resultado esperado
- capacidades relacionadas

### Telas e wireframes

Cada tela terá um identificador `SCREEN-*` e incluirá:

- rota
- objetivo
- público
- layout
- regiões
- componentes
- ações
- estados de carregamento, vazio, sucesso, erro e permissão
- comportamento responsivo
- capacidades atendidas

O wireframe inicial será estrutural e representado como árvore de regiões. Uma representação visual poderá ser derivada no frontend sem bloquear a geração.

### Componentes

Cada componente terá um identificador `COMP-*` e incluirá:

- nome semântico
- categoria
- finalidade
- propriedades
- eventos
- variantes
- estados
- acessibilidade
- telas consumidoras
- implementação existente que pode ser reutilizada

### Dados e contratos

- entidades `DATA-*`
- campos e relações
- eventos de domínio
- contratos `API-*`
- integrações externas
- políticas de acesso
- retenção e privacidade

### Arquitetura

- frontend
- backend
- persistência
- autenticação e autorização
- integrações
- observabilidade
- segurança
- decisões técnicas e justificativas
- restrições de execução

### Critérios de aceite e rastreabilidade

Cada critério terá um identificador `AC-*` e vínculos com:

- capacidade
- fluxo
- tela
- componente
- API
- arquivos gerados
- testes
- resultado de certificação

## Profundidade Adaptativa

### Essencial

Aplicada a pedidos simples e produtos pequenos.

- definição do produto
- capacidades principais
- mapa de telas
- inventário de componentes
- identidade visual
- arquitetura técnica resumida
- critérios de aceite essenciais

### Produto

Aplicada a aplicativos com múltiplos usuários ou workflows.

- todos os itens do nível Essencial
- personas e permissões
- jornadas completas
- regras de negócio
- modelo de dados e APIs
- estados de interface
- plano de testes
- decisões e riscos

### Completo

Aplicada a plataformas complexas ou documentos detalhados.

- todos os itens do nível Produto
- módulos e domínios
- integrações externas
- eventos e automações
- requisitos não funcionais
- segurança e observabilidade
- roadmap e fases
- matriz completa de rastreabilidade

O nível determina profundidade, não qualidade. Todos os níveis devem ser executáveis e verificáveis.

## Matriz de Reaproveitamento

| Necessidade | Componente existente | Integração |
|---|---|---|
| Entrada por prompt | `PromptEngine` e `PromptProcessor` | Produzir evidências e requisitos para o Blueprint |
| Entrada por documento | `BlueprintParser` | Preservar documento original e extrair conteúdo |
| Padrões ORUS | `OrusPatternRecognizer` | Manter hashes, blocos e metadados como proveniência |
| Metadados | `MetadataExtractor` | Ampliar para produto, UX, capacidades e arquitetura |
| Estrutura | `TreeGenerator` | Gerar árvore documental e mapa de implementação |
| Validação | `BlueprintValidator` | Validar completude proporcional ao nível |
| Orquestração | `OrchestrationEngine` | Inserir planejamento e implementar `BLUEPRINT_TO_DEPLOY` |
| Raciocínio e fallback | `TrinityEngine` | Resolver lacunas, consistência e identidade visual |
| Arquitetura técnica | `ArchitectureDesigner` | Consumir decisões do Blueprint |
| Dados | `DatabaseDesigner` e `DomainModelCatalog` | Gerar modelos conforme capacidades, não perfil fixo |
| Backend | `BackendGenerator` e `ApiGenerator` | Gerar comandos, workflows e endpoints específicos |
| UI | `UIGenerator`, `UIComponentCatalog` e `VisualIntent` | Compor telas e componentes do Blueprint |
| Componentes reutilizáveis | `ComponentBuilder` | Materializar receitas e variantes planejadas |
| Testes | `TestGenerator` e `TestingEngine` | Derivar testes dos critérios `AC-*` |
| Qualidade | `CIG`, `QualityAnalyzer` e `BuildSystem` | Validar código e cobertura do Blueprint |
| Segurança | `SecurityEngine` | Validar políticas e superfícies definidas |
| Aprendizado | `LearningEngine` | Relacionar padrões de Blueprint com resultados |
| Persistência | `Project` | Incorporar Blueprint ativo, versões e cobertura |
| Interface | componentes de Blueprint e `ProjectPage` | Criar área documental dentro do workspace |

## Fluxos Integrados

### Prompt para projeto

1. Receber prompt e opções.
2. Processar intenção e requisitos.
3. Classificar domínio, complexidade e profundidade.
4. Criar Product Blueprint em estado `draft`.
5. Resolver lacunas com inferências explícitas.
6. Gerar identidade visual antes das telas.
7. Planejar capacidades, fluxos, telas, componentes e arquitetura.
8. Validar completude do Blueprint.
9. Marcar Blueprint como `ready`.
10. Criar plano de execução por engine.
11. Gerar código.
12. Produzir testes a partir dos critérios de aceite.
13. Executar reparo, build, CIG e segurança.
14. Calcular cobertura do Blueprint.
15. Persistir código, Blueprint e relatório no projeto.

### Documento para projeto

1. Preservar arquivo original e checksum.
2. Extrair texto, estrutura e padrões ORUS.
3. Converter o conteúdo para Product Blueprint.
4. Preservar afirmações do documento como informações fornecidas.
5. Marcar complementos da IA como inferências.
6. Executar as etapas 6 a 15 do fluxo por prompt.

### Evolução de projeto existente

1. Receber solicitação no contexto do workspace.
2. Carregar Blueprint ativo e mapa de rastreabilidade.
3. Produzir proposta de alteração.
4. Calcular capacidades, telas, dados, APIs e arquivos impactados.
5. Criar nova versão do Blueprint.
6. Aplicar alterações incrementais no código.
7. Executar testes afetados e certificação completa.
8. Atualizar cobertura, decisões e histórico.

## Alterações Planejadas por Área

### Backend Blueprint

- Adicionar contratos de Product Blueprint em `backend/src/core/types`.
- Ampliar `MetadataExtractor` para produzir metadados semânticos de produto.
- Adicionar normalização adaptativa na `BlueprintEngine`.
- Ampliar `BlueprintValidator` com regras por profundidade.
- Preservar parser, reconhecedor ORUS e gerador de árvore.
- Substituir armazenamento exclusivo em memória por um repositório com fallback em memória.

### Prompt e requisitos

- Fazer `RequirementsExtractor` produzir evidências rastreáveis.
- Separar requisito funcional, capacidade, regra, jornada, tela e entidade.
- Registrar ausências, ambiguidades, premissas e confiança.
- Impedir que ausência de IA externa reduza o plano a uma entidade genérica.

### Orquestração

- Adicionar estágio `product-blueprint` antes de `cognitive-generation`.
- Implementar `BLUEPRINT_TO_DEPLOY` usando o mesmo executor posterior.
- Fazer `PROMPT_TO_DEPLOY` criar um Blueprint e delegar ao fluxo por Blueprint.
- Manter geração, reparo, build, CIG, segurança, aprendizado e métricas existentes.
- Incluir Blueprint e cobertura na saída do workflow.

### Geração

- Adicionar `productBlueprint` ao contrato do `CognitiveGenerationEngine` e `CodeGenerator`.
- Remover `profile: 'crud'` fixo.
- Criar um plano intermediário de arquivos por capacidade.
- Gerar CRUD somente para capacidades classificadas como `crud`.
- Gerar serviços, comandos, workflows e endpoints para capacidades específicas.
- Fazer a UI gerar somente as rotas previstas no mapa de telas.
- Materializar os componentes nomeados no inventário.
- Usar `VisualIntent` como parte da identidade do Blueprint, não como decoração posterior.

### CIG e testes

- Adicionar validação de cobertura de `CAP-*`, `FLOW-*`, `SCREEN-*`, `COMP-*`, `API-*` e `AC-*`.
- Derivar testes de jornada dos critérios de aceite.
- Bloquear entrega quando capacidade obrigatória não possui implementação ou teste.
- Manter compilação, lint, testes, segurança e runtime como gates obrigatórios.
- Separar cobertura funcional de cobertura de linhas.

### Persistência do workspace

- Estender `Project` com `activeBlueprintId`, `blueprintVersion`, `blueprintCoverage` e histórico resumido.
- Criar representação persistente de Blueprint e versões.
- Manter documento original associado ao projeto.
- Manter mapa entre requisitos, arquivos e testes.
- Preservar o fallback em memória para desenvolvimento local.

### API

- `POST /api/v1/blueprints/from-prompt`
- `POST /api/v1/blueprints/upload`
- `GET /api/v1/blueprints/:id`
- `PATCH /api/v1/blueprints/:id`
- `POST /api/v1/blueprints/:id/validate`
- `POST /api/v1/blueprints/:id/generate`
- `GET /api/v1/blueprints/:id/versions`
- `POST /api/v1/blueprints/:id/versions`
- `GET /api/v1/blueprints/:id/coverage`
- `POST /api/v1/projects/:projectId/change-plan`
- `POST /api/v1/projects/:projectId/apply-change`

As rotas existentes serão mantidas e adaptadas para compatibilidade.

### Frontend

Reaproveitar `BlueprintUploadPage`, uploader, parser, árvore, `ProjectPage`, editor e preview.

Adicionar ao workspace as áreas:

- Visão do produto
- Funcionalidades
- Jornadas
- Telas e wireframes
- Componentes
- Identidade visual
- Arquitetura
- Dados e APIs
- Critérios de aceite
- Cobertura
- Histórico de versões

O usuário poderá revisar e editar o Blueprint antes da geração, mas o modo rápido poderá avançar automaticamente quando não houver ambiguidades críticas.

## Sequência de Implementação

### Fase 1 — Contrato e normalização

1. Criar os tipos do Product Blueprint v1.
2. Criar IDs e vínculos rastreáveis.
3. Implementar profundidade adaptativa.
4. Adaptar o `RequirementsExtractor`.
5. Adaptar a `BlueprintEngine` e seu validador.
6. Criar testes unitários de prompt simples, detalhado e documento.

Resultado: qualquer entrada produz um Blueprint válido sem gerar código.

### Fase 2 — Orquestração obrigatória

1. Inserir o estágio de Blueprint no fluxo por prompt.
2. Implementar `BLUEPRINT_TO_DEPLOY`.
3. Implementar `generateFromBlueprint`.
4. Incluir Blueprint na geração, no cache e no resultado.
5. Garantir compatibilidade com a API atual.

Resultado: nenhum projeto novo é gerado sem Blueprint.

### Fase 3 — Geração orientada por capacidades

1. Alterar contratos dos geradores.
2. Remover o perfil CRUD fixo.
3. Criar plano de execução por capacidade.
4. Gerar rotas e telas conforme o Blueprint.
5. Gerar workflows de domínio existentes.
6. Criar implementações específicas quando não houver receita pronta.
7. Validar diversidade estrutural entre domínios.

Resultado: clínica, CRM, comércio, conteúdo e projetos deixam de compartilhar a mesma composição funcional.

### Fase 4 — Cobertura e certificação

1. Gerar testes a partir de `AC-*`.
2. Criar matriz de cobertura.
3. Integrar cobertura ao CIG.
4. Exigir build, runtime e jornadas obrigatórias.
5. Manter ciclo automático de reparo.

Resultado: o sistema comprova que implementou o produto solicitado.

### Fase 5 — Workspace vivo

1. Persistir Blueprint e versões.
2. Adicionar seções ao `ProjectPage`.
3. Exibir cobertura e divergências.
4. Permitir edição e nova versão.
5. Implementar plano de mudança incremental.

Resultado: o ORUS passa a criar e manter o projeto dentro do Builder.

### Fase 6 — Validação final

Executar uma suíte com pelo menos:

- landing page de marca
- clínica com agenda e acompanhamento
- CRM com pipeline e atividades
- comércio com catálogo, carrinho e pedidos
- plataforma de conteúdo com publicação e moderação
- gestão de projetos com quadro e cronograma
- prompt mínimo
- prompt detalhado
- Blueprint importado
- alteração incremental de projeto existente

Cada cenário deverá comprovar:

- Blueprint coerente
- composição visual distinta
- funcionalidades específicas
- dados e APIs adequados
- jornada principal executável
- build aprovado
- testes aprovados
- CIG aprovado
- cobertura obrigatória completa

## Estratégia de Compatibilidade

- Manter endpoints e formatos de geração atuais durante a migração.
- Gerar um Blueprint implícito para requisições antigas.
- Aceitar Blueprint v1 e preparar migração por versão.
- Preservar o modo determinístico quando o provedor de IA estiver indisponível.
- Usar receitas existentes quando compatíveis.
- Usar geração customizada quando nenhuma receita cumprir a capacidade.
- Não alterar configuração de banco de produção nesta integração.

## Riscos e Controles

| Risco | Controle |
|---|---|
| Blueprint excessivamente longo | Profundidade adaptativa e resumos estruturados |
| Inferências apresentadas como fatos | Proveniência, confiança e lista de premissas |
| IA produzir estrutura inconsistente | Schema, normalização e validação determinística |
| Código compilar sem cumprir o pedido | Cobertura funcional ligada aos critérios de aceite |
| Regeneração destruir trabalho existente | Versionamento e plano de mudança incremental |
| Templates voltarem a dominar a solução | Estratégia explícita por capacidade e geração customizada |
| Falha do provedor externo | Planejador determinístico e reparo local |
| Documentos incompatíveis | Parser existente, adaptadores por formato e mensagens de diagnóstico |

## Definição de Pronto

A integração estará concluída quando:

1. Todo projeto novo possuir Product Blueprint versionado.
2. Prompt simples produzir documentação essencial suficiente para gerar.
3. Prompt detalhado preservar e executar requisitos específicos.
4. Documento importado permanecer como fonte original do workspace.
5. O gerador não criar automaticamente CRUD para toda entidade.
6. Telas e componentes corresponderem ao mapa definido.
7. Funcionalidades específicas possuírem código e testes próprios.
8. O CIG validar cobertura funcional e qualidade técnica.
9. O dashboard exibir Blueprint, cobertura e histórico.
10. Uma alteração posterior atualizar Blueprint e código incrementalmente.
11. A suíte multidomínio comprovar diferenças funcionais e visuais reais.
12. Projetos certificados continuarem compilando e executando no preview.

## Ordem Recomendada de Execução

1. Product Blueprint v1 e validador.
2. Extração adaptativa por prompt e documento.
3. `BLUEPRINT_TO_DEPLOY` e geração a partir do Blueprint.
4. Planejamento de capacidades e remoção do CRUD obrigatório.
5. Cobertura funcional no CIG.
6. Workspace de Blueprint no dashboard.
7. Manutenção incremental.
8. Suíte multidomínio e documentação pública.
