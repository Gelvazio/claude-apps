# Remover credencial administrativa do código

**Objetivo:** Remover a senha administrativa em texto puro do código, da documentação e do histórico local ainda não publicado.

## 1. Remover autenticação fixa no localhost

**Status:** ✅ Concluído

- Remover o preenchimento automático e os campos somente leitura.
- Restaurar a autenticação com os valores informados pelo usuário.

## 2. Remover referências em texto puro

**Status:** ✅ Concluído

- Excluir a documentação específica do login fixo.
- Remover a senha dos comentários e das regras do projeto.
- Manter somente hashes nos scripts SQL que administram a senha.

## 3. Limpar o histórico antes do push

**Status:** ✅ Concluído

- Consolidar os commits locais sobre a base remota.
- Publicar apenas o histórico sem a credencial em texto puro.

## Verificação permitida

Revisão estática por busca textual, sem executar testes, navegador ou servidor.
