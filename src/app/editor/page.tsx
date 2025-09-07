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

export default function EditorPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to previous steps or next step if current is completed
    if (stepIndex <= currentStep || completedSteps.includes(stepIndex - 1)) {
      setCurrentStep(stepIndex);
    }
  };

  const handleFinish = () => {
    // Mark all steps as completed
    setCompletedSteps(steps.map((_, index) => index));
    toast.success('Documento criado com sucesso!');
    router.push('/dashboard');
  };

  const handleExit = () => {
    if (completedSteps.length > 0) {
      const confirmed = window.confirm(
        'Você tem alterações não salvas. Deseja realmente sair?'
      );
      if (!confirmed) return;
    }
    router.push('/dashboard');
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <AppLayout>
      <div className='min-h-screen bg-gray-50'>
        {/* Header */}
        <div className='  sticky top-0 z-10'>
          <div className='max-w-7xl mx-auto'>
            <div className='flex items-center justify-between h-16'>
              <div className='flex items-center space-x-4'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleExit}
                  className='text-gray-600 hover:text-gray-900'
                >
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Voltar
                </Button>
                <div className='flex items-center space-x-2'>
                  <FileText className='h-5 w-5 text-blue-600' />
                  <h1 className='text-lg font-semibold text-gray-900'>
                    Editor de Documento
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
                  status: completedSteps.includes(index)
                    ? 'completed'
                    : index === currentStep
                      ? 'current'
                      : index < currentStep
                        ? 'completed'
                        : 'pending',
                }))}
                currentStep={currentStep}
                onStepClick={handleStepClick}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-1 overflow-y-auto'>
            <div className='p-8'>
              <CurrentStepComponent
                onNext={handleNext}
                onBack={handleBack}
                onFinish={handleFinish}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
