# Checklist de Release e Operação do ORUS Builder

Versão: 1.0  
Atualizado em: 2026-10-11  
Escopo: release TypeScript, React, Express e Prisma

## 1. Gates da publicação open source

- [x] Executar o gate `container-isolation` em host com Docker ativo.
- [x] Validar os arquivos obrigatórios da distribuição e os links locais do README.
- [x] Disponibilizar instalação reproduzível, Compose, configuração de exemplo e guia de execução própria.
- [x] Revisar licença, contribuição, segurança, suporte, conduta e modelos do GitHub.
- [x] Revisar README, capturas e exemplos contra as evidências locais do candidato.
- [ ] Executar CI completa no commit candidato.

Deployment gerenciado, marketplace, recuperação de senha, SSO e 2FA permanecem indisponíveis até receberem adaptadores e provedores reais. Eles não bloqueiam a publicação do gerador quando não forem anunciados como capacidades ativas.

O único gate externo da publicação do código-fonte é a execução da CI no commit candidato. Esta cópia local não contém metadados Git.

## 2. Configuração obrigatória para instalações expostas à internet

Estes itens são responsabilidade de cada operador e não bloqueiam a publicação do código open source:

- definir `ORUS_EXECUTION_ISOLATION=container-required`;
- provisionar MongoDB persistente e testar backup e restauração;
- gerar segredos únicos de JWT, sessão e criptografia;
- configurar origens HTTPS exatas em `FRONTEND_URL` e `CORS_ORIGIN`.

```dotenv
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://builder.example.com
CORS_ORIGIN=https://builder.example.com
MONGODB_URI=mongodb://usuario:senha@mongodb:27017/orus-builder
JWT_SECRET=<segredo-aleatorio-com-32-ou-mais-caracteres>
SESSION_SECRET=<segredo-aleatorio-com-32-ou-mais-caracteres>
ENCRYPTION_KEY=<segredo-aleatorio-com-32-ou-mais-caracteres>
AI_PROVIDER=groq
GROQ_API_KEY=<chave-do-provedor>
ORUS_EXECUTION_ISOLATION=container-required
ORUS_EXECUTION_IMAGE=node:20-bookworm-slim
ORUS_JOB_STORE_PATH=/var/lib/orus/generation-jobs.json
ORUS_PROJECT_STORE_FILE=/var/lib/orus/projects.json
ORUS_BLUEPRINT_STORE_FILE=/var/lib/orus/blueprints.json
ORUS_USER_STORE_FILE=/var/lib/orus/users.json
ORUS_COLLABORATION_STORE_FILE=/var/lib/orus/collaboration.json
ORUS_LEARNING_STORE_FILE=/var/lib/orus/learning.json
ORUS_ENABLE_TEST_ROUTES=false
```

Os seis arquivos locais devem residir em volume persistente com acesso exclusivo da instância. Para múltiplas réplicas, essa persistência deve ser substituída por repositórios compartilhados antes de escalar horizontalmente.

Backup e restauração local:

```bash
npm run data:backup -- --directory <diretorio-do-backup>
npm run data:restore -- --directory <diretorio-do-backup>
npm run test:data-recovery
```

O backup inclui manifesto SHA-256. A restauração rejeita arquivos alterados e preserva cada store atual com o sufixo `before-restore`.

## 3. Gates do commit candidato

```bash
npm ci
npm audit --audit-level=moderate
npm run verify
npm run verify:e2e
npm run test:e2e:browser
ORUS_TEST_DOCKER=true npm run test:e2e:isolation
```

Critérios:

- auditoria npm sem vulnerabilidades conhecidas no nível configurado;
- lint e TypeScript aprovados no Builder inteiro;
- suítes backend e frontend aprovadas;
- builds frontend e backend reproduzíveis;
- geração fullstack instalada, migrada, testada, compilada e iniciada;
- regeneração válida promovida e regeneração inválida bloqueada sem perda da versão anterior;
- treze cenários de navegador aprovados, sem overflow ou violações sérias/críticas de acessibilidade;
- execução em contêiner sem privilégios, sem rede durante teste/build/runtime e com `/health` aprovado.

