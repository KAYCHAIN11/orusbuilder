# Plano de integração das engines

Atualizado em 2026-10-02. Escopo: código do Orus Builder, não customização dos projetos de demonstração.

## Etapas e critérios de aceite

| Etapa | Entrega | Estado |
| --- | --- | --- |
| 1. Reconhecimento | Identificar engines, consumidores e metadados dos componentes | Reconhecimento das engines concluído; inventário de todos os componentes ainda parcial |
| 2. Ciclo de vida | Centralizar registro, inicialização, parada e estado real | Implementado no EngineRegistry e Orchestrator; faltam testes de recuperação e concorrência |
| 3. Geração | Encaminhar o controller ao Orchestrator e preservar os arquivos produzidos | Implementado; controller preserva os caminhos canônicos do Orchestrator |
| 4. Qualidade | Build, testes, banco, CIG e segurança devem poder reprovar a geração | BuildSystem real integrado; testes materializados, CIG, segurança e runtime bloqueiam a entrega; reparo coberto por contrato e E2E |
| 5. Artefatos executáveis | Instalar, compilar e iniciar projetos gerados | Fluxo HTTP certifica antes do ZIP; E2E reinstala o ZIP, migra, compila, inicia e testa JWT/CRUD |
| 6. Componentes por engine | Validar contratos, eliminar implementações paralelas e conectar consumidores | Parcial; registro não equivale a integração funcional completa |
| 7. Visual e publicação | Avaliação visual, acessibilidade, documentação e README verificável | Pendente de uma rodada dedicada; nada publicado |

## Ordem de continuação

1. Persistir jobs em armazenamento durável, implementar cancelamento e recuperação após reinício.
2. Completar ContainerBuilder e E2ETestRunner para isolamento e navegador reais.
3. Cobrir ausência/falha de engines opcionais, repetição de inicialização e recuperação.
4. Definir como templates selecionados participam efetivamente da geração.
5. Definir autorização por papéis e propriedade de registros quando o prompt exigir multiusuário, organização ou administração.
6. Mapear consumidores de colaboração, deployment, marketplace e enterprise e implementar testes de seus próprios fluxos.
7. Ampliar o E2E HTTP para backend puro, frontend puro, tarefas/equipes e falhas esperadas.
8. Avaliar interfaces em navegador, desktop e mobile, e ampliar a cobertura do frontend.
9. Configurar lint do backend e atualizar o README somente com capacidades verificadas.

## Concluído nesta etapa

- Schema, migração e seed agora separam CRUD genérico do perfil de tarefas e preservam entidades adicionais.
- Projetos gerados usam Prisma 6.19 e o teste executa `prisma migrate deploy` sem aplicação manual de SQL.
- A API pública foi validada do prompt ao ZIP e do ZIP ao CRUD executável.
- A cobertura heurística do CIG foi limitada ao intervalo válido de 0 a 100.
- Prompts em português e inglês detectam autenticação; o backend gerado entrega registro, login, `/me`, hash bcrypt, JWT HS256 e proteção das rotas de domínio.
- `JWT_SECRET` é obrigatório e nenhum segredo padrão fica embutido no projeto gerado.
- BuildSystem materializa os arquivos em workspace temporário e executa instalação, Prisma, testes e build reais.
- O Cognitive Generation Engine recebe diagnóstico estruturado e pode substituir arquivos em até três tentativas.
- O download exige certificação `ready`; projetos inválidos permanecem bloqueados.
- Projetos gerados aprovam scripts nativos necessários de Prisma, bcrypt e esbuild em versões recentes do npm.
- A geração pública é assíncrona e expõe os estados `queued`, `generating`, `validating`, `repairing`, `ready` e `failed`.
- Resultado e download ficam bloqueados até `ready`; falhas preservam diagnósticos de runtime, CIG e segurança.
- Testing Engine escolhe Jest/Vitest, materializa o teste no projeto e usa a execução real do BuildSystem.
- O gerador de testes antigo fornece somente o harness; suítes genéricas simuladas foram removidas.
- O frontend acompanha o job por polling, exibe tentativas de correção e só habilita entrega certificada.

## Regras de execução

- Preservar alterações existentes; a pasta inspecionada não fornece histórico Git para atribuir todas as mudanças.
- Não considerar `success` de uma chamada como aprovação do conteúdo retornado.
- Não declarar deployment realizado ou pronto apenas porque houve geração e análise estática.
- Manter explicações e decisões neste plano e no relatório, não em comentários narrativos no código.
- Usar os headers de rastreabilidade como metadados; eles não substituem imports, contratos, chamadas nem testes.
