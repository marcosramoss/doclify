'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { StepNavigation } from '@/components/editor/step-navigation';
import { ProjectInfoStep } from '@/components/editor/steps/project-info-step';
import { TeamStep } from '@/components/editor/steps/team-step';
import { TechStep } from '@/components/editor/steps/tech-step';
import { ObjectivesStep } from '@/components/editor/steps/objectives-step';
import { FunctionalRequirementsStep } from '@/components/editor/steps/functional-requirements-step';
import { NonFunctionalRequirementsStep } from '@/components/editor/steps/non-functional-requirements-step';
import { TimelineStep } from '@/components/editor/steps/timeline-step';
import { ReviewStep } from '@/components/editor/steps/review-step';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCreateProject,
  useCreateTeamMembers,
  useCreateTechnologies,
  useCreateObjectives,
  useCreateFunctionalRequirements,
  useCreateNonFunctionalRequirements,
} from '@/hooks/useProjects';
import { useProjectStore } from '@/stores/useProjectStore';
import type {
  Project,
  Technology,
  Objective,
  TeamMember,
  FunctionalRequirement,
  NonFunctionalRequirement,
} from '@/types';

// Extended project type for editor state
interface ExtendedProject extends Project {
  technologies?: Technology[];
  objectives?: Objective[];
  members?: TeamMember[];
  functional_requirements?: FunctionalRequirement[];
  non_functional_requirements?: NonFunctionalRequirement[];
}

