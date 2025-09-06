-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
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

-- Create team table
CREATE TABLE IF NOT EXISTS public.team (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create technologies table
CREATE TABLE IF NOT EXISTS public.technologies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('frontend', 'backend', 'database', 'infrastructure', 'other')),
  version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audiences table
CREATE TABLE IF NOT EXISTS public.audiences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('primary', 'secondary')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create objectives table
CREATE TABLE IF NOT EXISTS public.objectives (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create functional requirements table
CREATE TABLE IF NOT EXISTS public.requirements_functional (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('must_have', 'should_have', 'could_have', 'wont_have')),
  acceptance_criteria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create non-functional requirements table
CREATE TABLE IF NOT EXISTS public.requirements_non_functional (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('performance', 'security', 'usability', 'reliability', 'scalability', 'other')),
  metric TEXT,
  target_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment table
CREATE TABLE IF NOT EXISTS public.payment (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  payment_terms TEXT,
  milestones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stakeholders table
CREATE TABLE IF NOT EXISTS public.stakeholders (
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

-- Create signatures table
CREATE TABLE IF NOT EXISTS public.signatures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  stakeholder_id UUID REFERENCES public.stakeholders(id) ON DELETE CASCADE NOT NULL,
  signature_data TEXT, -- Base64 encoded signature image
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Enable Row Level Security (RLS)
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

-- Create RLS policies

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Team policies
CREATE POLICY "Users can manage team for own projects" ON public.team
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = team.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Technologies policies
CREATE POLICY "Users can manage technologies for own projects" ON public.technologies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = technologies.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Audiences policies
CREATE POLICY "Users can manage audiences for own projects" ON public.audiences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = audiences.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Objectives policies
CREATE POLICY "Users can manage objectives for own projects" ON public.objectives
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = objectives.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Functional requirements policies
CREATE POLICY "Users can manage functional requirements for own projects" ON public.requirements_functional
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = requirements_functional.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Non-functional requirements policies
CREATE POLICY "Users can manage non-functional requirements for own projects" ON public.requirements_non_functional
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = requirements_non_functional.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Payment policies
CREATE POLICY "Users can manage payment for own projects" ON public.payment
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = payment.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Stakeholders policies
CREATE POLICY "Users can manage stakeholders for own projects" ON public.stakeholders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = stakeholders.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Signatures policies
CREATE POLICY "Users can manage signatures for own projects" ON public.signatures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = signatures.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Insert test user for development
INSERT INTO public.users (id, email, name, avatar_url, created_at, updated_at)
VALUES (
  'test-user-123',
  'test@example.com',
  'Test User',
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_project_id ON public.team(project_id);
CREATE INDEX IF NOT EXISTS idx_technologies_project_id ON public.technologies(project_id);
CREATE INDEX IF NOT EXISTS idx_audiences_project_id ON public.audiences(project_id);
CREATE INDEX IF NOT EXISTS idx_objectives_project_id ON public.objectives(project_id);
CREATE INDEX IF NOT EXISTS idx_requirements_functional_project_id ON public.requirements_functional(project_id);
CREATE INDEX IF NOT EXISTS idx_requirements_non_functional_project_id ON public.requirements_non_functional(project_id);
CREATE INDEX IF NOT EXISTS idx_payment_project_id ON public.payment(project_id);
CREATE INDEX IF NOT EXISTS idx_stakeholders_project_id ON public.stakeholders(project_id);
CREATE INDEX IF NOT EXISTS idx_signatures_project_id ON public.signatures(project_id);
CREATE INDEX IF NOT EXISTS idx_signatures_stakeholder_id ON public.signatures(stakeholder_id);

-- Create function to handle user creation
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

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_updated_at
  BEFORE UPDATE ON public.payment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();