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
import { useCreateProject } from '@/hooks/useProjects';

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
  const [formData, setFormData] = useState({});
  const createProject = useCreateProject();

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit({ ...formData, ...stepData });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (finalData: any) => {
    try {
      const project = await createProject.mutateAsync({
        name: finalData.name,
        description: finalData.description,
        status: 'draft',
        project_data: finalData,
      });
      
      toast.success('Projeto criado com sucesso!');
      router.push(`/editor/${project.id}`);
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      toast.error('Erro ao criar projeto. Tente novamente.');
    }
  };

  return (
    <AppLayout 
      title="Novo Projeto" 
      description="Crie um novo projeto de documentação"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h1 className="text-xl font-semibold">Novo Projeto</h1>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progresso</span>
            <span>{currentStep + 1} de {steps.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <StepNavigation 
          steps={steps} 
          currentStep={currentStep} 
          onStepClick={setCurrentStep}
        />

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-600">
                {steps[currentStep].description}
              </p>
            </div>

            <CurrentStepComponent
              data={formData}
              onNext={handleNext}
              onPrevious={currentStep > 0 ? handlePrevious : undefined}
              isLoading={createProject.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}