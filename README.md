# Melo&Dias - Gerenciador de Recursos Empresariais

Uma aplicação web robusta baseada em MVC para gerenciar Usuários, Produtos e Pedidos.

## Tecnologias Utilizadas

| Categoria   | Tecnologia    | Descrição |
| :--- | :--- | :--- |
| **Backend** | Node.js       | Ambiente de execução Javascript. |
|             | Express       | Framework web rápido e minimalista. |
|             | Sequelize     | ORM para banco de dados SQL. |
|             | Axios         | Cliente HTTP para comunicação entre serviços. |
| **Database**| SQLite        | Banco de dados leve e local. |
| **Auth**    | JWT           | JSON Web Tokens para autenticação stateless. |
|             | Bcrypt        | Hashing seguro de senhas. |
| **Cache**   | Node-Cache    | Cache em memória para performance. |
| **Frontend**| HTML5/CSS3    | Interface moderna e responsiva (Vanilla). |
|             | Javascript    | Lógica do cliente (Fetch API, DOM). |
| **DevOps**  | GitHub Actions| CI/CD Pipeline automatizado. |
|             | PM2           | Gerenciador de processos para Node.js. |
|             | AWS EC2       | Infraestrutura de nuvem. |

## Arquitetura do Sistema

```mermaid
graph TD
    Client[Cliente Browser] -->|HTTP Request| MainService[Servidor Principal (Express :3000)]
    subgraph "Main Application"
        MainService -->|Authenticates| AuthMiddleware[Middleware de Auth (JWT)]
        MainService -->|Checks| CacheLayer[Camada de Cache (Node-Cache)]
        MainService -->|Reads/Writes| DB[(SQLite Database)]
    end
    MainService -->|Post Event| AuditService[Microsserviço de Auditoria (Express :3001)]
    AuditService -->|Writes| AuditLog[Arquivo audit.log]
```

## Novas Funcionalidades

1.  **Autenticação**: Login seguro com JWT. Rotas críticas (POST, PUT, DELETE) protegidas.
2.  **Regras de Negócio**: 
    - Pedidos validam estoque disponível.
    - Estoque é decrementado automaticamente após o pedido.
3.  **Cache**: Listagens de produtos são cacheadas por 60 segundos para performance.
4.  **CI/CD**: Pipeline automatizado no GitHub Actions para rodar testes a cada push.

## Instalação e Execução

### Pré-requisitos
- Node.js v18+

### Passo a Passo
1.  **Instalar dependências**:
    ```bash
    npm install
    ```
2.  **Iniciar serviços**:
    ```bash
    npm run start # ou node src/app.js
    npm run audit # ou node src/audit-service.js
    ```
3.  **Acessar**: `http://localhost:3000`

### Configuração de Primeiro Acesso
Como o sistema possui autenticação, você precisará de um usuário inicial. Execute o script abaixo:
```bash
node scripts/create_admin.js
```
Isso criará o administrador:
- **Email**: `admin@meloedias.com`
- **Senha**: `admin123`

## Implantação (AWS)
Utilize o script `setup.sh` no User Data da sua instância EC2 para configuração automática.
