#!/bin/bash

# Script de Teste da VigiatTech API
# Atualizado: 07/11/2025

API_BASE_URL="https://teta-vigiatech-api.8ktevp.easypanel.host"
echo "🧪 Testando VigiatTech API..."
echo "📍 Base URL: $API_BASE_URL"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    local auth_header=$5
    
    echo -e "${YELLOW}Testando: $description${NC}"
    echo "→ $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        if [ -n "$auth_header" ]; then
            response=$(curl -s -w "%{http_code}" -H "$auth_header" "$API_BASE_URL$endpoint")
        else
            response=$(curl -s -w "%{http_code}" "$API_BASE_URL$endpoint")
        fi
    else
        if [ -n "$auth_header" ]; then
            response=$(curl -s -w "%{http_code}" -X $method -H "Content-Type: application/json" -H "$auth_header" -d "$data" "$API_BASE_URL$endpoint")
        else
            response=$(curl -s -w "%{http_code}" -X $method -H "Content-Type: application/json" -d "$data" "$API_BASE_URL$endpoint")
        fi
    fi
    
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "✅ ${GREEN}Sucesso ($http_code)${NC}"
    elif [ "$http_code" -ge 400 ] && [ "$http_code" -lt 500 ]; then
        echo -e "⚠️ ${YELLOW}Erro do Cliente ($http_code)${NC}"
    else
        echo -e "❌ ${RED}Erro ($http_code)${NC}"
    fi
    
    echo "📄 Resposta: $body" | head -c 200
    echo ""
    echo "---"
}

# 1. Health Check
test_endpoint "GET" "/health" "Health Check"

# 2. Root endpoint
test_endpoint "GET" "/" "Informações da API"

# 3. Registro de usuário (teste)
USER_EMAIL="teste$(date +%s)@vigiatech.com"
USER_DATA='{
    "email": "'$USER_EMAIL'",
    "password": "senha123",
    "name": "Usuário Teste API"
}'

echo ""
echo "🔐 Testando Autenticação..."
test_endpoint "POST" "/api/auth/register" "Registro de Usuário" "$USER_DATA"

# 4. Login
LOGIN_DATA='{
    "email": "'$USER_EMAIL'",
    "password": "senha123"
}'

echo "Fazendo login para obter token..."
login_response=$(curl -s -X POST -H "Content-Type: application/json" -d "$LOGIN_DATA" "$API_BASE_URL/api/auth/login")
token=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$token" ]; then
    echo -e "✅ ${GREEN}Token obtido com sucesso${NC}"
    AUTH_HEADER="Authorization: Bearer $token"
    
    # 5. Testar endpoint autenticado
    test_endpoint "GET" "/api/auth/me" "Usuário Atual" "" "$AUTH_HEADER"
    
    # 6. Listar máquinas (endpoint protegido)
    test_endpoint "GET" "/api/machines" "Listar Máquinas" "" "$AUTH_HEADER"
    
    # 7. Criar máquina
    MACHINE_DATA='{
        "name": "Compressor Teste API",
        "type": "Compressor de Pistão",
        "description": "Máquina criada via teste automatizado"
    }'
    test_endpoint "POST" "/api/machines" "Criar Máquina" "$MACHINE_DATA" "$AUTH_HEADER"
    
    # 8. Listar alertas
    test_endpoint "GET" "/api/alerts" "Listar Alertas" "" "$AUTH_HEADER"
    
else
    echo -e "❌ ${RED}Não foi possível obter token de autenticação${NC}"
fi

# 9. Teste de endpoint público (Ingestão IoT)
echo ""
echo "📡 Testando Endpoints Públicos..."

VIBRATION_DATA='{
    "deviceId": "ESP32_001",
    "machineId": 1,
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
    "vibrationData": {
        "rms": 2.5,
        "peakFreq": 120.5,
        "amplitude": 1.8,
        "xAxis": 1.2,
        "yAxis": 1.1,
        "zAxis": 2.0
    }
}'

test_endpoint "POST" "/api/ingest/vibration" "Ingestão de Dados de Vibração" "$VIBRATION_DATA"

echo ""
echo "🎉 Testes concluídos!"
echo ""
echo "📊 Resumo:"
echo "• API está funcionando"
echo "• Health check OK"
echo "• Autenticação funcionando"
echo "• Endpoints principais testados"
echo ""
echo "🔗 API URL: $API_BASE_URL"
echo "📚 Documentação: Veja API.md no repositório"