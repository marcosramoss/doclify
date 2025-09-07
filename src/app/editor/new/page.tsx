'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { StepNavigation } from '@/components/editor/step-navigation';
import { ProjectInfoStep } from '@/components/editor/steps/project-info-step';
import { TeamStep } from '@/components/editor/steps/team-step';
import { TechStep } from '@/components/editor/steps/tech-step';
import { ObjectivesStep } from '@/components/editor/steps/objectives-step';
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
} from '@/hooks/useProjects';
import { useProjectStore } from '@/stores/useProjectStore';
import type { Project, Technology, Objective, TeamMember } from '@/types';

// Extended project type for editor state
interface ExtendedProject extends Project {
  technologies?: Technology[];
  objectives?: Objective[];
  members?: TeamMember[];
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

    try {
      // Validate required fields
      if (!currentProject.title) {
        toast.error('Nome do projeto é obrigatório.');
        return;
      }

      const projectPayload = {
        title: currentProject.title || 'Projeto sem título',
        description: currentProject.description || '',
        company_name: currentProject.company_name || '',
        project_type: currentProject.project_type || '',
        status: 'draft' as const,
      };

      console.log('Creating project with payload:', projectPayload);

      // 1. Create the main project
      const project = await createProject.mutateAsync(projectPayload);
      console.log('Project created successfully:', project);

      // 2. Save team members if they exist
      if (
        currentProject.members &&
        Array.isArray(currentProject.members) &&
        currentProject.members.length > 0
      ) {
        try {
          console.log('Saving team members:', currentProject.members);
          await createTeamMembers.mutateAsync({
            projectId: project.id,
            members: currentProject.members,
          });
          console.log('Team members saved successfully');
        } catch (error) {
          console.error('Error saving team members:', error);
          toast.error('Erro ao salvar membros da equipe');
        }
      }

      // 3. Save technologies if they exist
      const extendedProject = currentProject as ExtendedProject;
      if (
        extendedProject.technologies &&
        Array.isArray(extendedProject.technologies) &&
        extendedProject.technologies.length > 0
      ) {
        try {
          console.log('Saving technologies:', extendedProject.technologies);
          await createTechnologies.mutateAsync({
            projectId: project.id,
            technologies: extendedProject.technologies,
          });
          console.log('Objectives saved successfully');
        } catch (error) {
          console.error('Error saving technologies:', error);
          toast.error('Erro ao salvar tecnologias');
        }
      }

      // 4. Save objectives if they exist
      if (
        extendedProject.objectives &&
        Array.isArray(extendedProject.objectives) &&
        extendedProject.objectives.length > 0
      ) {
        try {
          console.log('Saving objectives:', extendedProject.objectives);
          await createObjectives.mutateAsync({
            projectId: project.id,
            objectives: extendedProject.objectives.map(obj => ({
              title: obj.title,
              description: obj.description || '',
              priority: obj.priority,
            })),
          });
          console.log('Technologies saved successfully');
        } catch (error) {
          console.error('Error saving objectives:', error);
          toast.error('Erro ao salvar objetivos');
        }
      }

      toast.success('Projeto criado com sucesso!');
      router.push(`/editor/${project.id}`);
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      console.error('Error details:', error);
      toast.error('Erro ao criar projeto. Tente novamente.');
    }
  };

  return (
    <AppLayout
      title='Novo Projeto'
      description='Crie um novo projeto de documentação'
    >
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Voltar ao Dashboard
            </Button>
            <div className='flex items-center space-x-2'>
              <FileText className='h-5 w-5 text-blue-600' />
              <h1 className='text-xl font-semibold'>Novo Projeto</h1>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className='space-y-2'>
          <div className='flex justify-between text-sm text-gray-600'>
            <span>Progresso</span>
            <span>
              {currentStep + 1} de {steps.length}
            </span>
          </div>
          <Progress value={progress} className='h-2' />
        </div>

        {/* Step Navigation */}
        <StepNavigation
          steps={steps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />

        {/* Step Content */}
        <Card>
          <CardContent className='p-6'>
            <div className='mb-6'>
              <h2 className='text-lg font-semibold mb-2'>
                {steps[currentStep].title}
              </h2>
              <p className='text-gray-600'>{steps[currentStep].description}</p>
            </div>

            {currentStep === steps.length - 1 ? (
              <ReviewStep onBack={handlePrevious} onFinish={handleSubmit} />
            ) : (
              <>
                {currentStep === 0 && (
                  <ProjectInfoStep
                    onNext={handleNext}
                    onBack={currentStep > 0 ? handlePrevious : undefined}
                  />
                )}
                {currentStep === 1 && (
                  <TeamStep onNext={handleNext} onBack={handlePrevious} />
                )}
                {currentStep === 2 && (
                  <TechStep onNext={handleNext} onBack={handlePrevious} />
                )}
                {currentStep === 3 && (
                  <ObjectivesStep onNext={handleNext} onBack={handlePrevious} />
                )}
                {currentStep === 4 && (
                  <TimelineStep onNext={handleNext} onBack={handlePrevious} />
                )}
                {currentStep === 5 && (
                  <ReviewStep onBack={handlePrevious} onFinish={handleSubmit} />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
