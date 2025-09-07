#!/bin/bash

# Script para aplicar migração no Supabase via CLI
# Execute este script após configurar suas credenciais do Supabase

echo "=== Aplicando Migração da Tabela Technologies ==="
echo ""

# Verificar se o Supabase CLI está disponível
if command -v npx &> /dev/null; then
    VERSION=$(npx supabase --version 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "✓ Supabase CLI versão: $VERSION"
    else
        echo "✗ Erro: Supabase CLI não encontrado"
        exit 1
    fi
else
    echo "✗ Erro: npx não encontrado"
    exit 1
fi

echo ""
echo "Para aplicar a migração, você precisa:"
echo "1. Ter as credenciais do seu projeto Supabase"
echo "2. Executar os comandos abaixo:"
echo ""

echo "--- OPÇÃO 1: Via SQL Editor do Supabase Dashboard ---"
echo "1. Acesse: https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/sql"
echo "2. Cole o conteúdo do arquivo: supabase/migration_fix_technologies.sql"
echo "3. Execute o script"
echo ""

echo "--- OPÇÃO 2: Via Supabase CLI (Requer configuração) ---"
echo "1. npx supabase login"
echo "2. npx supabase link --project-ref [SEU_PROJECT_REF]"
echo "3. npx supabase db push --include-all"
echo ""

echo "--- OPÇÃO 3: Executar SQL diretamente ---"
echo "npx supabase db push --db-url 'postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]'"
echo ""

echo "=== Conteúdo da Migração ==="
echo ""
cat "supabase/migration_fix_technologies.sql"

echo ""
echo "=== Verificação Pós-Migração ==="
echo "Após aplicar a migração, execute este SQL para verificar:"
echo ""
echo "SELECT column_name, data_type, is_nullable"
echo "FROM information_schema.columns"
echo "WHERE table_name = 'technologies' AND table_schema = 'public'"
echo "ORDER BY ordinal_position;"
echo ""
echo "✓ Deve mostrar a coluna 'description' na lista"
echo "✓ A constraint de categoria deve incluir 'mobile' e 'devops'"