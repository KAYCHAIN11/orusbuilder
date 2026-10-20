# Execução open source do ORUS Builder

O ORUS Builder é executado e administrado por quem instala o projeto. Não depende de uma conta ORUS nem de uma infraestrutura SaaS central.

## Requisitos

- Node.js 24.15 ou superior;
- npm 9 ou superior;
- Docker com Compose;
- acesso ao registro npm durante a certificação;
- chave de um provedor de IA configurado;
- espaço em disco para dependências, workspaces e artefatos.

## Desenvolvimento local

```bash
npm ci
cp .env.example backend/.env
npm run infra:up
npm run dev
```

No Windows PowerShell, a cópia pode ser feita com:

```powershell
Copy-Item .env.example backend/.env
```

Preencha a chave do provedor em `backend/.env`. O frontend abre em `http://localhost:3000` e o backend em `http://localhost:5000`.

O comando `npm run infra:down` encerra o MongoDB e preserva o volume. A remoção deliberada do volume apaga os dados e não faz parte do fluxo normal.

## Validação da instalação

```bash
npm run verify:distribution
npm run verify
npm run verify:e2e
```

Com Docker ativo:

```bash
ORUS_TEST_DOCKER=true npm run test:e2e:isolation
```

No PowerShell:

```powershell
$env:ORUS_TEST_DOCKER='true'
npm run test:e2e:isolation
```

## Execução exposta à internet

Use `.env.production.example` como contrato. Antes de iniciar:

1. defina `NODE_ENV=production`;
2. configure MongoDB persistente;
3. use segredos únicos com pelo menos 32 caracteres;
4. informe origens HTTPS exatas;
5. mantenha `ORUS_EXECUTION_ISOLATION=container-required`;
6. desabilite rotas de teste e módulos sem adaptadores reais;
7. preserve em volume todos os caminhos `ORUS_*_STORE_*`;
8. coloque frontend e backend atrás de um proxy HTTPS mantido pelo operador.

O backend falha fechado quando os requisitos obrigatórios de produção não são atendidos.

## Dados e backup

```bash
npm run data:backup -- --directory ./backup-orus
npm run data:restore -- --directory ./backup-orus
npm run test:data-recovery
```

O backup usa manifesto SHA-256. Teste a restauração antes de atualizar uma instalação com dados importantes.

## Atualização

1. faça backup dos stores e do MongoDB;
2. consulte `CHANGELOG.md`;
3. instale pelo lockfile com `npm ci`;
4. execute `npm run verify`;
5. reinicie a aplicação;
6. confirme `/health`, `/api/health` e uma geração curta.

## Responsabilidade do operador

O operador controla chaves, prompts, documentos, retenção, rede, acesso e backups. Não publique arquivos `.env`, stores locais, bancos, logs ou projetos privados. Projetos gerados devem ser revisados antes de uso em domínios regulados ou críticos.
