#!/bin/bash

# Teste rápido para verificar se a API voltou
# Execute este script após fazer as alterações no EasyPanel

API_URL="https://teta-vigiatech-api.8ktevp.easypanel.host"

echo "🔍 Testando se a API voltou online..."
echo "URL: $API_URL"
echo ""

# Teste simples do health check
echo "📍 Testando /health..."
response=$(curl -s -w "%{http_code}" "$API_URL/health")
http_code="${response: -3}"

if [ "$http_code" = "200" ]; then
    echo "✅ API ESTÁ ONLINE! 🎉"
    echo "🚀 Executando teste completo..."
    ./test-api.sh
else
    echo "❌ API ainda offline (HTTP $http_code)"
    echo "💡 Verifique os logs no EasyPanel"
    echo "⚠️ Aguarde alguns minutos e tente novamente"
fi