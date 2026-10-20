# Contribuindo com o ORUS Builder

Obrigado por contribuir com o ORUS Builder. Antes de alterar o código, consulte `docs/PLANO-MESTRE-EXECUCAO-PRODUCAO.md` e preserve os contratos canônicos do Product Blueprint, da geração e da certificação.

## Ambiente

- Node.js 20 ou superior
- npm 9 ou superior
- Docker com Compose para MongoDB e testes de isolamento
- variáveis baseadas em `.env.example`

```bash
npm ci
npm run infra:up
npm run verify
```

Use `npm run dev` para iniciar frontend e backend juntos. `npm run infra:down` encerra o MongoDB sem apagar o volume persistente.

O E2E canônico instala e executa um projeto gerado em diretório temporário:

```bash
npm run verify:e2e
```

Alterações em layout, geração ou interações devem executar também `npm run test:e2e:browser`. Alterações no Build System ou isolamento devem executar `ORUS_TEST_DOCKER=true npm run test:e2e:isolation`.

## Regras de contribuição

1. Reutilize engines, contratos e componentes existentes antes de criar caminhos paralelos.
2. Não marque uma geração como pronta sem passar pelo pipeline canônico de certificação.
3. Inclua testes para regressões e novos comportamentos.
4. Não adicione segredos, credenciais, dados pessoais ou artefatos temporários ao repositório.
5. Mantenha comentários restritos à estrutura e às informações necessárias ao código.
6. Descreva no pull request o problema, a solução, os testes executados e limitações conhecidas.
7. Registre mudanças visíveis em `CHANGELOG.md` sem anunciar capacidades que ainda não passaram pelos gates correspondentes.

## Relatos de segurança

Não publique vulnerabilidades em issues abertas. Siga o processo descrito em `SECURITY.md`.

Para dúvidas, erros e propostas que não envolvam vulnerabilidades, consulte `SUPPORT.md` e use os modelos de issue do repositório.
