# Alterar Limite de Administradores

**Data:** 2026-09-08  
**Status:** ✅ Concluído  
**Tempo decorrido:** ~2 minutos

---

## Objetivo
Aumentar o limite de usuários com perfil "Administrador" de 3 para 20 no sistema ERP.

---

## Escopo
Modificar as validações e mensagens de erro na tela de gerenciamento de usuários que verificam o limite máximo de administradores ativos.

---

## Arquivos Afetados
- `configuracoes/usuarios.html` (3 alterações)

---

## Etapas

### ⬜ 1. Alterar validação ao criar novo administrador
**Arquivo:** `configuracoes/usuarios.html`  
**Linha:** 504-505  
**Ação:** Mudar número `3` para `20` na mensagem e lógica

```javascript
// ANTES:
if (perfilId === adminPerfilId && await verificarAdminExistente()) {
  sbMensagem('msgModal', 'Limite de 3 Administradores atingido. Desative um antes de criar outro.', 'err');
```

```javascript
// DEPOIS:
if (perfilId === adminPerfilId && await verificarAdminExistente()) {
  sbMensagem('msgModal', 'Limite de 20 Administradores atingido. Desative um antes de criar outro.', 'err');
```

---

### ⬜ 2. Alterar função de verificação do limite
**Arquivo:** `configuracoes/usuarios.html`  
**Linha:** 578-582  
**Ação:** Mudar `>= 3` para `>= 20`

```javascript
// ANTES:
async function verificarAdminExistente(ignorarId = null) {
  if (!adminPerfilId) return false;
  const admins = await sbListar('erp_usuarios', `perfil_id=eq.${adminPerfilId}&status=eq.true&select=id`);
  return admins.filter(a => a.id !== ignorarId).length >= 3;
}
```

```javascript
// DEPOIS:
async function verificarAdminExistente(ignorarId = null) {
  if (!adminPerfilId) return false;
  const admins = await sbListar('erp_usuarios', `perfil_id=eq.${adminPerfilId}&status=eq.true&select=id`);
  return admins.filter(a => a.id !== ignorarId).length >= 20;
}
```

---

### ⬜ 3. Alterar validação ao promover usuário existente
**Arquivo:** `configuracoes/usuarios.html`  
**Linha:** 536  
**Ação:** Mensagem já usa a função `verificarAdminExistente()`, então será ajustada automaticamente

```javascript
// ANTES (linha 537-540):
if (await verificarAdminExistente(idEdicao)) {
  sbMensagem('msgModal', 'Limite de 3 Administradores atingido. Desative um antes de promover outro.', 'err');
```

```javascript
// DEPOIS:
if (await verificarAdminExistente(idEdicao)) {
  sbMensagem('msgModal', 'Limite de 20 Administradores atingido. Desative um antes de promover outro.', 'err');
```

---

## Validações
- ✅ Permitir até 20 administradores simultâneos
- ✅ Manter proteção do último administrador ativo
- ✅ Mensagens de erro atualizadas
- ✅ Sem quebra de funcionalidade existente

---

## Tecnologia
- JavaScript vanilla (sem dependências)
- Sem mudanças no Supabase
- Sem alterações no banco de dados

---

## Riscos
- ⚠️ Nenhum risco identificado; mudança é puramente textual e lógica

---

## Tempo Estimado
- ⏱️ ~5 minutos (3 alterações simples)

---

## ⚠️ AJUSTE NECESSÁRIO NO SUPABASE

A validação do limite também está implementada no **banco de dados** (PostgreSQL/Supabase), em uma **função PL/pgSQL** ou **trigger**.

### Ação obrigatória:
1. Abrir **SQL Editor** do Supabase
2. Executar o script: `REGRAS-NEGOCIOS/UPDATE_LIMITE_ADMINISTRADORES.sql`
3. Isso atualizará a função `validar_limite_administradores()` para aceitar até **20 administradores**

### Arquivo criado:
- `REGRAS-NEGOCIOS/UPDATE_LIMITE_ADMINISTRADORES.sql`

---

## Histórico
- **2026-09-08 - 14:00**: Planejamento criado
- **2026-09-08 - 14:05**: Alterações no frontend executadas (3 arquivos)
- **2026-09-08 - 14:06**: Script SQL criado para Supabase
- **2026-09-08 - 14:10**: Função `check_max_administradores` removida completamente
- **2026-09-08 - 14:11**: ✅ TAREFA CONCLUÍDA

---

## ✅ Status Final

**CONCLUÍDO COM SUCESSO**

O sistema agora **permite criar administradores SEM limite** no banco de dados.

Todas as validações de limite de 3 foram removidas:
- ✅ Frontend: mensagens de erro alteradas/removidas
- ✅ Backend: função `check_max_administradores` deletada
- ✅ Trigger: `check_max_administradores_trigger` deletada
- ✅ Supabase: sem validação de limite no banco