const steps = [
  {
    id: 'project-info',
    title: 'Informações do Projeto',
    description: 'Dados básicos e descrição',
    component: ProjectInfoStep,
  },
  {
    id: 'team',
    title: 'Equipe',
    description: 'Membros e responsabilidades',
    component: TeamStep,
  },
  {
    id: 'tech-stack',
    title: 'Tecnologias',
    description: 'Stack tecnológico e arquitetura',
    component: TechStep,
  },
  {
    id: 'objectives',
    title: 'Objetivos',
    description: 'Metas e critérios de sucesso',
    component: ObjectivesStep,
  },
  {
    id: 'functional-requirements',
    title: 'Requisitos Funcionais',
    description: 'Funcionalidades do sistema',
    component: FunctionalRequirementsStep,
  },
  {
    id: 'non-functional-requirements',
    title: 'Requisitos Não Funcionais',
    description: 'Qualidade e performance',
    component: NonFunctionalRequirementsStep,
  },
  {
    id: 'timeline',
    title: 'Cronograma',
    description: 'Prazos e marcos importantes',
    component: TimelineStep,
  },
  {
    id: 'review',
    title: 'Revisão',
    description: 'Finalização e exportação',
    component: ReviewStep,
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const createProject = useCreateProject();
  const createTeamMembers = useCreateTeamMembers();
  const createTechnologies = useCreateTechnologies();
  const createObjectives = useCreateObjectives();
  const createFunctionalRequirements = useCreateFunctionalRequirements();
  const createNonFunctionalRequirements = useCreateNonFunctionalRequirements();
  const { currentProject } = useProjectStore();

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentProject) {
      toast.error('Dados do projeto não encontrados. Tente novamente.');
      return;
    }

    // Enhanced validation before submission
    const validationErrors = [];

    if (!currentProject.title?.trim()) {
      validationErrors.push('Título do projeto é obrigatório');
    }

    if (!currentProject.description?.trim()) {
      validationErrors.push('Descrição do projeto é obrigatória');
    }

    if (currentProject.title && currentProject.title.trim().length < 3) {
      validationErrors.push('Título deve ter pelo menos 3 caracteres');
    }

    // Validate team members if they exist
    if (currentProject.members && Array.isArray(currentProject.members)) {
      currentProject.members.forEach((member, index) => {
        if (!member.name?.trim()) {
          validationErrors.push(`Nome do membro ${index + 1} é obrigatório`);
        }
        if (!member.role?.trim()) {
          validationErrors.push(`Função do membro ${index + 1} é obrigatória`);
        }
        if (member.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
          validationErrors.push(`Email do membro ${index + 1} é inválido`);
        }
      });
    }

    // Validate extended project data
    const extendedProject = currentProject as ExtendedProject;

    // Validate functional requirements
    if (
      extendedProject.functional_requirements &&
      Array.isArray(extendedProject.functional_requirements)
    ) {
      extendedProject.functional_requirements.forEach((req, index) => {
        if (!req.title?.trim()) {
          validationErrors.push(
            `Título do requisito funcional ${index + 1} é obrigatório`
          );
        }
        if (!req.description?.trim()) {
          validationErrors.push(
            `Descrição do requisito funcional ${index + 1} é obrigatória`
          );
        }
      });
    }

    // Validate non-functional requirements
    if (
      extendedProject.non_functional_requirements &&
      Array.isArray(extendedProject.non_functional_requirements)
    ) {
      extendedProject.non_functional_requirements.forEach((req, index) => {
        if (!req.title?.trim()) {
          validationErrors.push(
            `Título do requisito não funcional ${index + 1} é obrigatório`
          );
        }
        if (!req.description?.trim()) {
          validationErrors.push(
            `Descrição do requisito não funcional ${index + 1} é obrigatória`
          );
        }
        if (!req.category?.trim()) {
          validationErrors.push(
            `Categoria do requisito não funcional ${index + 1} é obrigatória`
          );
        }
      });
    }

    if (validationErrors.length > 0) {
      toast.error(`Erros de validação: ${validationErrors.join(', ')}`);
      return;
    }

    let createdProject: Project | null = null;
    const createdResources: string[] = [];

    try {
      const projectPayload = {
        title: currentProject.title.trim(),
        description: currentProject.description?.trim() || '',
        company_name: currentProject.company_name?.trim() || '',
        project_type: currentProject.project_type || '',
        status: 'draft' as const,
      };

      console.log('Creating project with payload:', projectPayload);

      // 1. Create the main project
      createdProject = await createProject.mutateAsync(projectPayload);
      console.log('Project created successfully:', createdProject);
      createdResources.push('project');

      // 2-6. Save all project resources in parallel for better performance
      const extendedProject = currentProject as ExtendedProject;
      const saveOperations: Array<{
        name: string;
        operation: () => Promise<unknown>;
      }> = [];

      // Prepare team members operation
      if (
        currentProject.members &&
        Array.isArray(currentProject.members) &&
        currentProject.members.length > 0
      ) {
        saveOperations.push({
          name: 'team',
          operation: () =>
            createTeamMembers.mutateAsync({
              projectId: createdProject!.id,
              members: currentProject.members!.map(member => ({
                name: member.name?.trim() || '',
                role: member.role?.trim() || '',
                email: member.email?.trim() || '',
              })),
            }),
        });
      }

      // Prepare technologies operation
      if (
        extendedProject.technologies &&
        Array.isArray(extendedProject.technologies) &&
        extendedProject.technologies.length > 0
      ) {
        saveOperations.push({
          name: 'technologies',
          operation: () =>
            createTechnologies.mutateAsync({
              projectId: createdProject!.id,
              technologies: extendedProject.technologies!.map(tech => ({
                name: tech.name?.trim() || '',
                category: tech.category,
                version: tech.version?.trim() || '',
                description: tech.description?.trim() || '',
              })),
            }),
        });
      }

      // Prepare objectives operation
      if (
        extendedProject.objectives &&
        Array.isArray(extendedProject.objectives) &&
        extendedProject.objectives.length > 0
      ) {
        saveOperations.push({
          name: 'objectives',
          operation: () =>
            createObjectives.mutateAsync({
              projectId: createdProject!.id,
              objectives: extendedProject.objectives!.map(obj => ({
                title: obj.title,
                description: obj.description || '',
                priority: obj.priority,
              })),
            }),
        });
      }

      // Prepare functional requirements operation
      if (
        extendedProject.functional_requirements &&
        Array.isArray(extendedProject.functional_requirements) &&
        extendedProject.functional_requirements.length > 0
      ) {
        saveOperations.push({
          name: 'functional_requirements',
          operation: () =>
            createFunctionalRequirements.mutateAsync({
              projectId: createdProject!.id,
              requirements: extendedProject.functional_requirements!.map(
                req => ({
                  title: req.title,
                  description: req.description,
                  priority: req.priority,
                  acceptance_criteria: req.acceptance_criteria || '',
                })
              ),
            }),
        });
      }

      // Prepare non-functional requirements operation
      if (
        extendedProject.non_functional_requirements &&
        Array.isArray(extendedProject.non_functional_requirements) &&
        extendedProject.non_functional_requirements.length > 0
      ) {
        saveOperations.push({
          name: 'non_functional_requirements',
          operation: () =>
            createNonFunctionalRequirements.mutateAsync({
              projectId: createdProject!.id,
              requirements: extendedProject.non_functional_requirements!.map(
                req => ({
                  title: req.title,
                  description: req.description,
                  category: req.category,
                  metric: req.metric || '',
                  target_value: req.target_value || '',
                })
              ),
            }),
        });
      }

      // Execute all operations in parallel
      if (saveOperations.length > 0) {
        console.log(
          `Executing ${saveOperations.length} save operations in parallel`
        );
        const results = await Promise.allSettled(
          saveOperations.map(async op => {
            console.log(`Saving ${op.name}...`);
            await op.operation();
            console.log(`${op.name} saved successfully`);
            return op.name;
          })
        );

        // Check results and track successful operations
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            createdResources.push(result.value);
          } else {
            console.error(
              `Failed to save ${saveOperations[index].name}:`,
              result.reason
            );
            throw new Error(
              `Failed to save ${saveOperations[index].name}: ${result.reason}`
            );
          }
        });

        console.log('All resources saved successfully:', createdResources);
      }

      toast.success('Projeto criado com sucesso!');
      router.push(`/editor/${createdProject.id}`);
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      console.error('Error details:', error);

      // Rollback: Remove created resources in reverse order
      if (createdProject) {
        try {
          console.log('Rolling back created resources:', createdResources);
          // Note: In a real implementation, you would call delete APIs here
          // For now, we just log the rollback attempt
          toast.error(
            `Erro ao criar projeto. Recursos criados: ${createdResources.join(', ')}`
          );
        } catch (rollbackError) {
          console.error('Error during rollback:', rollbackError);
          toast.error('Erro crítico ao criar projeto. Contate o suporte.');
        }
      } else {
        toast.error('Erro ao criar projeto. Tente novamente.');
      }
    }
  };

  return (
    <AppLayout
      title='Novo Projeto'
      description='Crie um novo projeto de documentação'
    >
      <div className='min-h-screen bg-gray-50'>
        {/* Header */}
        <div className='sticky top-0 z-10 bg-white border-b'>
          <div className='max-w-7xl mx-auto'>
            <div className='flex items-center justify-between h-16 px-4'>
              <div className='flex items-center space-x-4'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => router.push('/dashboard')}
                  className='text-gray-600 hover:text-gray-900'
                >
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Voltar
                </Button>
                <div className='flex items-center space-x-2'>
                  <FileText className='h-5 w-5 text-blue-600' />
                  <h1 className='text-lg font-semibold text-gray-900'>
                    Novo Projeto
                  </h1>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <div className='text-sm text-gray-600'>
                  Etapa {currentStep + 1} de {steps.length}
                </div>
                <div className='w-32'>
                  <Progress value={progress} className='h-2' />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex h-[calc(100vh-4rem)]'>
          {/* Sidebar Navigation */}
          <div className='w-80 bg-white border-r border-gray-200 flex flex-col'>
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Progresso
              </h2>
              <div className='mb-4'>
                <Progress value={progress} className='h-2 mb-2' />
                <div className='text-sm text-gray-600'>
                  {Math.round(progress)}% concluído
                </div>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-6'>
              <StepNavigation
                steps={steps.map((step, index) => ({
                  id: step.id,
                  title: step.title,
                  description: step.description,
                  status:
                    index < currentStep
                      ? 'completed'
                      : index === currentStep
                        ? 'current'
                        : 'pending',
                }))}
                currentStep={currentStep}
                onStepClick={setCurrentStep}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-1 overflow-y-auto'>
            <div className='p-8'>
              <div className='mb-6'>
                <h2 className='text-lg font-semibold mb-2'>
                  {steps[currentStep].title}
                </h2>
                <p className='text-gray-600'>
                  {steps[currentStep].description}
                </p>
              </div>

              {(() => {
                const StepComponent = steps[currentStep].component;
                const isLastStep = currentStep === steps.length - 1;
                const isFirstStep = currentStep === 0;

                // Special handling for ReviewStep which has different props
                if (isLastStep && StepComponent === ReviewStep) {
                  return (
                    <ReviewStep
                      onBack={handlePrevious}
                      onFinish={handleSubmit}
                    />
                  );
                }

                // Type-safe rendering for other steps
                // Cast to generic component type to avoid prop conflicts
                const GenericStepComponent =
                  StepComponent as React.ComponentType<{
                    onNext: () => void;
                    onBack?: () => void;
                  }>;

                return (
                  <GenericStepComponent
                    onNext={handleNext}
                    onBack={isFirstStep ? undefined : handlePrevious}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
