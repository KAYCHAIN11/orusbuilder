# Segurança

## Versões suportadas

A versão `1.x` e a branch principal recebem correções de segurança. Versões anteriores podem deixar de receber correções após a publicação de uma atualização compatível.

## Como relatar uma vulnerabilidade

Use o recurso privado de Security Advisories do repositório GitHub. Inclua:

- componente e versão afetados;
- passos mínimos para reprodução;
- impacto observado ou esperado;
- evidências sem dados pessoais ou segredos reais;
- sugestão de mitigação, quando disponível.

Não abra uma issue pública antes da correção coordenada. O recebimento deve ser confirmado pelos mantenedores e a divulgação ocorrer somente após a mitigação estar disponível.

Não inclua chaves de provedores, tokens de acesso, prompts privados, código proprietário ou dados pessoais no relato. Use valores substitutos e anexos mínimos para reprodução.

## Escopo de segurança

O ORUS Builder processa prompts, documentos e código gerado. Relatos sobre traversal, execução de comandos, vazamento de segredos, isolamento de processos, autenticação, autorização, preview, exportação e dependências são prioritários.

O código produzido pelo Builder deve ser revisado pelo responsável antes de uso em ambientes críticos. A certificação automatizada reduz falhas reproduzíveis, mas não substitui uma auditoria específica do domínio e da infraestrutura de destino.
