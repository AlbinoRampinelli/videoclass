#!/bin/bash
set -e

# ======================
# CONFIGURAÇÃO
# ======================
SERVER_IP="82.29.152.58"
SERVER_USER="root"
SERVER_PORT="22"
SERVER_PASS="@Rampinelli1@"
REMOTE_PATH="/root/videoclass"

COMPOSE_FILE="docker-compose.prod.yaml"
APP_SERVICE="app"

# ======================
# BUILD LOCAL
# ======================
echo "🔨 Buildando Next.js LOCALMENTE..."
npm install
npm run build

# ======================
# ENVIO PARA O SERVIDOR
# ======================
echo "📦 Enviando arquivos para o servidor..."

sshpass -p "$SERVER_PASS" rsync -avz \
  --exclude node_modules \
  --exclude .git \
  --exclude deploy.sh \
  ./ $SERVER_USER@$SERVER_IP:$REMOTE_PATH

# ======================
# EXECUÇÃO NO SERVIDOR
# ======================
sshpass -p "$SERVER_PASS" ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP << EOF
  set -e
  cd $REMOTE_PATH

  echo "🧬 Rodando Prisma migrate deploy..."
  docker compose -f $COMPOSE_FILE run --rm $APP_SERVICE npx prisma migrate deploy

  echo "⬆️ Subindo aplicação (sem build no servidor)..."
  docker compose -f $COMPOSE_FILE up -d $APP_SERVICE

  echo "✅ Deploy finalizado com sucesso!"
EOF
