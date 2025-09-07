// Database Types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'draft' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  company_name?: string;
  project_type?: string;
  team?: TeamMember[];
  members?: TeamMember[];
  technologies?: Technology[];
  architecture?: string;
  objectives?: Objective[];
  success_criteria?: string;
  constraints?: string;
  start_date?: string;
  end_date?: string;
  milestones?: Milestone[];
  methodology?: string;
}

export interface TeamMember {
  id: string;
  project_id: string;
  name: string;
  role: string;
  email?: string;
  created_at: string;
}

export interface Technology {
  id?: string;
  project_id?: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'mobile' | 'devops' | 'other';
  version?: string;
  description?: string;
  created_at?: string;
}

export interface Audience {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  priority: 'primary' | 'secondary';
  created_at: string;
}

export interface Objective {
  id?: string;
  project_id?: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  type?:
    | 'business'
    | 'technical'
    | 'user'
    | 'performance'
    | 'security'
    | 'other';
  status?: 'pending' | 'in_progress' | 'completed';
  created_at?: string;
}

export interface Milestone {
  id?: string;
  project_id?: string;
  title: string;
  description?: string;
  due_date: string;
  type?: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at?: string;
}

export interface FunctionalRequirement {
  id: string;
  project_id: string;
  title: string;
  description: string;
  priority: 'must_have' | 'should_have' | 'could_have' | 'wont_have';
  status: 'pending' | 'in_progress' | 'completed';
  acceptance_criteria?: string;
  created_at: string;
}

export interface NonFunctionalRequirement {
  id: string;
  project_id: string;
  title: string;
  description: string;
  category:
    | 'performance'
    | 'security'
    | 'usability'
    | 'reliability'
    | 'scalability'
    | 'other';
  metric?: string;
  target_value?: string;
  created_at: string;
}

export interface PaymentInfo {
  id: string;
  project_id: string;
  total_amount: number;
  currency: string;
  payment_terms?: string;
  milestones?: string;
  created_at: string;
}

export interface Stakeholder {
  id: string;
  project_id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  company?: string;
  signature_required: boolean;
  signed_at?: string;
  created_at: string;
}

// Form Types
export interface ProjectFormData {
  title: string;
  description?: string;
  company_name?: string;
  project_type?: string;
}

export interface TeamFormData {
  members: {
    name: string;
    role: string;
    email?: string;
  }[];
}

export interface TechnologyFormData {
  technologies: {
    name: string;
    category: Technology['category'];
    version?: string;
    description?: string;
  }[];
}

export interface AudienceFormData {
  audiences: {
    name: string;
    description?: string;
    priority: Audience['priority'];
  }[];
}

export interface ObjectiveFormData {
  objectives: {
    title: string;
    description: string;
    priority: Objective['priority'];
  }[];
}

export interface FunctionalRequirementFormData {
  requirements: {
    title: string;
    description: string;
    priority: FunctionalRequirement['priority'];
    acceptance_criteria?: string;
  }[];
}

export interface NonFunctionalRequirementFormData {
  requirements: {
    title: string;
    description: string;
    category: NonFunctionalRequirement['category'];
    metric?: string;
    target_value?: string;
  }[];
}

export interface PaymentFormData {
  total_amount: number;
  currency: string;
  payment_terms?: string;
  milestones?: string;
}

export interface StakeholderFormData {
  stakeholders: {
    name: string;
    role: string;
    email: string;
    phone?: string;
    company?: string;
    signature_required: boolean;
  }[];
}

// UI Types
export interface StepperStep {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  current: boolean;
}

export interface DocumentExportOptions {
  format: 'pdf' | 'docx';
  includeSignatures: boolean;
  includeTeam: boolean;
  includeTechnologies: boolean;
}
