#!/bin/bash

# Atualizar o sistema
sudo yum update -y

# Instalar Node.js (Amazon Linux 2/2023)
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Instalar Gerenciador de Processos (PM2)
sudo npm install -g pm2

# Navegar para o diretório da aplicação (Assumindo que os arquivos foram copiados para /home/ec2-user/app)
# Se usar Git: git clone <url_repo> /home/ec2-user/app
cd /home/ec2-user/app

# Instalar dependências
npm install

# Iniciar Serviço de Auditoria
pm2 start src/audit-service.js --name "audit-service"

# Iniciar Serviço Principal
pm2 start src/app.js --name "main-service"

# Salvar lista do PM2 para reiniciar no boot
pm2 save
pm2 startup systemd -u ec2-user --hp /home/ec2-user
