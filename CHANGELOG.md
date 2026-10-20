# Histórico de alterações

As mudanças relevantes do ORUS Builder são registradas neste arquivo. O projeto segue versionamento semântico.

## Não publicado

- fluxo de instalação open source com frontend e backend iniciados por um único comando;
- MongoDB local reproduzível por Docker Compose;
- validação automatizada dos arquivos obrigatórios da distribuição;
- modelos de issues, pull requests, segurança e conduta comunitária.

## 1.0.0

### Adicionado

- Product Blueprint como fonte primária de arquitetura, identidade, funcionalidades, componentes e jornadas;
- geração React e Vite com backend Express, Prisma, autenticação, persistência e testes conforme o escopo;
- identidade visual e composição derivadas do domínio e da intenção do prompt;
- preview certificado, workspace, histórico, diff e regeneração incremental;
- checkpoints duráveis com preservação do artefato candidato e validação SHA-256;
- CIG, Security Engine, testes, build, runtime, navegador e isolamento por contêiner no pipeline de certificação;
- exemplos variados e capturas reais produzidos pelo pipeline atual.

### Corrigido

- repetição de layouts e recursos genéricos entre domínios distintos;
- formulários e operações sem persistência real;
- falhas de preview, proxy e acesso ao projeto gerado;
- perda de acompanhamento após atualização ou reinício;
- entrega de projetos que não passaram por instalação, build ou runtime;
- divergências entre artefato certificado, preview e arquivo ZIP.
