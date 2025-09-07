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
import { ArrowLeft, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
    <AppLayout
      title='Editor de Documento'
      description='Gerencie seus projetos de documentação'
    >
      <div className='min-h-screen bg-gray-50'>
        {/* Header */}
        <div className=' bg-white border-b border-gray-200 sticky top-0 z-10'>
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

        {/* Step Navigation - Horizontal Layout */}
        <div className='bg-white border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='py-4'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-semibold text-gray-900'>
                  {steps[currentStep].title}
                </h2>
                <div className='hidden sm:flex items-center space-x-4'>
                  <div className='text-sm text-gray-600'>
                    {Math.round(progress)}% concluído
                  </div>
                  <div className='w-32'>
                    <Progress value={progress} className='h-2' />
                  </div>
                </div>
              </div>

              <p className='text-gray-600 mb-4'>
                {steps[currentStep].description}
              </p>

              {/* Horizontal Steps */}
              <div className='flex space-x-2 overflow-x-auto pb-2'>
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted =
                    completedSteps.includes(index) || index < currentStep;
                  return (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(index)}
                      className={cn(
                        'flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                        isActive && 'bg-blue-50 text-blue-700 border-blue-200',
                        isCompleted &&
                          !isActive &&
                          'bg-green-50 text-green-700 border-green-200',
                        !isActive &&
                          !isCompleted &&
                          'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
                      )}
                    >
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs',
                          isActive && 'bg-blue-600 text-white border-blue-600',
                          isCompleted &&
                            !isActive &&
                            'bg-green-600 text-white border-green-600',
                          !isActive &&
                            !isCompleted &&
                            'border-gray-300 text-gray-500'
                        )}
                      >
                        {isCompleted && !isActive ? (
                          <Check className='h-3 w-3' />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className='hidden sm:inline whitespace-nowrap'>
                        {step.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1 overflow-y-auto bg-gray-50'>
          <div className='max-w-7xl mx-auto p-4 sm:p-6 lg:p-8'>
            <CurrentStepComponent
              onNext={handleNext}
              onBack={handleBack}
              onFinish={handleFinish}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
