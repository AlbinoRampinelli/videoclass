#!/bin/bash
set -e

SERVER_IP="82.29.152.58"
SERVER_USER="root"
SERVER_PORT="22"
SERVER_PASS="@Rampinelli1@"
REMOTE_PATH="/root/videoclass"

COMPOSE_FILE="docker-compose.prod.yaml"
APP_SERVICE="app"

echo "📦 Enviando código para o servidor..."

sshpass -p "$SERVER_PASS" rsync -avz \
  --exclude node_modules \
  --exclude .git \
  --exclude deploy.sh \
  ./ $SERVER_USER@$SERVER_IP:$REMOTE_PATH

sshpass -p "$SERVER_PASS" ssh -tt -p $SERVER_PORT $SERVER_USER@$SERVER_IP << 'EOF'
  set -e
  cd /root/videoclass

  echo "🐳 Buildando imagem Docker (Next.js build ocorrse aqui)..."
  docker compose -f docker-compose.prod.yaml build app

  echo "⬆️ Subindo aplicação..."
  docker compose -f docker-compose.prod.yaml up -d app

  echo "✅ Deploy finalizado com sucesso!"
EOF

##echo "🧬 Rodando Prisma migrate deploy (container já rodando)..."
##docker compose -f docker-compose.prod.yaml exec app npx prisma migrate deploy
