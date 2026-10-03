#!/bin/bash
set -euo pipefail

echo "========================================="
echo "   AuraCommerce Cloud VM Deployer"
echo "========================================="

if [ -z "${1:-}" ]; then
  echo "Usage: ./scripts/deploy-cloud-vm.sh <user@server-ip> [ssh-key-path]"
  echo "Example: ./scripts/deploy-cloud-vm.sh ubuntu@35.180.20.10 ~/.ssh/id_rsa"
  exit 1
fi

SERVER="$1"
SSH_KEY="${2:-}"
SSH_OPTS=""
if [ -n "$SSH_KEY" ]; then
  SSH_OPTS="-i $SSH_KEY"
fi

echo "[1/3] Cloning or pulling latest master on server..."
ssh $SSH_OPTS "$SERVER" "
  if [ ! -d ~/ECOM ]; then
    git clone https://github.com/akashqumar/ECOM.git ~/ECOM
  else
    cd ~/ECOM && git fetch origin && git checkout master && git pull origin master
  fi
"

echo "[2/3] Building and starting all cloud microservices & databases..."
ssh $SSH_OPTS "$SERVER" "
  cd ~/ECOM
  docker compose -f docker-compose.cloud.yml up -d --build
"

echo "[3/3] Checking service health..."
ssh $SSH_OPTS "$SERVER" "
  cd ~/ECOM
  docker compose -f docker-compose.cloud.yml ps
"

echo "========================================="
echo "Deployment completed successfully!"
echo "API Gateway is live on: http://${SERVER#*@}:8080/api"
echo "Attach this IP to Vercel VITE_API_URL and redeploy frontend."
echo "========================================="
