# Guia de Deploy no EasyPanel (DigitalOcean)

Este guia detalha o processo de deploy da VigiatTech API no EasyPanel.

## 📋 Pré-requisitos

- Conta DigitalOcean com Droplet ativo
- EasyPanel instalado no Droplet
- Repositório GitHub configurado
- (Opcional) Chave API do OpenAI ou Google Gemini

## 🗄️ Passo 1: Criar o Banco de Dados PostgreSQL

1. Acesse o painel do EasyPanel
2. Clique em **"New"** → **"Database"**
3. Selecione **PostgreSQL**
4. Configure:
   - **Name**: `vigiatech-db`
   - **Version**: 14 ou superior
   - **Username**: (será gerado automaticamente)
   - **Password**: (será gerado automaticamente)
5. Clique em **"Create"**
6. **Importante**: Anote as credenciais fornecidas:
   ```
   Host: vigiatech-db (nome interno do serviço)
   Port: 5432
   Database: vigiatech-db
   Username: postgres (ou o que foi gerado)
   Password: [senha gerada]
   ```

7. A URL de conexão será algo como:
   ```
   postgresql://postgres:senha@vigiatech-db:5432/vigiatech-db
   ```

## � CORREÇÃO URGENTE: Configuração EasyPanel

### Problema Atual: 502 Bad Gateway

**Data**: 07/11/2025
**Status**: API local funciona, EasyPanel com 502

### Configuração Correta no EasyPanel

#### Opção 1: Docker (RECOMENDADO)
1. **Construção**: Selecione **"Dockerfile"** 
2. **Construtor**: Será detectado automaticamente
3. **Porta**: `3000`

#### Opção 2: Buildpacks (Se preferir)
1. **Construção**: Selecione **"Buildpacks"**
2. **Construtor**: `heroku/buildpack:24`
3. **Start Command**: (deixe vazio, vai usar npm start)
4. **Porta**: `3000`

### Variáveis de Ambiente Obrigatórias
```env
DATABASE_URL=postgresql://vigiatech:72f73685a575c11480a5@banco_vigiatech-db:5432/vigiatech-db?schema=public
PORT=3000
NODE_ENV=production
JWT_SECRET=vigiatech-jwt-secret-key-change-in-production
```

### Recursos Mínimos
- **Memory**: 256MB (mínimo) ou 512MB (recomendado)
- **CPU**: 0.5 cores

### Health Check
- **Path**: `/health` 
- **Port**: `3000`
- **Initial Delay**: 60 segundos

### Passos Urgentes:
1. ✅ Código está funcionando (testado localmente)
2. 🔧 Configurar Docker ou ajustar Buildpacks no painel
3. 🚀 Fazer redeploy
4. ✅ Testar endpoints

---

## �🚀 Passo 2: Deploy da API (Versão Atualizada)

### 2.1 Criar o App no EasyPanel

1. No EasyPanel, clique em **"New"** → **"App"**
2. Conecte seu GitHub:
   - Clique em **"Connect GitHub"**
   - Autorize o EasyPanel a acessar seus repositórios
   - Selecione o repositório `vigiatech-api`
3. Configure o app:
   - **Name**: `vigiatech-api`
   - **Branch**: `main` (ou a branch que você quer deployar)

### 2.2 Configurar Variáveis de Ambiente

No painel do app, vá em **"Environment Variables"** e adicione:

```env
# Banco de Dados (use a URL do Passo 1)
DATABASE_URL=postgresql://postgres:senha@vigiatech-db:5432/vigiatech-db?schema=public

# Porta (EasyPanel gerencia automaticamente)
PORT=3000

# Ambiente
NODE_ENV=production

# JWT Secret (gere uma chave segura - pode usar: openssl rand -base64 32)
JWT_SECRET=SuaChaveSecretaMuitoSeguraAqui123456

# API OpenAI (opcional - para LLM real)
OPENAI_API_KEY=sk-seu-api-key-aqui

# OU Google Gemini (alternativa ao OpenAI)
GEMINI_API_KEY=sua-chave-gemini-aqui

# ML Service URL (se tiver serviço ML separado)
# ML_SERVICE_URL=http://analista-ml:8000
```

