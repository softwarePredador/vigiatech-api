# 🚨 GUIA RÁPIDO - EasyPanel 502 Fix

**Data**: 07/11/2025
**Problema**: API local funciona, EasyPanel retorna 502 Bad Gateway

## ✅ Confirmado que Funciona
- ✅ Código testado localmente 
- ✅ Dependencies instaladas
- ✅ Prisma Client funcionando
- ✅ Routes carregam sem erro
- ✅ Dockerfile criado e testado

## 🔧 Ações Imediatas no EasyPanel

### 1. Verificar Configuração Atual
- Acesse o app `vigiatech-api` no EasyPanel
- Vá em **"Settings"** → **"Build & Deploy"**

### 2. Opção A: Usar Docker (RECOMENDADO)
```
Construção: Dockerfile ✅
Port: 3000
Memory: 512MB
```

### 3. Opção B: Ajustar Buildpacks
```
Construção: Buildpacks
Construtor: heroku/buildpack:24
Start Command: (vazio - usa npm start)
Port: 3000
Memory: 512MB
```

### 4. Health Check
```
Path: /health
Port: 3000
Initial Delay: 60 segundos
```

### 5. Variáveis de Ambiente
```env
DATABASE_URL=postgresql://vigiatech:72f73685a575c11480a5@banco_vigiatech-db:5432/vigiatech-db?schema=public
PORT=3000
NODE_ENV=production
JWT_SECRET=vigiatech-jwt-secret-key-change-in-production
OPENAI_API_KEY=[sua-chave]
FIREBASE_PROJECT_ID=vigiatech-1cc9b
```

### 6. Redeploy
- Clique em **"Implantar"** (botão verde)
- Aguarde build completar
- Monitore os logs

## 🧪 Teste Após Deploy

```bash
curl https://teta-vigiatech-api.8ktevp.easypanel.host/health
```

**Resposta esperada**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-07T...",
  "environment": "production"
}
```

## 📞 Se Ainda Não Funcionar

1. **Verifique logs no EasyPanel**
2. **Tente Docker se estava usando Buildpacks**
3. **Aumente memory para 1GB temporariamente**
4. **Execute migrations manualmente no console:**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

---

**💡 O código funciona localmente, então o problema é apenas configuração do EasyPanel!**