-- Insere as pendências registradas em sistema/pendencias.txt.
-- Execute este script no SQL Editor do projeto Supabase.
-- O filtro por descrição permite executar o script novamente sem duplicar registros.

insert into public.pendencias (
  data,
  descricao,
  status,
  materia_descricao
)
select
  current_date,
  item.descricao,
  'PENDENTE',
  item.materia_descricao
from (
  values
    (
      'CADASTRAR E FINALIZAR A TURMA DE INTRODUCAO A TIC DE PG',
      'Introdução à Tecnologia da Informação e Comunicação'
    ),
    (
      'CADASTRAR A AVALIACAO DE SOCIOEMOCIONAL COM BASE NA PLANILHA DE ANALISE DE COMPORTAMENTO',
      'Introdução à Tecnologia da Informação e Comunicação'
    ),
    (
      'CADASTRAR A 3 NOTA COM BASE NAS ENTREGAS DAS RESPOSTAS DAS PERGUNTAS DAS AULAS GOOGLE FORMS',
      'Introdução à Tecnologia da Informação e Comunicação'
    ),
    (
      'CADASTRAR AS NOTAS DA TURMA DE CONTRATURNO DO CEPLAS DA MATERIA DE REFORÇO DE LINGUAGENS',
      'Reforço de Linguagens'
    ),
    (
      'CADASTRAR AS NOTAS DA TURMA DE CONTRATURNO DO CEPLAS DA MATERIA DE INTROD.COMUN. ORAL E ESCRITA',
      'Introdução à Comunicação Oral e Escrita para o Mundo do Trabalho'
    ),
    (
      'CADASTRAR AS NOTAS DA OFICINA NO CEPLAS DA MATERIA DE EMPREENDEDORISMO',
      'Empreendedorismo'
    ),
    (
      'FINALIZAR O PLANO DE ENSINO DE EXPLORACAO DE CARREIRAS INDUSTRIAIS',
      'Exploração de Carreiras Industriais'
    ),
    (
      'CRIAR AS AULAS DE PERIODOS DE 2 HORAS PARA A MATERIA DE REFORÇO DE MATEMATICA E RACIOCINIO LOGICO',
      'Reforço de Matemática e Raciocínio Lógico'
    ),
    (
      'CRIAR AS AULAS DE PERIODOS DE 2 HORAS PARA A MATERIA DE REFORÇO LINGUAGENS',
      'Reforço de Linguagens'
    ),
    (
      'CRIAR AS AULAS DE 2 HORAS PARA A MATERIA DE ANALISE DE DADOS APLICADA A GESTAO',
      'Análise de Dados Aplicada à Gestão'
    ),
    (
      'CRIAR AS AULAS DE 2 HORAS PARA A MATERIA DE TESTES DE FRONTEND',
      'Testes de Frontend'
    )
) as item(descricao, materia_descricao)
where not exists (
  select 1
  from public.pendencias existente
  where upper(trim(existente.descricao)) = upper(trim(item.descricao))
);
