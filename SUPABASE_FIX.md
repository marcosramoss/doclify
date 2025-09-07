# Correção da Tabela de Tecnologias no Supabase

## Problema Identificado

A tabela `technologies` no Supabase estava com problemas de estrutura que impediam o salvamento correto dos dados:

1. **Categorias incorretas**: O schema tinha `infrastructure` em vez de `mobile` e `devops`
2. **Campo description ausente**: O frontend usa o campo `description` mas ele não existia na tabela
3. **Política RLS incorreta**: A política de `signatures` estava referenciando uma coluna inexistente
4. **Índice incorreto**: Havia um índice tentando acessar `signatures.project_id` que não existe

## Como Aplicar a Correção

### Opção 1: Executar o Script de Migração

1. Acesse o **SQL Editor** do seu projeto no Supabase
2. Execute o arquivo `supabase/migration_fix_technologies.sql`
3. Verifique se não há erros na execução

### Opção 2: Executar Comandos Manualmente

Cole e execute os seguintes comandos no SQL Editor do Supabase:

```sql
-- 1. Corrigir constraint de categoria
ALTER TABLE public.technologies DROP CONSTRAINT IF EXISTS technologies_category_check;
ALTER TABLE public.technologies ADD CONSTRAINT technologies_category_check
  CHECK (category IN ('frontend', 'backend', 'database', 'mobile', 'devops', 'other'));

-- 2. Adicionar coluna description
ALTER TABLE public.technologies ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Corrigir política de signatures
DROP POLICY IF EXISTS "Users can manage signatures for own projects" ON public.signatures;
CREATE POLICY "Users can manage signatures for own projects" ON public.signatures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.stakeholders ON stakeholders.project_id = projects.id
      WHERE stakeholders.id = signatures.stakeholder_id
      AND projects.user_id = auth.uid()
    )
  );

-- 4. Remover índice incorreto
DROP INDEX IF EXISTS idx_signatures_project_id;
```

## Verificação

Após executar a correção, verifique se a estrutura está correta:

```sql
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'technologies'
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

O resultado deve mostrar:

- `id` (uuid)
- `project_id` (uuid)
- `name` (text)
- `category` (text)
- `version` (text)
- `description` (text)
- `created_at` (timestamp)

## Teste

Após aplicar as correções:

1. Reinicie o servidor de desenvolvimento (`npm run dev`)
2. Acesse a aplicação e tente criar um novo projeto
3. Adicione algumas tecnologias na etapa "Stack Tecnológico"
4. Verifique se os dados são salvos corretamente no Supabase

## Arquivos Alterados

- ✅ `supabase/schema.sql` - Schema corrigido
- ✅ `supabase/migration_fix_technologies.sql` - Script de migração
- ✅ `src/hooks/useProjects.ts` - Incluído campo description no insert

## Status

- [x] Schema da tabela technologies corrigido
- [x] Política RLS de signatures corrigida
- [x] Índice incorreto removido
- [x] Campo description adicionado ao insert
- [x] Script de migração criado

Após aplicar essas correções, a tabela de tecnologias deve funcionar corretamente!
