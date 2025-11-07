#!/bin/bash

# Script de inicialização MÍNIMO - sem migrations
# Use este se o problema for com o Prisma

echo "🚀 Iniciando VigiatTech API (modo simples)..."

# Apenas gerar o client e iniciar
npx prisma generate
node src/index.js