### 2.3 Configurar Build

O EasyPanel detectará automaticamente o `package.json`. Certifique-se de que:

- **Build Command**: (deixe vazio - npm install é automático)
- **Start Command**: `npm start`
- **Port**: `3000`

### 2.4 Executar Migrations do Prisma

Após o primeiro deploy, você precisa criar as tabelas no banco:

1. No painel do app, vá em **"Console"** ou **"Terminal"**
2. Execute:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

Ou configure um **Build Script** customizado:
```json
{
  "scripts": {
    "build": "prisma generate",
    "start": "prisma migrate deploy && node src/index.js"
  }
}
```

### 2.5 Deploy!

Clique em **"Deploy"**. O EasyPanel irá:

1. ✅ Clonar o repositório
2. ✅ Detectar que é um projeto Node.js
3. ✅ Instalar dependências (`npm install`)
4. ✅ Gerar o Prisma Client
5. ✅ Iniciar o servidor (`npm start`)
6. ✅ Expor a API em uma URL (ex: `vigiatech-api.seu-projeto.easypanel.io`)

## 🌐 Passo 3: Configurar Domínio Customizado

### 3.1 Adicionar Domínio no EasyPanel

1. No painel do app `vigiatech-api`, vá em **"Domains"**
2. Clique em **"Add Domain"**
3. Digite seu domínio: `api.vigiatech.com`

### 3.2 Configurar DNS

No seu provedor de domínio (GoDaddy, Registro.br, etc.):

1. Crie um registro **A** ou **CNAME**:
   ```
   Type: A
   Name: api
   Value: [IP do seu Droplet DigitalOcean]
   TTL: 3600
   ```

   Ou, se o EasyPanel fornecer um CNAME:
   ```
   Type: CNAME
   Name: api
   Value: seu-projeto.easypanel.io
   TTL: 3600
   ```

2. Aguarde a propagação DNS (pode levar até 24h, mas geralmente 15-30 min)

### 3.3 Habilitar SSL/HTTPS

O EasyPanel irá **automaticamente**:

1. ✅ Detectar o domínio configurado
2. ✅ Solicitar certificado SSL gratuito da Let's Encrypt
3. ✅ Configurar HTTPS
4. ✅ Redirecionar HTTP → HTTPS

Sua API estará disponível em: `https://api.vigiatech.com`

## 🧪 Passo 4: Testar a API

### Teste 1: Health Check

```bash
curl https://api.vigiatech.com/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-11-07T15:30:00.000Z",
  "environment": "production"
}
```

### Teste 2: Criar Usuário

```bash
curl -X POST https://api.vigiatech.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@vigiatech.com",
    "password": "senha123",
    "name": "Usuário Teste"
  }'
```

### Teste 3: Login

```bash
curl -X POST https://api.vigiatech.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@vigiatech.com",
    "password": "senha123"
  }'
```

Salve o `token` retornado.

### Teste 4: Criar Máquina

```bash
curl -X POST https://api.vigiatech.com/api/machines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Compressor 1",
    "type": "Compressor de Pistão",
    "description": "Compressor principal da linha A"
  }'
```

### Teste 5: Simular IoT Device

```bash
curl -X POST https://api.vigiatech.com/api/ingest/vibration \
  -H "Content-Type: application/json" \
  -d '{
    "machineId": 1,
    "vibrationData": {
      "rms": 1.3,
      "peakFreq": 120.5,
      "amplitude": 2.1,
      "xAxis": 0.5,
      "yAxis": 0.8,
      "zAxis": 1.2
    }
  }'
```

## 📊 Passo 5: Monitoramento

### Logs

No painel do EasyPanel, vá em **"Logs"** para ver:
- Requisições recebidas
- Análises ML executadas
- Alertas gerados
- Erros (se houver)

