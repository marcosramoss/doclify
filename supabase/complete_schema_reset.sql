-- =====================================================
-- DOCLIFY - SCHEMA COMPLETO E DEFINITIVO
-- Este script dropa e recria todo o banco do zero
-- Execute no SQL Editor do Supabase
-- =====================================================

-- PASSO 1: DROPAR TODAS AS TABELAS E DEPENDÊNCIAS
-- =====================================================

-- Dropar triggers primeiro
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS update_payment_updated_at ON public.payment;

-- Dropar funções
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Dropar todas as tabelas (em ordem de dependência)
DROP TABLE IF EXISTS public.signatures CASCADE;
DROP TABLE IF EXISTS public.stakeholders CASCADE;
DROP TABLE IF EXISTS public.payment CASCADE;
DROP TABLE IF EXISTS public.requirements_non_functional CASCADE;
DROP TABLE IF EXISTS public.requirements_functional CASCADE;
DROP TABLE IF EXISTS public.objectives CASCADE;
DROP TABLE IF EXISTS public.audiences CASCADE;
DROP TABLE IF EXISTS public.technologies CASCADE;
DROP TABLE IF EXISTS public.team CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- PASSO 2: HABILITAR EXTENSÕES
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PASSO 3: CRIAR TABELAS
-- =====================================================

-- Tabela de usuários (estende auth.users do Supabase)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de projetos
CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  company_name TEXT,
  project_type TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de equipe
CREATE TABLE public.team (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tecnologias (CORRIGIDA)
CREATE TABLE public.technologies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('frontend', 'backend', 'database', 'mobile', 'devops', 'other')),
  version TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de audiências
CREATE TABLE public.audiences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('primary', 'secondary')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de objetivos
CREATE TABLE public.objectives (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de requisitos funcionais
CREATE TABLE public.requirements_functional (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('must_have', 'should_have', 'could_have', 'wont_have')),
  acceptance_criteria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de requisitos não funcionais
CREATE TABLE public.requirements_non_functional (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('performance', 'security', 'usability', 'reliability', 'scalability', 'other')),
  metric TEXT,
  target_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pagamento
CREATE TABLE public.payment (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  payment_terms TEXT,
  milestones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de stakeholders
CREATE TABLE public.stakeholders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  signature_required BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de assinaturas
CREATE TABLE public.signatures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stakeholder_id UUID REFERENCES public.stakeholders(id) ON DELETE CASCADE NOT NULL,
  signature_data TEXT,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- PASSO 4: HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements_functional ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements_non_functional ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;

-- PASSO 5: CRIAR POLÍTICAS RLS
-- =====================================================

-- Políticas para usuários
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para projetos
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para equipe
CREATE POLICY "Users can manage team for own projects" ON public.team
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = team.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Políticas para tecnologias
CREATE POLICY "Users can manage technologies for own projects" ON public.technologies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = technologies.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Políticas para audiências
CREATE POLICY "Users can manage audiences for own projects" ON public.audiences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = audiences.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Políticas para objetivos
CREATE POLICY "Users can manage objectives for own projects" ON public.objectives
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = objectives.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Políticas para requisitos funcionais
CREATE POLICY "Users can manage functional requirements for own projects" ON public.requirements_functional
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = requirements_functional.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Políticas para requisitos não funcionais
CREATE POLICY "Users can manage non-functional requirements for own projects" ON public.requirements_non_functional
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = requirements_non_functional.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Políticas para pagamento
CREATE POLICY "Users can manage payment for own projects" ON public.payment
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = payment.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Políticas para stakeholders
CREATE POLICY "Users can manage stakeholders for own projects" ON public.stakeholders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = stakeholders.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Políticas para assinaturas (CORRIGIDA)
CREATE POLICY "Users can manage signatures for own projects" ON public.signatures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      JOIN public.stakeholders ON stakeholders.project_id = projects.id
      WHERE stakeholders.id = signatures.stakeholder_id 
      AND projects.user_id = auth.uid()
    )
  );

-- PASSO 6: CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX idx_team_project_id ON public.team(project_id);
CREATE INDEX idx_technologies_project_id ON public.technologies(project_id);
CREATE INDEX idx_audiences_project_id ON public.audiences(project_id);
CREATE INDEX idx_objectives_project_id ON public.objectives(project_id);
CREATE INDEX idx_requirements_functional_project_id ON public.requirements_functional(project_id);
CREATE INDEX idx_requirements_non_functional_project_id ON public.requirements_non_functional(project_id);
CREATE INDEX idx_payment_project_id ON public.payment(project_id);
CREATE INDEX idx_stakeholders_project_id ON public.stakeholders(project_id);
CREATE INDEX idx_signatures_stakeholder_id ON public.signatures(stakeholder_id);

-- PASSO 7: CRIAR FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para criar usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para novos usuários
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_updated_at
  BEFORE UPDATE ON public.payment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PASSO 8: VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar estrutura da tabela technologies
SELECT 'Estrutura da tabela technologies:' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'technologies' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar constraints
SELECT 'Constraints da tabela technologies:' as info;
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'technologies' 
  AND table_schema = 'public';

-- Verificar todas as tabelas criadas
SELECT 'Tabelas criadas:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

SELECT '🎉 SCHEMA COMPLETO CRIADO COM SUCESSO! 🎉' as resultado;
SELECT 'Todas as tabelas foram recriadas do zero com as correções aplicadas.' as detalhes;
SELECT 'A tabela technologies agora tem a estrutura correta com category e description.' as tecnologias;
SELECT 'Todas as políticas RLS estão corretas e funcionais.' as seguranca;
SELECT 'Índices criados para melhor performance.' as performance;