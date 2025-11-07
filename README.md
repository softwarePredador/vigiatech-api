# VigiatTech API

API Node.js para sistema de monitoramento de vibração IoT com integração ML/LLM para manutenção preditiva.

## 📋 Visão Geral

Este projeto implementa a API backend para o VigiatTech - um sistema de monitoramento de vibração em tempo real que utiliza:

- **Machine Learning** para análise de padrões de vibração e detecção de anomalias
- **Large Language Models (LLM)** para gerar diagnósticos em linguagem natural
- **IoT** para coleta de dados de sensores de vibração
- **Arquitetura Assíncrona** para processamento eficiente

## 🏗️ Arquitetura do Sistema

```
[Sensor IoT] → [API Backend] → [ML Service] → [LLM Service]
                    ↓               ↓              ↓
              [PostgreSQL]    [Análise]    [Diagnóstico]
                    ↓
            [App Flutter]
```

### Fluxo de Dados

1. **Dispositivo IoT** envia dados de vibração via Wi-Fi para `/api/ingest/vibration`
2. **API** salva os dados no banco PostgreSQL
3. **ML Service** analisa os dados e detecta anomalias
4. Se anomalia detectada, **LLM Service** gera diagnóstico em linguagem natural
5. **API** cria um alerta e notifica o usuário
6. **App Flutter** consulta os dados via endpoints REST

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

### 1. Clone o repositório

```bash
git clone https://github.com/softwarePredador/vigiatech-api.git
cd vigiatech-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Database - Obtido do EasyPanel
DATABASE_URL="postgresql://usuario:senha@host:5432/vigiatech-db?schema=public"

# JWT Secret - Gere uma chave segura
JWT_SECRET=sua-chave-secreta-aqui

# OpenAI (opcional - para LLM)
OPENAI_API_KEY=sk-...

# Ou Gemini (alternativa ao OpenAI)
GEMINI_API_KEY=...
```

### 4. Configure o banco de dados com Prisma

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrations (criar tabelas)
npm run prisma:migrate
```

### 5. Inicie o servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

A API estará disponível em `http://localhost:3000`

## 📡 Endpoints da API

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Registrar novo usuário | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/me` | Obter usuário atual | ✅ |

### Máquinas

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/machines` | Listar máquinas do usuário | ✅ |
| POST | `/api/machines` | Criar nova máquina | ✅ |
| GET | `/api/machines/:id` | Detalhes da máquina | ✅ |
| PUT | `/api/machines/:id` | Atualizar máquina | ✅ |
| DELETE | `/api/machines/:id` | Deletar máquina | ✅ |
| GET | `/api/machines/:id/vibration-data` | Histórico de vibração | ✅ |

### Alertas

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/alerts` | Listar alertas | ✅ |
| GET | `/api/alerts/:id` | Detalhes do alerta | ✅ |
| PUT | `/api/alerts/:id/resolve` | Resolver alerta | ✅ |
| GET | `/api/alerts/machine/:machineId` | Alertas de uma máquina | ✅ |

### Ingestão de Dados (IoT)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/ingest/vibration` | Receber dados de sensores | ❌* |

*Nota: Em produção, deve ser protegido com API Key

## 🔌 Exemplo de Uso - Dispositivo IoT

### Enviar Dados de Vibração

```javascript
// Exemplo de payload do dispositivo IoT
POST /api/ingest/vibration
Content-Type: application/json

{
  "machineId": 1,
  "vibrationData": {
    "rms": 1.25,
    "peakFreq": 120.5,
    "amplitude": 2.1,
    "xAxis": 0.5,
    "yAxis": 0.8,
    "zAxis": 1.2,
    "rawData": [1.1, 1.2, 1.3, ...]
  },
  "timestamp": "2025-11-07T12:30:00Z"
}
```

### Resposta

```json
{
  "message": "Dados recebidos e sendo processados",
  "dataId": 123
}
```

## 🔌 Exemplo de Uso - App Flutter

### 1. Login

```dart
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "senha123"
}

// Resposta
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "João Silva"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 2. Listar Máquinas

```dart
GET /api/machines
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

