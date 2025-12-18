# Documentação do Workflow de CI/CD

Este projeto utiliza o **GitHub Actions** para automação de Integração Contínua (CI). O fluxo de trabalho está definido no arquivo `.github/workflows/ci.yml`.

## Visão Geral

O objetivo deste workflow é garantir que o código seja construído e testado corretamente em diferentes versões do Node.js sempre que houver alterações na branch principal.

## Gatilhos (Triggers)

O workflow é acionado nos seguintes eventos:
- **Push**: Quando um commit é enviado diretamente para a branch `main`.
- **Pull Request**: Quando um Pull Request é aberto ou atualizado visando a branch `main`.

## Jobs

O workflow possui um job chamado `build`.

### Ambiente de Execução
- **Sistema Operacional**: `ubuntu-latest` (Última versão estável do Ubuntu Linux).

### Estratégia de Matriz
O job é executado múltiplas vezes em paralelo para diferentes versões do Node.js:
- Node.js 18.x
- Node.js 20.x

## Passos (Steps)

Para cada execução da matriz, os seguintes passos são realizados:

1. **Checkout do Código** (`actions/checkout@v3`)
   - Baixa o código fonte do repositório para o ambiente de execução.

2. **Configuração do Node.js** (`actions/setup-node@v3`)
   - Instala a versão específica do Node.js definida na matriz.
   - Configura o cache do `npm` para acelerar a instalação de dependências.

3. **Instalação de Dependências** (`npm ci`)
   - Executa uma instalação limpa das dependências baseada no arquivo `package-lock.json`. Isso garante que as dependências exatas sejam instaladas.

4. **Execução de Testes** (`npm test`)
   - Roda o script de teste definido no `package.json`. Se algum teste falhar, o build falha.
