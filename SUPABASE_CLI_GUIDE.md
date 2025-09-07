# Guia: Aplicando Migração via Supabase CLI

## Pré-requisitos

- Node.js instalado
- Acesso ao projeto Supabase
- Credenciais do projeto (Project Reference ID)

## Opções para Aplicar a Migração

### 🎯 Opção 1: SQL Editor (Mais Simples)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Cole o conteúdo do arquivo `supabase/migration_fix_technologies.sql`
5. Clique em **Run** para executar

### 🔧 Opção 2: Supabase CLI (Recomendado)

#### Passo 1: Login no Supabase

```bash
npx supabase login
```

#### Passo 2: Vincular ao Projeto

```bash
npx supabase link --project-ref SEU_PROJECT_REF
```

> **Como encontrar o Project Reference:**
>
> - Acesse seu projeto no Supabase Dashboard
> - Vá em Settings > General
> - Copie o "Reference ID"

#### Passo 3: Aplicar Migração

```bash
# Opção A: Push do schema local
npx supabase db push

# Opção B: Executar SQL específico
npx supabase db push --include-all
```

### 🗄️ Opção 3: Conexão Direta ao Banco

```bash
npx supabase db push --db-url "postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

> **Onde encontrar a URL de conexão:**
>
> - Dashboard > Settings > Database
> - Copie a "Connection string"

## Scripts Automatizados

### Windows (PowerShell)

```powershell
.\apply-migration.ps1
```

### Linux/Mac (Bash)

```bash
chmod +x apply-migration.sh
./apply-migration.sh
```

## Verificação Pós-Migração

Após aplicar a migração, execute este SQL para verificar:

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

**Resultado esperado:**

- ✅ Coluna `description` deve aparecer na lista
- ✅ Constraint de categoria deve incluir 'mobile' e 'devops'
- ✅ Política RLS de `signatures` deve estar corrigida

## Comandos Úteis do Supabase CLI

```bash
# Verificar status
npx supabase status

# Ver diferenças
npx supabase db diff

# Reset do banco local (cuidado!)
npx supabase db reset

# Gerar tipos TypeScript
npx supabase gen types typescript --project-id SEU_PROJECT_REF > src/types/supabase.ts
```

## Troubleshooting

### Erro: "Docker not running"

- O Supabase CLI local precisa do Docker
- Para projetos remotos, use as opções 1 ou 2 acima

### Erro: "Permission denied"

- Verifique se você tem permissões no projeto
- Confirme se está logado: `npx supabase login`

### Erro: "Table already exists"

- A migração usa `IF NOT EXISTS` e `IF EXISTS`
- É seguro executar múltiplas vezes

## Próximos Passos

1. ✅ Aplicar a migração usando uma das opções acima
2. ✅ Verificar se a estrutura está correta
3. ✅ Testar a aplicação criando um projeto
4. ✅ Confirmar que as tecnologias são salvas corretamente

---

**💡 Dica:** Mantenha sempre um backup antes de aplicar migrações em produção!
