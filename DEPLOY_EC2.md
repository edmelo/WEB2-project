# Guia de Implantação no AWS EC2

Este guia descreve como implantar o projeto WEB2 em uma instância Amazon EC2 rodando **Amazon Linux 2** ou **Amazon Linux 2023**.

## Pré-requisitos

1.  Uma conta AWS ativa.
2.  Um par de chaves (Key Pair `.pem`) criado para acesso SSH.
3.  O código do projeto hospedado em um repositório Git (ex: GitHub) OU uma maneira de copiar os arquivos para o servidor (SCP/SFTP).

---

## Método 1: Instalação Automática (User Data)

Este é o método mais fácil para novas instâncias. O script será executado automaticamente no primeiro boot.

1.  No console da AWS, inicie o processo de criação de uma nova instância (**Launch Instance**).
2.  Escolha a AMI **Amazon Linux 2023** ou **Amazon Linux 2**.
3.  Configure o **Security Group** para permitir tráfego nas portas:
    *   **22** (SSH - Apenas seu IP)
    *   **3000** (Aplicação Principal - Anywhere ou Custom)
    *   **3001** (Serviço de Auditoria - Interno ou Custom)
4.  Na seção **Advanced Details** -> **User Data**, cole o script abaixo.
    *   *Nota: Substitua `SEU_REPOSITORIO_GIT` pela URL do seu repositório.*

```bash
#!/bin/bash

# 1. Atualizar o sistema
sudo yum update -y

# 2. Instalar Node.js e Git
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

# 3. Instalar Gerenciador de Processos (PM2)
sudo npm install -g pm2

# 4. Clonar a Aplicação
# Ajuste o diretório conforme necessário
mkdir -p /home/ec2-user/app
git clone https://github.com/edmelo/WEB2-project.git /home/ec2-user/app
# Se o repo for privado, você precisará configurar chaves SSH ou Tokens antes, 
# ou clonar via HTTPS com token embutido (cuidado com segurança).

# 5. Entrar no diretório
cd /home/ec2-user/app

# 6. Instalar dependências
npm install

# 7. Iniciar Serviços
# Serviço de Auditoria
pm2 start src/audit-service.js --name "audit-service"
# Serviço Principal
pm2 start src/app.js --name "main-service"

# 8. Configurar Startup Automático
pm2 save
pm2 startup systemd -u ec2-user --hp /home/ec2-user
systemctl enable pm2-ec2-user
```

---

## Método 2: Instalação Manual (SSH)

Utilize este método se você já tem uma instância rodando ou prefere configurar passo a passo.

1.  **Conecte-se à instância**:
    ```bash
    ssh -i "sua-chave.pem" ec2-user@seu-ip-publico
    ```

2.  **Execute os comandos de configuração**:

    **Atualizar e Instalar Dependências de Sistema:**
    ```bash
    sudo yum update -y
    curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs git
    sudo npm install -g pm2
    ```

    **Configurar a Aplicação:**
    ```bash
    # Clonar repositório (substitua pela sua URL)
    git clone https://github.com/edmelo/WEB2-project.git ~/app
    
    cd ~/app
    npm install
    ```

    **Iniciar Aplicação com PM2:**
    ```bash
    pm2 start src/audit-service.js --name "audit-service"
    pm2 start src/app.js --name "main-service"
    ```

    **Salvar Estado para Reinicialização:**
    ```bash
    pm2 save
    pm2 startup
    # Copie e rode o comando que o 'pm2 startup' gerar na tela
    ```

---

## Verificação e Monitoramento

- **Verificar Status**:
    ```bash
    pm2 status
    ```
- **Ver Logs**:
    ```bash
    pm2 logs main-service
    pm2 logs audit-service
    ```
- **Acesso Web**:
    Abra seu navegador em: `http://SEU_IP_PUBLICO:3000`

---

## Solução de Problemas Comuns

- **Site não carrega**:
    - Verifique se o **Security Group** da instância permite entrada TCP na porta 3000.
    - Verifique se a aplicação está rodando: `pm2 status`.
- **Erro de Permissão (EACCES)**:
    - Evite usar `sudo` para rodar `npm install` ou `pm2 start` a menos que estritamente necessário (o setup acima usa o usuário `ec2-user`).
