import { z } from 'zod';

// Project validation schemas
export const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().optional(),
  status: z.enum(['draft', 'in_progress', 'review', 'completed']).optional(),
});

export const teamMemberSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  role: z.string().min(1, 'Cargo é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

export const teamSchema = z.object({
  members: z
    .array(teamMemberSchema)
    .min(1, 'Pelo menos um membro da equipe é obrigatório'),
});

export const technologySchema = z.object({
  name: z.string().min(1, 'Nome da tecnologia é obrigatório'),
  category: z.enum([
    'frontend',
    'backend',
    'database',
    'mobile',
    'devops',
    'other',
  ]),
  version: z.string().optional(),
  description: z.string().optional(),
});

export const technologiesSchema = z.object({
  technologies: z
    .array(technologySchema)
    .min(1, 'Pelo menos uma tecnologia é obrigatória'),
});

// Tech stack schema with architecture field
export const techStackSchema = z.object({
  technologies: z
    .array(technologySchema)
    .min(1, 'Pelo menos uma tecnologia é obrigatória'),
  architecture: z.string().optional(),
});

export const audienceSchema = z.object({
  name: z.string().min(1, 'Nome do público é obrigatório'),
  description: z.string().optional(),
  priority: z.enum(['primary', 'secondary']),
});

export const audiencesSchema = z.object({
  audiences: z
    .array(audienceSchema)
    .min(1, 'Pelo menos um público-alvo é obrigatório'),
});

export const objectiveSchema = z.object({
  title: z.string().min(1, 'Título do objetivo é obrigatório'),
  description: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']),
  type: z
    .enum(['business', 'technical', 'user', 'performance', 'security', 'other'])
    .optional(),
});

export const objectivesSchema = z.object({
  objectives: z
    .array(objectiveSchema)
    .min(1, 'Pelo menos um objetivo é obrigatório'),
  success_criteria: z.string().optional(),
  constraints: z.string().optional(),
});

export const functionalRequirementSchema = z.object({
  title: z.string().min(1, 'Título do requisito é obrigatório'),
  description: z.string().min(1, 'Descrição do requisito é obrigatória'),
  priority: z.enum(['must_have', 'should_have', 'could_have', 'wont_have']),
  acceptance_criteria: z.string().optional(),
});

export const functionalRequirementsSchema = z.object({
  requirements: z
    .array(functionalRequirementSchema)
    .min(1, 'Pelo menos um requisito funcional é obrigatório'),
});

export const nonFunctionalRequirementSchema = z.object({
  title: z.string().min(1, 'Título do requisito é obrigatório'),
  description: z.string().min(1, 'Descrição do requisito é obrigatória'),
  category: z.enum([
    'performance',
    'security',
    'usability',
    'reliability',
    'scalability',
    'other',
  ]),
  metric: z.string().optional(),
  target_value: z.string().optional(),
});

export const nonFunctionalRequirementsSchema = z.object({
  requirements: z
    .array(nonFunctionalRequirementSchema)
    .min(1, 'Pelo menos um requisito não funcional é obrigatório'),
});

export const paymentSchema = z.object({
  total_amount: z.number().min(0, 'Valor deve ser positivo'),
  currency: z.string().min(1, 'Moeda é obrigatória'),
  payment_terms: z.string().optional(),
  milestones: z.string().optional(),
});

export const stakeholderSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  role: z.string().min(1, 'Cargo é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  signature_required: z.boolean(),
});

export const stakeholdersSchema = z.object({
  stakeholders: z
    .array(stakeholderSchema)
    .min(1, 'Pelo menos um stakeholder é obrigatório'),
});

export const milestoneSchema = z.object({
  title: z.string().min(1, 'Título do marco é obrigatório'),
  description: z.string().optional(),
  due_date: z.string().min(1, 'Data é obrigatória'),
  type: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
});

export const timelineSchema = z.object({
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  end_date: z.string().min(1, 'Data de fim é obrigatória'),
  milestones: z.array(milestoneSchema).default([]),
  methodology: z.string().optional(),
});

export const reviewSchema = z.object({
  notes: z.string().optional(),
  version: z.string().min(1, 'Versão é obrigatória'),
});

// Export types
export type ProjectFormData = z.infer<typeof projectSchema>;
export type TeamFormData = z.infer<typeof teamSchema>;
export type TechnologiesFormData = z.infer<typeof technologiesSchema>;
export type TechStackFormData = z.infer<typeof techStackSchema>;
export type AudiencesFormData = z.infer<typeof audiencesSchema>;
export type ObjectivesFormData = z.infer<typeof objectivesSchema>;
export type FunctionalRequirementsFormData = z.infer<
  typeof functionalRequirementsSchema
>;
export type NonFunctionalRequirementsFormData = z.infer<
  typeof nonFunctionalRequirementsSchema
>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type StakeholdersFormData = z.infer<typeof stakeholdersSchema>;
export type TimelineFormData = z.infer<typeof timelineSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
