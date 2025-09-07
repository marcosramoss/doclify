# Script para aplicar migração no Supabase via CLI
# Execute este script após configurar suas credenciais do Supabase

Write-Host "=== Aplicando Migração da Tabela Technologies ==="
Write-Host ""

# Verificar se o Supabase CLI está disponível
try {
    $version = npx supabase --version
    Write-Host "[OK] Supabase CLI versão: $version"
} catch {
    Write-Host "[ERRO] Supabase CLI não encontrado"
    exit 1
}

Write-Host ""
Write-Host "Para aplicar a migração, você precisa:"
Write-Host "1. Ter as credenciais do seu projeto Supabase"
Write-Host "2. Executar os comandos abaixo:"
Write-Host ""

Write-Host "--- OPÇÃO 1: Via SQL Editor do Supabase Dashboard ---"
Write-Host "1. Acesse: https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/sql"
Write-Host "2. Cole o conteúdo do arquivo: supabase/migration_fix_technologies.sql"
Write-Host "3. Execute o script"
Write-Host ""

Write-Host "--- OPÇÃO 2: Via Supabase CLI (Requer configuração) ---"
Write-Host "1. npx supabase login"
Write-Host "2. npx supabase link --project-ref [SEU_PROJECT_REF]"
Write-Host "3. npx supabase db push --include-all"
Write-Host ""

Write-Host "--- OPÇÃO 3: Executar SQL diretamente ---"
Write-Host "npx supabase db push --db-url 'postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]'"
Write-Host ""

Write-Host "=== Conteúdo da Migração ==="
Write-Host ""
Get-Content "supabase/migration_fix_technologies.sql"

Write-Host ""
Write-Host "=== Verificação Pós-Migração ==="
Write-Host "Após aplicar a migração, execute este SQL para verificar:"
Write-Host ""
Write-Host "SELECT column_name, data_type, is_nullable"
Write-Host "FROM information_schema.columns"
Write-Host "WHERE table_name = 'technologies' AND table_schema = 'public'"
Write-Host "ORDER BY ordinal_position;"
Write-Host ""
Write-Host "[OK] Deve mostrar a coluna 'description' na lista"
Write-Host "[OK] A constraint de categoria deve incluir 'mobile' e 'devops'"