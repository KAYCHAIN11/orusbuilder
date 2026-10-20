# Integração das telas do Product Blueprint

Data: 2026-10-06.

## Problemas encontrados

As páginas especializadas geradas a partir do Blueprint criavam três registros locais. A ação principal adicionava outro registro apenas ao estado React. Mudanças de etapa, controles de permissão e conexão externa não correspondiam a operações executadas no backend. Algumas métricas multiplicavam a quantidade de registros por constantes e os gráficos usavam posições artificiais.

Uma verificação inicial do vínculo de dados também poderia aceitar um arquivo de página não usado pelo roteador. Nas rotas de detalhe, páginas especializadas eram emitidas e importadas, mas a aplicação renderizava a página de detalhe da entidade.

## Alterações no gerador

- Páginas especializadas carregam a coleção correspondente à entidade do Blueprint pelo cliente de API existente.
- A criação abre o formulário real; listagens e cartões abrem detalhe ou edição.
- Carregamento, coleção vazia, falha e tentativa novamente possuem estados explícitos.
- Workflows exibem os estados definidos no catálogo de domínio e somente as transições permitidas. Estados como cancelado e perdido permanecem distintos dos estados de conclusão.
- Em fullstack, as transições usam o endpoint `PATCH /api/<recurso>/<id>/status`. A interface atualiza o registro com a resposta do servidor e mantém os dados anteriores se a chamada falhar.
- Na modalidade frontend com persistência local, o cliente local existente continua responsável pela gravação.
- Os indicadores das páginas computadas passam a usar contagens reais dos registros carregados. Projeções monetárias e gráficos inventados foram removidos.
- Ação fictícia de conectar/desconectar e matriz de permissões sem efeito foram removidas. Os registros mantêm navegação e edição; isso não implementa autenticação de provedores externos nem autorização por papel.
- Nomes internos dos componentes deixaram de aparecer como etiquetas nas telas do produto.
- Páginas especializadas não utilizadas para rotas com parâmetros deixaram de ser emitidas e importadas.

## Certificação

O auditor analisa a árvore sintática das rotas, segue imports locais dos componentes utilizados e procura chamadas de leitura ao recurso esperado. Um arquivo desconectado ou uma menção textual ao endpoint não satisfaz a checagem. Rotas de detalhe são verificadas contra a entidade do caminho efetivamente renderizado.

Os controllers de geração e projeto passam a exigir aprovação explícita em `deployment.ready`. Um retorno positivo de execução, sem a certificação, não autoriza o estado pronto.

Essa auditoria é estrutural. Não comprova isoladamente autorização, regras de negócio, funcionamento de provedores externos ou todos os critérios de aceite. A certificação de capacidades completas permanece pendente no Plano Mestre.

## Verificação

Os testes executam o código React gerado em um harness com hooks e cliente de API controlados. Verificam carregamento, navegação, transição permitida, uso da resposta do servidor, preservação do estado após falha e nova tentativa de leitura. Esse harness não substitui testes de navegador.

Uma matriz adicional verifica as páginas alcançáveis e as rotas de detalhe em Blueprints de CRM, clínica e loja. O auditor possui regressão para página desconectada e endpoint presente somente como texto. O controller de projetos é testado com certificação aprovada, reprovada e ausente.

Resultados finais:

- Backend: 21 suítes e 125 testes aprovados.
- TypeScript backend: aprovado.
- ESLint backend: aprovado.
- E2E HTTP fullstack: aprovado em 376 segundos. O cenário passou por geração, certificação, download, reinstalação de dependências, preparação do banco temporário do teste, build, execução da API, autenticação e operações de criação, leitura, atualização e exclusão.
- Esse E2E foi executado de forma direcionada: um cenário aprovado e oito cenários fora da seleção. A suíte E2E inteira não foi reexecutada neste bloco.
- Testes de build inicialmente encontraram `spawn EPERM` dentro do sandbox. A repetição autorizada fora do sandbox passou; a restrição ambiental não foi tratada como defeito do código gerado.

As verificações em navegador e de todos os critérios de negócio continuam pendentes. O resultado deste bloco não certifica todo o Builder para produção.

## Pendências para produção

1. Transformar cada critério de aceite do Blueprint em comportamento implementado e teste executável, sobretudo checkout, mensagens, upload, permissões e integrações externas.
2. Implementar contratos tipados de domínio em todos os pontos que ainda usam registros flexíveis.
3. Unificar o serviço de execução e montagem de resultado dos dois controllers.
4. Ampliar a validação em navegador, incluindo recarregamento após gravação e cenários de acesso negado.
5. Completar as demais fases do Plano Mestre antes de declarar o Builder inteiro pronto para produção.

Nenhum modelo, migração ou contrato de banco foi alterado neste bloco.

## Continuação em 2026-10-06

O serviço de execução compartilhado já foi extraído. Foram adicionados versionamento do Blueprint, manifesto de critérios de aceite, persistência local dos jobs e delegação dos adaptadores ao serviço canônico de CIG. A consolidação completa e os testes comportamentais por capacidade permanecem abertos.

As páginas computadas fullstack consultam um endpoint de resumo; o backend usa agregações transacionais sobre os registros persistidos. Não há mais limite artificial de 1.000 registros nesse cálculo. Projetos frontend calculam a partir da coleção local, sem solicitar um endpoint exclusivo do backend.

As regras de workflow são verificadas tanto no endpoint de transição quanto na edição comum. Testes executam o serviço gerado para verificar rejeição sem escrita, transição válida, edição no mesmo estado e recurso ausente. Outro teste executa o repositório com agregações controladas de 1.501 registros; esse teste não é um benchmark de banco real.

O cancelamento passou a ser registrado antes da preparação do contexto e checado novamente após a execução. Um resultado tardio com `deployment.ready` não será certificado se a geração tiver sido cancelada.

Validação consolidada do cenário direcionado: E2E fullstack aprovado em 445 segundos e com zero reparos automáticos. O cenário passou por geração, certificação, download, instalação limpa, Prisma e SQLite temporários, seed, build, inicialização da API, cadastro e login JWT, conflitos, operações persistidas, recarregamento, rejeição de transições inválidas por PUT e PATCH, transição válida e resumo agregado de relatórios. O banco do Builder não foi alterado.

Os testes de tela com hooks controlados continuam sem substituir o navegador. A soma dos campos numéricos ainda não representa fórmulas financeiras, previsão ponderada ou outros cálculos especializados. O E2E direcionado não equivale à matriz completa de produtos.

## Variedade estrutural e acesso aos jobs

O layout declarado no Product Blueprint passou a controlar a composição da página, não somente um atributo de rastreabilidade. Calendário, conversa, catálogo, checkout, timeline, pagamentos, integrações e permissões possuem estruturas próprias; o screen raiz pode substituir a home genérica. Workflows mantêm as transições permitidas dentro dessas composições.

Um marketplace gerado com catálogo, checkout, pagamentos e integrações foi instalado e compilado em 77 segundos. O primeiro build detectou variáveis não utilizadas em três páginas e bloqueou a entrega; após a correção no gerador, a repetição passou. Isso demonstra o gate de build atuando sobre o código emitido, sem aceitar a análise estrutural isoladamente.

O acompanhamento da geração também deixou de depender somente do ID do job. Novas gerações recebem token opaco armazenado como hash. Proprietário autenticado ou token válido é exigido para status, resultado, cancelamento, retry, preview e download. A credencial usada para abrir o preview é convertida em cookie `HttpOnly` e removida da URL por redirecionamento.
