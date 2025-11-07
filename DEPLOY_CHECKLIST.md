# 🚀 Checklist de Deploy - VigiatTech API

Use este checklist antes de fazer o deploy no EasyPanel.

## ✅ Pré-Deploy - Verificações Locais

### 1. Dependências e Configuração
- [x] `package.json` atualizado com scripts corretos
- [x] `.nvmrc` criado com versão do Node.js
- [x] `.env.example` atualizado com todas as variáveis
- [x] `.gitignore` configurado (não commitar `.env` ou credenciais)
- [x] Credenciais Firebase em `config/firebase/` e no `.gitignore`

### 2. Código e Estrutura
- [ ] Todos os arquivos estão sem erros de sintaxe
- [ ] Health check endpoint `/health` funcional
- [ ] Migrations do Prisma criadas e testadas localmente
- [ ] Todas as rotas principais implementadas

### 3. Testes Locais
```bash
# Testar se o projeto inicia
npm install
npm run dev

# Testar o health check
curl http://localhost:3000/health

# Testar endpoints principais
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@test.com","password":"123456","name":"Teste"}'
```

### 4. Git e GitHub
- [ ] Fazer commit de todas as mudanças
- [ ] Push para o repositório GitHub
- [ ] Verificar se o repositório está público ou EasyPanel tem acesso

```bash
git add .
git commit -m "feat: preparar API para deploy no EasyPanel"
git push origin main
```

---

## 🗄️ Deploy no EasyPanel - Passo a Passo

### PASSO 1: Criar Banco de Dados PostgreSQL

1. Acesse o EasyPanel
2. Clique em **"New"** → **"Database"** → **"PostgreSQL"**
3. Configure:
   - Name: `vigiatech-db`
   - Version: 14+
4. **Anote as credenciais geradas**:
   ```
   Username: ____________
   Password: ____________
   Host: banco_vigiatech-db (interno)
   Port: 5432
   Database: vigiatech-db
   ```

### PASSO 2: Criar Aplicação

1. Clique em **"New"** → **"App"**
2. Conecte ao GitHub e selecione `vigiatech-api`
3. Configure:
   - Name: `vigiatech-api`
   - Branch: `main`

### PASSO 3: Configurar Variáveis de Ambiente

Vá em **"Environment Variables"** e adicione:

```env
# OBRIGATÓRIAS
DATABASE_URL=postgresql://usuario:senha@banco_vigiatech-db:5432/vigiatech-db?schema=public
PORT=3000
NODE_ENV=production
JWT_SECRET=gere-uma-chave-segura-aqui-use-openssl-rand-base64-32

# OPCIONAIS (mas recomendadas)
OPENAI_API_KEY=sk-seu-api-key-aqui
FIREBASE_PROJECT_ID=vigiatech-1cc9b
FIREBASE_PRIVATE_KEY=cole-a-chave-privada-aqui-com-aspas
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@vigiatech-1cc9b.iam.gserviceaccount.com
```

**⚠️ IMPORTANTE**: Para o `FIREBASE_PRIVATE_KEY`, cole o valor COMPLETO incluindo:
```
"-----BEGIN PRIVATE KEY-----\nMII....\n-----END PRIVATE KEY-----\n"
```

### PASSO 4: Configurar Build

O EasyPanel detecta automaticamente o Node.js via `package.json`.

Certifique-se de que:
- **Build Command**: (deixe vazio - automático)
- **Start Command**: `npm start`
- **Port**: `3000`

### PASSO 5: Deploy Inicial

1. Clique em **"Deploy"**
2. Aguarde o build completar
3. Verifique os logs para erros

### PASSO 6: Verificar Migrations

Após o primeiro deploy, as migrations devem rodar automaticamente via `npm start`.

Se precisar rodar manualmente:
1. Acesse **"Console"** no painel do app
2. Execute:
```bash
npx prisma migrate deploy
```

### PASSO 7: Testar a API

```bash
# Health check
curl https://sua-url.easypanel.io/health

# Criar usuário de teste
curl -X POST https://sua-url.easypanel.io/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@vigiatech.com","password":"senha123","name":"Teste"}'

# Login
curl -X POST https://sua-url.easypanel.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@vigiatech.com","password":"senha123"}'
```

### PASSO 8: Configurar Domínio Customizado (Opcional)

1. No painel do app, vá em **"Domains"**
2. Adicione: `api.vigiatech.com`
3. Configure DNS no seu provedor:
   ```
   Type: A
   Name: api
   Value: [IP do Droplet]
   ```
4. Aguarde SSL automático (Let's Encrypt)

---

## 🔍 Troubleshooting

### Erro: "Cannot find module '@prisma/client'"
**Solução**: Certifique-se de que `postinstall` está no `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Erro: "Database connection failed"
**Solução**: Verifique:
1. URL do banco está correta no `.env`
2. O host é `banco_vigiatech-db` (nome interno do serviço)
3. As credenciais estão corretas

### Erro: "Migrations failed"
**Solução**: 
1. Acesse o console do app
2. Execute manualmente:
```bash
npx prisma migrate deploy
```

### Erro: "Port already in use"
**Solução**: O EasyPanel gerencia a porta automaticamente. Certifique-se de usar `process.env.PORT`:
```javascript
const port = process.env.PORT || 3000;
```

### API não responde / 502 Bad Gateway
**Solução**: Verifique:
1. Logs do app no EasyPanel
2. Se o servidor iniciou corretamente
3. Se a porta está configurada corretamente

---

## ✅ Checklist Final

Após o deploy, verifique:

- [ ] API responde em `/health` com status 200
- [ ] Possível criar usuário via `/api/auth/register`
- [ ] Possível fazer login via `/api/auth/login`
- [ ] Banco de dados conectado e migrations aplicadas
- [ ] Logs do servidor sem erros críticos
- [ ] SSL/HTTPS funcionando (se configurou domínio customizado)
- [ ] Variáveis de ambiente todas configuradas
- [ ] Firebase configurado (se for usar notificações)

---

## 📝 Próximos Passos

1. **Integrar com App Flutter**: Atualizar a URL base da API no app
2. **Configurar Dispositivo IoT**: Apontar para a URL da API de produção
3. **Monitorar Logs**: Verificar logs no EasyPanel regularmente
4. **Backups**: Configurar backup automático do PostgreSQL
5. **CI/CD**: Configurar deploy automático quando fizer push no GitHub

---

## 🔗 Links Úteis

- **EasyPanel Docs**: https://easypanel.io/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **GitHub Repo**: https://github.com/softwarePredador/vigiatech-api
- **API Docs**: Ver `API.md` no repositório
- **Deploy Guide**: Ver `DEPLOY.md` no repositório

---

**Data da última atualização**: 7 de novembro de 2025
**Versão da API**: 1.0.0
