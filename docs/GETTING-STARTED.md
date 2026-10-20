# Primeiros passos com o ORUS Builder

Este guia conduz uma instalação local reproduzível até a primeira geração. O ORUS Builder é open source e executa na infraestrutura do usuário.

## Requisitos

- Node.js 20 ou superior;
- npm 9 ou superior;
- Git;
- Docker com Compose para MongoDB e isolamento;
- chave de um provedor de IA compatível;
- acesso ao registro npm.

## Instalação

```bash
git clone https://github.com/OrusMind/Orus-Builder-FullStack.git
cd Orus-Builder-FullStack
npm ci
cp .env.example backend/.env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example backend/.env
```

Edite `backend/.env` e informe a chave do provedor. Não publique esse arquivo.

## Dependências locais

```bash
npm run infra:up
npm run infra:status
```

O Compose cria um volume persistente para o MongoDB. `npm run infra:down` encerra o serviço sem remover os dados.

## Iniciar o Builder

```bash
npm run dev
```

- Builder: `http://localhost:3000`
- Geração: `http://localhost:3000/generate`
- Saúde do backend: `http://localhost:5000/health`

Para depuração separada:

```bash
npm run dev:backend
npm run dev:frontend
```

Execute cada comando em um terminal.

## Primeira geração

Use um prompt que descreva produto, usuários, operações, regras, identidade e critérios de aceite:

```text
Crie um sistema full-stack para uma biblioteca comunitária. Permita cadastrar
obras, exemplares, leitores, empréstimos e reservas. Bibliotecários controlam
retiradas e devoluções; leitores consultam disponibilidade e seu histórico.
Use uma identidade editorial acolhedora, navegação por catálogo e uma tela
inicial orientada a descobertas, sem repetir um dashboard SaaS genérico.
Inclua autenticação, permissões, busca, filtros, persistência, validações,
tratamento de erros, dados iniciais e testes das ações principais.
```

O pipeline cria o Product Blueprint antes do código e somente libera o artefato depois dos gates configurados.

## Verificação

```bash
npm run verify
npm run verify:e2e
```

Para a matriz visual e o isolamento:

```bash
npm run test:e2e:browser
ORUS_TEST_DOCKER=true npm run test:e2e:isolation
```

No PowerShell, defina `ORUS_TEST_DOCKER` com `$env:ORUS_TEST_DOCKER='true'`.

## Problemas comuns

### A API não responde

Confirme `http://localhost:5000/health`, a porta configurada e os logs do terminal. Em desenvolvimento, o backend informa quando usa o banco em memória por indisponibilidade do MongoDB.

### O provedor de IA falhou

Confira `AI_PROVIDER`, a chave correspondente e o modelo no arquivo `backend/.env`. Reinicie o backend após alterar variáveis.

### O preview não abre

Consulte o diagnóstico associado ao job. O projeto preservado pode ser retomado; falhas de preview entram no ciclo de reparo e recertificação.

### Uma porta está ocupada

Encerre a aplicação que usa a porta ou altere a configuração. O frontend usa 3000 e o backend usa 5000 por padrão.

## Próximos documentos

- `docs/SELF-HOSTING.md` para operação própria;
- `docs/ARCHITECTURE-COMPLETE.md` para arquitetura;
- `docs/ARCHITECTURE-ENGINES.md` para engines;
- `docs/PROMPT-TUTORIAL-GUIDE.md` para prompts;
- `CONTRIBUTING.md` para contribuições;
- `SECURITY.md` para vulnerabilidades.