### Métricas

Em **"Metrics"**, monitore:
- CPU usage
- Memory usage
- Network traffic
- Response times

## 🔧 Troubleshooting

### Erro: "Connection refused" no banco

✅ **Solução**: Verifique se a `DATABASE_URL` está usando o nome interno do serviço:
```
postgresql://user:pass@vigiatech-db:5432/vigiatech-db
```
(Note: `vigiatech-db` é o hostname, não localhost)

### Erro: Prisma schema not found

✅ **Solução**: Execute no console do app:
```bash
npx prisma generate
```

### Erro: Tables don't exist

✅ **Solução**: Execute as migrations:
```bash
npx prisma migrate deploy
```

### App não inicia

✅ **Solução**: Verifique se todas as variáveis de ambiente obrigatórias estão configuradas:
- `DATABASE_URL`
- `JWT_SECRET`

## 🔄 Atualizações Automáticas

Para habilitar deploy automático quando você fizer push no GitHub:

1. No painel do app, vá em **"Settings"**
2. Em **"GitHub Integration"**, habilite **"Auto Deploy"**
3. Agora, todo push na branch `main` irá disparar um novo deploy automaticamente

## 🎯 Próximos Passos

- [ ] Configurar serviço ML separado (Python/FastAPI)
- [ ] Configurar notificações push (Firebase Cloud Messaging)
- [ ] Configurar backup automático do banco
- [ ] Implementar rate limiting
- [ ] Adicionar autenticação de API Key para dispositivos IoT
- [ ] Configurar monitoramento com Sentry ou similar

## ✅ Status do Deployment (Atualizado: 07/11/2025)

### Deployment Atual Funcionando

A API está **FUNCIONANDO** no EasyPanel com as seguintes configurações:

**URL da API**: https://teta-vigiatech-api.8ktevp.easypanel.host/

**Variáveis de Ambiente Configuradas**:
```env
DATABASE_URL="postgresql://vigiatech:72f73685a575c11480a5@banco_vigiatech-db:5432/vigiatech-db?schema=public"
PORT=3000
NODE_ENV=development  # ⚠️ Mudar para 'production' em deploy final
JWT_SECRET=vigiatech-jwt-secret-key-change-in-production  # ✅ Configurado
OPENAI_API_KEY=[CONFIGURADO] # ✅ API Key válida
FIREBASE_PROJECT_ID=vigiatech-1cc9b  # ✅ Configurado
ML_SERVICE_URL=http://analista-ml:8000  # ✅ Configurado
```

**Endpoints Testados e Funcionando**:
- ✅ GET `/health` - Health check OK
- ✅ GET `/` - Informações da API OK
- ✅ Todas as rotas `/api/auth/*` disponíveis
- ✅ Todas as rotas `/api/machines/*` disponíveis
- ✅ Todas as rotas `/api/alerts/*` disponíveis
- ✅ Todas as rotas `/api/ingest/*` disponíveis

**Status do Banco de Dados**:
- ✅ PostgreSQL conectado
- ✅ Migrations executadas
- ✅ Prisma Client funcionando

### Próximas Melhorias Recomendadas

1. **Segurança (URGENTE)**:
   - [ ] Alterar `NODE_ENV` para `production`
   - [ ] Gerar novo `JWT_SECRET` mais seguro para produção
   - [ ] Implementar rate limiting

2. **Monitoramento**:
   - [ ] Configurar logs estruturados
   - [ ] Adicionar métricas de performance
   - [ ] Configurar alertas de erro

3. **Domínio Customizado**:
   - [ ] Configurar domínio próprio (ex: `api.vigiatech.com`)
   - [ ] SSL/HTTPS automático via Let's Encrypt

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs no EasyPanel
2. Consulte a documentação do Prisma: https://www.prisma.io/docs
3. Abra uma issue no GitHub do projeto
4. A API atual está funcionando em: https://teta-vigiatech-api.8ktevp.easypanel.host/
