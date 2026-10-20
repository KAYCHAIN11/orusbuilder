# Exemplos gerados pelo ORUS

Esta pasta contém projetos produzidos pelo fluxo real do ORUS Builder. A coleção original foi gerada em 3 de outubro de 2026; cinco novos exemplos foram materializados em 8 de outubro de 2026 com a arquitetura atual de Product Blueprint, planejamento visual e geração por domínio.

| Projeto | Direção visual | Variante | Código | Download |
| --- | --- | --- | --- | --- |
| Maison Aurea | Editorial de luxo, preto e dourado | `editorial` | [Abrir fonte](maison-aurea/) | [ZIP](maison-aurea.zip) |
| VIVA Skincare | Vitrine vibrante, coral e laranja | `showcase` | [Abrir fonte](viva-skincare/) | [ZIP](viva-skincare.zip) |
| Serena Clínica | Produto acolhedor, verde e teal | `product` | [Abrir fonte](serena-clinica/) | [ZIP](serena-clinica.zip) |
| Acervo Vivo | Biblioteca editorial, verde profundo e areia | `editorial-overview` | [Abrir fonte](acervo-vivo-fullstack/) | — |
| Talento Vivo | Decisão de talentos, azul elétrico e grafite | `talent-hub` | [Abrir fonte](talento-vivo-fullstack/) | — |
| Rota Clara | Central logística escura, densa e orientada a exceções | `logistics-control` | [Abrir fonte](rota-clara-fullstack/) | — |
| Festival Vivo | Experiência ao vivo mobile-first, violeta e coral | `event-stage` | [Abrir fonte](festival-vivo-fullstack/) | — |
| Atelier Terra | Arquitetura editorial, terracota, areia e verde musgo | `creative-studio` | [Abrir fonte](atelier-terra-landing/) | — |

Todos os exemplos incluem os artefatos de intenção visual em `.orus/`. Os quatro novos fullstacks incluem também Product Blueprint, plano de aceite, frontend React + TypeScript e backend Express + Prisma. Os cinco novos projetos passaram por build de produção e `npm audit --omit=dev`; os schemas Prisma dos fullstacks foram validados.

## Executar um exemplo

```bash
cd examples/generated/serena-clinica
npm install
npm test
npm run build
npm run dev
```

Substitua `serena-clinica` pelo diretório de qualquer projeto da tabela. Nos fullstacks novos, `npm run dev` inicia frontend e backend; na landing, inicia apenas o frontend.

## Prompts usados

### Maison Aurea

```text
Crie apenas uma landing page editorial de luxo para a joalheria chamada Maison Aurea. Use tema escuro preto e dourado, tipografia serifada protagonista, composição assimétrica, muito espaço negativo, coleção em destaque, diferenciais da curadoria, prova social e CTA para agendar uma apresentação privada. Não crie dashboard, login, backend ou banco de dados.
```

### VIVA Skincare

```text
Crie apenas uma landing page divertida, vibrante e moderna para a loja de skincare chamada VIVA. Use tema claro, coral e laranja, visual de vitrine com cards de produtos em alturas diferentes, benefícios, dados de confiança, processo de compra e CTA para receber lançamentos. Não crie dashboard, login, backend ou banco de dados.
```

### Serena Clínica

```text
Crie apenas uma landing page premium e acolhedora para a clínica chamada Serena. Use tema claro em verde e teal, sensação humana e confiável, explique cuidado contínuo, equipe coordenada e acompanhamento do paciente, mostre indicadores de confiança, processo em três etapas e CTA para conhecer a clínica. Não crie dashboard, login, backend ou banco de dados.
```

### Acervo Vivo

```text
Sistema Acervo Vivo para bibliotecas, com catálogo de obras, empréstimos com prazo e devolução, reservas e cálculo automático de multas. Visual editorial acolhedor em verde profundo e areia, navegação superior e leitura clara.
```

### Talento Vivo

```text
Sistema Talento Vivo com vagas, candidatos, processo seletivo em pipeline, entrevistas e relatórios de contratação. Identidade corporativa contemporânea em azul elétrico e grafite, foco em decisões de talento.
```

### Rota Clara

```text
Aplicação Rota Clara para remessas e entregas, gestão de frota, planejamento de rotas e rastreamento logístico. Central operacional escura com âmbar, alta densidade e sinais claros de exceção.
```

### Festival Vivo

```text
Aplicativo Festival Vivo com programação de eventos, ingressos e inscrições e credenciamento na entrada. Visual vibrante, expressivo e mobile-first em violeta e coral, inspirado em experiências ao vivo.
```

### Atelier Terra

```text
Landing page editorial premium para o estúdio brasileiro de arquitetura Atelier Terra, com hero manifesto, projetos selecionados, método e contato em exatamente quatro seções. Paleta terracota, areia e verde musgo, tipografia elegante, composição assimétrica e imagens locais abstratas.
```

