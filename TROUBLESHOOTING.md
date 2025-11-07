# 🚨 Guia de Troubleshooting - Erro SIGTERM no EasyPanel

**Data**: 07 de Novembro de 2025
**Status**: API fora do ar com erro 502 Bad Gateway

## ❌ Problema Atual

A VigiatTech API está apresentando erro **SIGTERM** no EasyPanel e retornando **502 Bad Gateway**:

```
npm error signal SIGTERM
npm error command sh -c prisma migrate deploy && node src/index.js
```

## 🔍 Possíveis Causas

### 1. **Problema com Prisma Migrations**
- Timeout durante `prisma migrate deploy`
- Banco de dados não responsivo
- Conflito de schema

### 2. **Limite de Recursos**
- Memória insuficiente (atual: 41.6MB pode não ser suficiente)
- CPU limitada
- Timeout de inicialização

### 3. **Problemas de Configuração**
- Variáveis de ambiente inválidas
- Problemas de conectividade com banco

## 🔧 Soluções Implementadas

### Scripts de Inicialização Criados

1. **`start.sh`** - Script robusto com verificações
2. **`start-simple.sh`** - Versão mínima sem migrations
3. **Novos scripts no package.json**

### Opções de Scripts para Testar no EasyPanel

#### Opção 1: Script Robusto
```bash
# No EasyPanel, altere o comando de start para:
npm run start
# Isso executa o ./start.sh com verificações completas
```

#### Opção 2: Versão Simples (sem migrations)
```bash
# No EasyPanel, altere o comando de start para:
npm run start:simple
# Isso executa apenas: node src/index.js
```

#### Opção 3: Comando Direto Mínimo
```bash
# No EasyPanel, altere o comando de start para:
node src/index.js
# Bypass completo do Prisma migrations
```

## 🎯 Passos para Resolver no EasyPanel

### Passo 1: Aumentar Recursos
No painel do app:
- **Memory**: Aumentar para **512MB** ou **1GB**
- **CPU**: Aumentar para **1 core**

### Passo 2: Alterar Comando de Start
No painel do app, em "Build & Deploy":
- **Start Command**: Mudar de `npm start` para:
  ```bash
  node src/index.js
  ```

### Passo 3: Executar Migrations Manualmente
Após o app subir, no Console do EasyPanel:
```bash
npx prisma generate
npx prisma migrate deploy --accept-data-loss
```

### Passo 4: Verificar Logs
Monitorar os logs para ver se há outros erros.

## 🔄 Alternativas de Deploy

### Alternativa 1: Deploy sem Migrations
1. Usar `node src/index.js` como comando de start
2. Executar migrations manual depois

### Alternativa 2: Pre-build Script
Adicionar no package.json:
```json
{
  "scripts": {
    "build": "prisma generate",
    "start": "node src/index.js"
  }
}
```

### Alternativa 3: Docker (se disponível)
Criar Dockerfile com inicialização controlada.

## 📋 Checklist de Verificação

- [ ] Recursos do container aumentados (512MB+ RAM)
- [ ] Comando de start alterado para `node src/index.js`
- [ ] Variáveis de ambiente verificadas
- [ ] Logs monitorados durante restart
- [ ] Migrations executadas manualmente após inicialização
- [ ] Health check testado: `/health`

## 🚀 Comando de Teste Rápido

Depois de aplicar as correções:
```bash
curl https://teta-vigiatech-api.8ktevp.easypanel.host/health
```

## 📞 Próximos Passos

1. **Imediato**: Alterar comando de start no EasyPanel para `node src/index.js`
2. **Curto prazo**: Aumentar recursos do container
3. **Médio prazo**: Implementar healthchecks mais robustos
4. **Longo prazo**: Considerar usar Docker para maior controle

## 🎯 Objetivo

Ter a API funcionando novamente com:
- ✅ Status 200 no `/health`
- ✅ Endpoints respondendo
- ✅ Banco conectado
- ✅ Processo estável (sem SIGTERM)

---

**💡 Dica**: O problema mais provável é timeout nas migrations. Iniciar sem migrations e executá-las manualmente depois é a abordagem mais segura.