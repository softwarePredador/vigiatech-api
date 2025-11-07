# API Documentation - VigiatTech

Documentação completa dos endpoints da VigiatTech API.

**Base URL**: `https://api.vigiatech.com` (ou seu domínio configurado)

## 📑 Índice

- [Autenticação](#autenticação)
- [Máquinas](#máquinas)
- [Alertas](#alertas)
- [Ingestão de Dados (IoT)](#ingestão-de-dados-iot)
- [Códigos de Erro](#códigos-de-erro)

---

## 🔐 Autenticação

### Registrar Usuário

Cria uma nova conta de usuário.

**Endpoint**: `POST /api/auth/register`

**Headers**: 
```
Content-Type: application/json
```

**Body**:
```json
{
  "email": "usuario@example.com",
  "password": "senha-segura-123",
  "name": "Nome do Usuário"
}
```

**Resposta de Sucesso** (201):
```json
{
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "Nome do Usuário",
    "createdAt": "2025-11-07T15:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Login

Autentica um usuário existente.

**Endpoint**: `POST /api/auth/login`

**Headers**: 
```
Content-Type: application/json
```

**Body**:
```json
{
  "email": "usuario@example.com",
  "password": "senha-segura-123"
}
```

**Resposta de Sucesso** (200):
```json
{
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "Nome do Usuário"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Obter Usuário Atual

Retorna informações do usuário autenticado.

**Endpoint**: `GET /api/auth/me`

**Headers**: 
```
Authorization: Bearer {token}
```

**Resposta de Sucesso** (200):
```json
{
  "id": 1,
  "email": "usuario@example.com",
  "name": "Nome do Usuário",
  "createdAt": "2025-11-07T15:00:00.000Z"
}
```

---

## 🏭 Máquinas

### Listar Máquinas

Retorna todas as máquinas do usuário autenticado.

**Endpoint**: `GET /api/machines`

**Headers**: 
```
Authorization: Bearer {token}
```

**Resposta de Sucesso** (200):
```json
[
  {
    "id": 1,
    "name": "Compressor 1",
    "type": "Compressor de Pistão",
    "description": "Compressor principal",
    "status": "normal",
    "userId": 1,
    "createdAt": "2025-11-07T10:00:00.000Z",
    "updatedAt": "2025-11-07T10:00:00.000Z",
    "lastMaintenance": "2025-05-15T00:00:00.000Z",
    "_count": {
      "alerts": 0
    }
  },
  {
    "id": 2,
    "name": "Motor Elétrico 3",
    "type": "Motor Trifásico",
    "description": null,
    "status": "alert",
    "userId": 1,
    "createdAt": "2025-11-07T11:00:00.000Z",
    "updatedAt": "2025-11-07T14:00:00.000Z",
    "lastMaintenance": null,
    "_count": {
      "alerts": 3
    }
  }
]
```

---

### Criar Máquina

Registra uma nova máquina no sistema.

**Endpoint**: `POST /api/machines`

**Headers**: 
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body**:
```json
{
  "name": "Compressor 2",
  "type": "Compressor de Parafuso",
  "description": "Compressor secundário da linha B",
  "lastMaintenance": "2025-06-01T00:00:00.000Z"
}
```

**Resposta de Sucesso** (201):
```json
{
  "id": 3,
  "name": "Compressor 2",
  "type": "Compressor de Parafuso",
  "description": "Compressor secundário da linha B",
  "status": "normal",
  "userId": 1,
  "createdAt": "2025-11-07T15:30:00.000Z",
  "updatedAt": "2025-11-07T15:30:00.000Z",
  "lastMaintenance": "2025-06-01T00:00:00.000Z"
}
```

---

### Obter Detalhes da Máquina

Retorna informações detalhadas de uma máquina específica.

**Endpoint**: `GET /api/machines/:id`

**Headers**: 
```
Authorization: Bearer {token}
```

**Resposta de Sucesso** (200):
```json
{
  "id": 2,
  "name": "Motor Elétrico 3",
  "type": "Motor Trifásico",
  "description": null,
  "status": "alert",
  "userId": 1,
  "createdAt": "2025-11-07T11:00:00.000Z",
  "updatedAt": "2025-11-07T14:00:00.000Z",
  "lastMaintenance": null,
  "alerts": [
    {
      "id": 5,
      "machineId": 2,
      "timestamp": "2025-11-07T14:00:00.000Z",
      "severity": "high",
      "status": "Vibração elevada detectada (Desalinhamento)",
      "information": "Detectamos um pico forte em 120.5Hz...",
      "anomalyScore": 0.92,
      "resolvedAt": null,
      "isResolved": false,
      "mlFeatures": {...}
    }
  ]
}
```

---

### Atualizar Máquina

Atualiza informações de uma máquina.

**Endpoint**: `PUT /api/machines/:id`

**Headers**: 
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body** (todos os campos são opcionais):
```json
{
  "name": "Compressor 2 - Atualizado",
  "status": "normal",
  "lastMaintenance": "2025-11-07T00:00:00.000Z"
}
```

**Resposta de Sucesso** (200):
```json
{
  "id": 3,
  "name": "Compressor 2 - Atualizado",
  "type": "Compressor de Parafuso",
  "description": "Compressor secundário da linha B",
  "status": "normal",
  "userId": 1,
  "createdAt": "2025-11-07T15:30:00.000Z",
  "updatedAt": "2025-11-07T16:00:00.000Z",
  "lastMaintenance": "2025-11-07T00:00:00.000Z"
}
```

---

### Deletar Máquina

Remove uma máquina do sistema (também remove todos os dados associados).

**Endpoint**: `DELETE /api/machines/:id`

**Headers**: 
```
Authorization: Bearer {token}
```

**Resposta de Sucesso** (204):
```
No Content
```

---

### Obter Dados de Vibração

Retorna o histórico de dados de vibração de uma máquina.

**Endpoint**: `GET /api/machines/:id/vibration-data`

**Headers**: 
```
Authorization: Bearer {token}
```

**Query Parameters**:
- `limit` (opcional, padrão: 100): Número de registros
- `offset` (opcional, padrão: 0): Offset para paginação

**Exemplo**: `GET /api/machines/2/vibration-data?limit=50&offset=0`

**Resposta de Sucesso** (200):
```json
[
  {
    "id": 123,
    "machineId": 2,
    "timestamp": "2025-11-07T14:00:00.000Z",
    "rms": 1.25,
    "peakFreq": 120.5,
    "amplitude": 2.1,
    "xAxis": 0.5,
    "yAxis": 0.8,
    "zAxis": 1.2,
    "rawData": [1.1, 1.2, 1.3, ...]
  },
  ...
]
```

---

## 🚨 Alertas

### Listar Alertas

Retorna todos os alertas do usuário.

**Endpoint**: `GET /api/alerts`

**Headers**: 
```
Authorization: Bearer {token}
```

**Query Parameters**:
- `resolved` (opcional): `true` ou `false`
- `severity` (opcional): `low`, `medium`, `high`, `critical`
- `limit` (opcional, padrão: 50): Número de registros
- `offset` (opcional, padrão: 0): Offset para paginação

**Exemplo**: `GET /api/alerts?resolved=false&severity=high&limit=20`

**Resposta de Sucesso** (200):
```json
{
  "alerts": [
    {
      "id": 5,
      "machineId": 2,
      "timestamp": "2025-11-07T14:00:00.000Z",
      "severity": "high",
      "status": "Vibração elevada detectada (Desalinhamento)",
      "information": "Detectamos um pico forte em 120.5Hz e suas harmônicas (241Hz, 361.5Hz), o que é um indicador clássico de desalinhamento do eixo. A vibração RMS de 1.25 está elevada. Recomendamos agendar uma inspeção para alinhamento a laser.",
      "anomalyScore": 0.92,
      "resolvedAt": null,
      "isResolved": false,
      "mlFeatures": {
        "rms_vibration": 1.25,
        "peak_frequency": 120.5,
        "dominant_harmonics": [241, 361.5]
      },
      "machine": {
        "id": 2,
        "name": "Motor Elétrico 3",
        "type": "Motor Trifásico"
      }
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

---

### Obter Detalhes do Alerta

Retorna informações detalhadas de um alerta específico.

**Endpoint**: `GET /api/alerts/:id`

**Headers**: 
```
Authorization: Bearer {token}
```

**Resposta de Sucesso** (200):
```json
{
  "id": 5,
  "machineId": 2,
  "timestamp": "2025-11-07T14:00:00.000Z",
  "severity": "high",
  "status": "Vibração elevada detectada (Desalinhamento)",
  "information": "Detectamos um pico forte em 120.5Hz...",
  "anomalyScore": 0.92,
  "resolvedAt": null,
  "isResolved": false,
  "mlFeatures": {...},
  "machine": {
    "id": 2,
    "name": "Motor Elétrico 3",
    "type": "Motor Trifásico",
    "userId": 1
  }
}
```

---

### Resolver Alerta

Marca um alerta como resolvido.

**Endpoint**: `PUT /api/alerts/:id/resolve`

**Headers**: 
```
Authorization: Bearer {token}
```

**Resposta de Sucesso** (200):
```json
{
  "id": 5,
  "machineId": 2,
  "timestamp": "2025-11-07T14:00:00.000Z",
  "severity": "high",
  "status": "Vibração elevada detectada (Desalinhamento)",
  "information": "Detectamos um pico forte em 120.5Hz...",
  "anomalyScore": 0.92,
  "resolvedAt": "2025-11-07T16:30:00.000Z",
  "isResolved": true,
  "mlFeatures": {...}
}
```

---

### Obter Alertas de uma Máquina

Retorna todos os alertas de uma máquina específica.

**Endpoint**: `GET /api/alerts/machine/:machineId`

**Headers**: 
```
Authorization: Bearer {token}
```

**Query Parameters**:
- `limit` (opcional, padrão: 20): Número de registros
- `offset` (opcional, padrão: 0): Offset para paginação

**Resposta de Sucesso** (200):
```json
[
  {
    "id": 5,
    "machineId": 2,
    "timestamp": "2025-11-07T14:00:00.000Z",
    "severity": "high",
    "status": "Vibração elevada detectada (Desalinhamento)",
    "information": "Detectamos um pico forte em 120.5Hz...",
    "anomalyScore": 0.92,
    "resolvedAt": null,
    "isResolved": false,
    "mlFeatures": {...}
  }
]
```

---

## 📡 Ingestão de Dados (IoT)

### Enviar Dados de Vibração

Endpoint usado pelos dispositivos IoT para enviar dados de vibração.

**Endpoint**: `POST /api/ingest/vibration`

**Headers**: 
```
Content-Type: application/json
```

**Body**:
```json
{
  "machineId": 2,
  "vibrationData": {
    "rms": 1.25,
    "peakFreq": 120.5,
    "amplitude": 2.1,
    "xAxis": 0.5,
    "yAxis": 0.8,
    "zAxis": 1.2,
    "rawData": [1.1, 1.2, 1.3, 1.4, 1.5]
  },
  "timestamp": "2025-11-07T14:00:00.000Z"
}
```

**Campos**:
- `machineId` (obrigatório): ID da máquina
- `vibrationData` (obrigatório): Objeto com dados de vibração
  - `rms` (obrigatório): Valor RMS da vibração
  - `peakFreq` (obrigatório): Frequência de pico em Hz
  - `amplitude` (opcional): Amplitude da vibração
  - `xAxis`, `yAxis`, `zAxis` (opcional): Aceleração nos 3 eixos
  - `rawData` (opcional): Array com dados brutos do sensor
- `timestamp` (opcional): Data/hora da medição (padrão: now)

**Resposta de Sucesso** (202):
```json
{
  "message": "Dados recebidos e sendo processados",
  "dataId": 123
}
```

**Nota**: A análise ML e geração de alertas ocorre de forma assíncrona. Se um alerta for gerado, o usuário será notificado posteriormente.

---

## ⚠️ Códigos de Erro

### 400 - Bad Request
```json
{
  "error": "Email e senha são obrigatórios"
}
```

### 401 - Unauthorized
```json
{
  "error": "Token não fornecido"
}
```

```json
{
  "error": "Token inválido"
}
```

```json
{
  "error": "Credenciais inválidas"
}
```

### 403 - Forbidden
```json
{
  "error": "Acesso negado"
}
```

### 404 - Not Found
```json
{
  "error": "Máquina não encontrada"
}
```

```json
{
  "error": "Endpoint não encontrado"
}
```

### 500 - Internal Server Error
```json
{
  "error": "Erro interno do servidor",
  "message": "Detalhes do erro (apenas em desenvolvimento)"
}
```

---

## 💡 Dicas de Uso

### 1. Autenticação

Todos os endpoints protegidos exigem o header `Authorization`:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

O token é obtido nos endpoints `/api/auth/login` ou `/api/auth/register`.

### 2. Paginação

Use os parâmetros `limit` e `offset` para paginar resultados:

```
GET /api/machines/2/vibration-data?limit=100&offset=200
```

### 3. Filtragem de Alertas

Combine múltiplos filtros:

```
GET /api/alerts?resolved=false&severity=high&limit=10
```

### 4. Dispositivos IoT

Para produção, considere implementar autenticação por API Key para os dispositivos IoT, em vez de deixar o endpoint `/api/ingest/vibration` totalmente aberto.

---

## 🔗 Recursos Adicionais

- [README.md](README.md) - Documentação geral do projeto
- [DEPLOY.md](DEPLOY.md) - Guia de deploy no EasyPanel
- [Prisma Schema](prisma/schema.prisma) - Estrutura do banco de dados