// Resposta
[
  {
    "id": 1,
    "name": "Machine 1",
    "type": "Compressor de Pistão",
    "status": "normal",
    "lastMaintenance": "2025-05-15T00:00:00Z",
    "_count": {
      "alerts": 0
    }
  },
  {
    "id": 3,
    "name": "Machine 3",
    "type": "Motor Elétrico",
    "status": "alert",
    "_count": {
      "alerts": 2
    }
  }
]
```

### 3. Obter Alertas

```dart
GET /api/alerts?resolved=false
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

// Resposta
{
  "alerts": [
    {
      "id": 5,
      "timestamp": "2025-11-07T12:35:00Z",
      "severity": "high",
      "status": "Vibração elevada detectada (Desalinhamento)",
      "information": "Detectamos um pico forte em 120.5Hz e suas harmônicas...",
      "anomalyScore": 0.92,
      "machine": {
        "id": 3,
        "name": "Machine 3",
        "type": "Motor Elétrico"
      }
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

## 🤖 Integração com ML e LLM

### ML Service

O sistema suporta dois modos:

1. **Mock Mode (Desenvolvimento)**: Análise baseada em thresholds simples
2. **External Service**: Serviço ML dedicado em Python/FastAPI

Configure `ML_SERVICE_URL` no `.env` para usar serviço externo:

```env
ML_SERVICE_URL=http://analista-ml:8000
```

### LLM Service

Suporta dois provedores:

1. **OpenAI GPT-4**: Configure `OPENAI_API_KEY`
2. **Google Gemini**: Configure `GEMINI_API_KEY`

Se nenhuma API key for configurada, usa modo mock com diagnósticos pré-definidos.

## 🐳 Deploy no EasyPanel (DigitalOcean)

### 1. Configure o Banco de Dados

No EasyPanel, crie um serviço PostgreSQL chamado `vigiatech-db`.

### 2. Configure a API

1. No EasyPanel, crie um novo "App"
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente:
   - `DATABASE_URL` (copie do painel do PostgreSQL)
   - `JWT_SECRET` (gere uma chave segura)
   - `OPENAI_API_KEY` ou `GEMINI_API_KEY` (opcional)
   - `NODE_ENV=production`

4. O EasyPanel irá:
   - Detectar o `package.json`
   - Instalar dependências
   - Executar `npm start`
   - Expor a API em um domínio

### 3. Configure o Domínio

No painel do app, adicione seu domínio customizado (ex: `api.vigiatech.com`).

O EasyPanel irá automaticamente configurar SSL/HTTPS.

## 📊 Schema do Banco de Dados

### Users
- `id`: Identificador único
- `email`: Email (único)
- `password`: Senha hash
- `name`: Nome do usuário

### Machines
- `id`: Identificador único
- `name`: Nome da máquina
- `type`: Tipo (ex: "Compressor de Pistão")
- `status`: normal | warning | alert
- `userId`: Referência ao usuário
- `lastMaintenance`: Data da última manutenção

### VibrationData
- `id`: Identificador único
- `machineId`: Referência à máquina
- `timestamp`: Data/hora da medição
- `rms`: Vibração RMS
- `peakFreq`: Frequência de pico
- `xAxis`, `yAxis`, `zAxis`: Aceleração nos eixos
- `rawData`: Dados brutos (JSON)

### Alerts
- `id`: Identificador único
- `machineId`: Referência à máquina
- `timestamp`: Data/hora do alerta
- `severity`: low | medium | high | critical
- `status`: Título do alerta (gerado pelo LLM)
- `information`: Diagnóstico detalhado (gerado pelo LLM)
- `anomalyScore`: Score de anomalia (0-1)
- `isResolved`: Status de resolução

## 🔒 Segurança

- Senhas são hashadas com bcrypt (salt rounds: 10)
- JWT com expiração de 7 dias
- CORS habilitado (configure domains em produção)
- Validação de entrada em todos os endpoints
- Ownership verification (usuários só acessam suas próprias máquinas)

## 🧪 Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento (hot reload)
npm run dev

# Gerar Prisma Client após alterar schema
npm run prisma:generate

# Criar nova migration
npm run prisma:migrate

# Abrir Prisma Studio (GUI para banco)
npm run prisma:studio
```

## 📝 Licença

MIT

## 👥 Autores

VigiatTech Team
