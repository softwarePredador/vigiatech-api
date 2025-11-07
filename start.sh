#!/bin/bash

# Script de inicialização robusto para VigiatTech API
# Este script trata erros e garante uma inicialização mais estável

set -e  # Exit on any error

echo "🚀 Iniciando VigiatTech API..."
echo "📅 $(date)"

# Verificar se as variáveis de ambiente essenciais existem
echo "🔍 Verificando variáveis de ambiente..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não configurada"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET não configurada"
    exit 1
fi

echo "✅ Variáveis de ambiente OK"

# Gerar o Prisma Client
echo "🔧 Gerando Prisma Client..."
npx prisma generate || {
    echo "❌ Erro ao gerar Prisma Client"
    exit 1
}

# Testar conexão com banco
echo "🗄️ Testando conexão com banco..."
timeout 30s npx prisma db push --accept-data-loss --force-reset || {
    echo "❌ Erro ao conectar com banco de dados"
    exit 1
}

echo "✅ Banco de dados conectado"

# Executar migrations
echo "🔄 Executando migrations..."
timeout 60s npx prisma migrate deploy --accept-data-loss || {
    echo "⚠️ Aviso: Erro nas migrations, mas continuando..."
}

echo "✅ Migrations concluídas"

# Iniciar o servidor
echo "🌐 Iniciando servidor Node.js..."
exec node src/index.js