## 4. Verificação operacional

- `GET /health` deve retornar HTTP 200 e `status: operational`.
- `GET /api/health` deve indicar zero falhas em engines obrigatórias e fila aceitando jobs.
- `GET /api/engines/status` deve distinguir engines habilitadas, desabilitadas e obrigatórias.
- `GET /api/info` deve manter indisponíveis os módulos sem provedor real.
- Uma geração anônima deve exigir o token opaco para status, resultado, preview e download.
- Uma geração autenticada deve ficar restrita ao proprietário.
- Um job interrompido deve ser recuperado pelo backend e retomado automaticamente pelo frontend após recarga.
- Alvos fora de TypeScript/JavaScript, React e Vite devem ser rejeitados antes da criação do job.
- Capacidades ainda não implementadas não podem retornar sucesso simulado.
- O manifesto `.orus/certification.json` deve existir no ZIP entregue.
- O ZIP deve reinstalar com `npm ci --ignore-scripts` e conservar o hash do lockfile certificado.

## 5. Observabilidade e retenção

- Monitorar fila, recusas, cancelamentos, timeouts, taxa de sucesso e p50/p95.
- Alertar quando o p95 de espera ultrapassar `ORUS_SLO_QUEUE_WAIT_P95_MS`.
- Alertar quando a taxa de sucesso cair abaixo de `ORUS_SLO_GENERATION_SUCCESS_RATE`.
- Verificar o sweep de retenção e espaço disponível no volume de artefatos.
- Correlacionar incidentes por `generationId`, sem registrar prompts, arquivos ou segredos integrais.

## 6. Rollback

1. Interromper aceitação de novos jobs.
2. Manter os jobs persistidos e artefatos certificados.
3. Reimplantar o último commit aprovado pela matriz completa.
4. Validar `/health`, `/api/health` e uma geração curta.
5. Reabrir a fila somente depois dos gates operacionais.

## 7. Evidência atual

- `npm audit --audit-level=moderate`: zero vulnerabilidades.
- `npm run verify`: 48 arquivos e 316 testes backend; 7 arquivos e 23 testes frontend; backup/restauração, lint, tipos e builds aprovados. A validação focada posterior elevou a suíte backend a 317 testes.
- Instalação limpa sem `.env`: `npm ci`, lint, tipos, 282 testes e builds aprovados.
- Fullstack certificado: aprovado em 443,77 segundos, incluindo instalação, auditoria de produção, Prisma, migração, seed, testes, build, preview, CIG, segurança, download e execução do ZIP.
- Regeneração incremental válida: aprovada em 291,98 segundos.
- Regeneração incremental inválida e rollback: aprovados em 159,91 segundos.
- Matriz de navegador: 13 de 13 testes aprovados em 491,28 segundos.
- Isolamento Docker: comando e runtime aprovados em contêiner sem rede.
- Persistência MongoDB local: escrita, remoção do contêiner, recriação sobre o mesmo volume e leitura do marcador aprovadas com `mongo:7`; contêiner e volume temporários removidos.
- Continuidade exata: artefato candidato identificado por SHA-256 é preservado nos checkpoints e reutilizado após recuperação.
- Coleção pública: seis projetos regenerados; instalação limpa, Prisma, testes aplicáveis, builds e auditorias aprovados.
- Carga controlada: 48 jobs, concorrência máxima de quatro, 100% de conclusão e p95 dentro do SLO.
- O gate local de Docker e o job dedicado da CI usam a mesma suíte de isolamento.
- Os exemplos suportados estão em `examples/showcase-2026`; a coleção histórica em `examples/generated` não representa o candidato atual.
