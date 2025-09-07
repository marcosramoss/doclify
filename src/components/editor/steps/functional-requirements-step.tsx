'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Trash2,
  CheckSquare,
  AlertCircle,
  FileText,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  functionalRequirementsSchema,
  type FunctionalRequirementsFormData,
} from '@/lib/validations/project';
import { useProjectStore } from '@/stores/useProjectStore';
import type { Project, FunctionalRequirement } from '@/types';

interface FunctionalRequirementsStepProps {
  onNext: () => void;
  onBack: () => void;
}

// Extended project type for editor state
interface ExtendedProject extends Project {
  functional_requirements?: FunctionalRequirement[];
}

const priorityOptions = [
  {
    value: 'obrigatorio',
    label: 'Obrigatório',
    description: 'Requisitos críticos e obrigatórios',
    color: 'bg-red-100 text-red-800',
    icon: Star,
  },
  {
    value: 'importante',
    label: 'Importante',
    description: 'Requisitos importantes mas não críticos',
    color: 'bg-orange-100 text-orange-800',
    icon: AlertCircle,
  },
  {
    value: 'desejavel',
    label: 'Desejável',
    description: 'Requisitos desejáveis',
    color: 'bg-yellow-100 text-yellow-800',
    icon: CheckSquare,
  },
  {
    value: 'nao_prioritario',
    label: 'Não Prioritário',
    description: 'Requisitos que não serão implementados nesta versão',
    color: 'bg-gray-100 text-gray-800',
    icon: FileText,
  },
];

const exampleRequirements = [
  {
    title: 'Autenticação de usuário',
    description: 'O sistema deve permitir login e logout de usuários',
    priority: 'obrigatorio' as const,
    acceptance_criteria:
      'Usuário pode fazer login com email/senha e logout com sucesso',
  },
  {
    title: 'Cadastro de produtos',
    description: 'Permitir cadastro, edição e exclusão de produtos',
    priority: 'obrigatorio' as const,
    acceptance_criteria: 'CRUD completo de produtos com validação de dados',
  },
  {
    title: 'Relatórios de vendas',
    description: 'Gerar relatórios mensais de vendas',
    priority: 'importante' as const,
    acceptance_criteria: 'Relatório em PDF com dados do mês selecionado',
  },
];

export function FunctionalRequirementsStep({
  onNext,
  onBack,
}: FunctionalRequirementsStepProps) {
  const { currentProject, setCurrentProject: setProject } = useProjectStore();
  const project = currentProject as ExtendedProject | null;
  const [showExamples, setShowExamples] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FunctionalRequirementsFormData>({
    resolver: zodResolver(functionalRequirementsSchema),
    defaultValues: {
      requirements:
        project?.functional_requirements?.map(req => ({
          title: req.title,
          description: req.description,
          priority: req.priority,
          acceptance_criteria: req.acceptance_criteria,
        })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'requirements',
  });

  const watchedRequirements = watch('requirements');

  const addRequirement = () => {
    append({
      title: '',
      description: '',
      priority: 'obrigatorio',
      acceptance_criteria: '',
    });
  };

  const addExampleRequirements = () => {
    exampleRequirements.forEach(req => {
      append(req);
    });
    setShowExamples(false);
  };

  const onSubmit = (data: FunctionalRequirementsFormData) => {
    if (project) {
      const updatedProject: ExtendedProject = {
        ...project,
        functional_requirements: data.requirements.map((req, index) => ({
          id: `temp-${index}`,
          project_id: project.id,
          title: req.title,
          description: req.description,
          priority: req.priority,
          status: 'pending' as const,
          acceptance_criteria: req.acceptance_criteria,
          created_at: new Date().toISOString(),
        })),
      };
      setProject(updatedProject);
    }
    onNext();
  };

  const getPriorityOption = (priority: string) => {
    return (
      priorityOptions.find(opt => opt.value === priority) || priorityOptions[0]
    );
  };

  const getRequirementsByPriority = (priority: string) => {
    return watchedRequirements.filter(req => req.priority === priority);
  };

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <CheckSquare className='mx-auto h-12 w-12 text-blue-600 mb-4' />
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>
          Requisitos Funcionais
        </h2>
        <p className='text-gray-600 max-w-2xl mx-auto'>
          Defina as funcionalidades específicas que o sistema deve ter. Os
          requisitos funcionais descrevem o que o sistema deve fazer.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='h-5 w-5' />
                  Requisitos Funcionais
                </CardTitle>
                <CardDescription>
                  Liste todas as funcionalidades que o sistema deve implementar
                </CardDescription>
              </div>
              <div className='flex gap-2'>
                {fields.length === 0 && (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setShowExamples(!showExamples)}
                  >
                    {showExamples ? 'Ocultar' : 'Ver'} Exemplos
                  </Button>
                )}
                <Button type='button' onClick={addRequirement} size='sm'>
                  <Plus className='h-4 w-4 mr-2' />
                  Adicionar Requisito
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {showExamples && fields.length === 0 && (
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <h4 className='font-medium text-blue-900 mb-2'>
                  Exemplos de Requisitos Funcionais:
                </h4>
                <div className='space-y-2 text-sm text-blue-800'>
                  {exampleRequirements.map((req, index) => (
                    <div key={index} className='flex items-start gap-2'>
                      <Badge className={getPriorityOption(req.priority).color}>
                        {getPriorityOption(req.priority).label}
                      </Badge>
                      <div>
                        <div className='font-medium'>{req.title}</div>
                        <div className='text-blue-600'>{req.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={addExampleRequirements}
                  className='mt-3'
                >
                  Usar Exemplos
                </Button>
              </div>
            )}

            {fields.length === 0 && !showExamples && (
              <div className='text-center py-8 text-gray-500'>
                <CheckSquare className='mx-auto h-12 w-12 mb-4 opacity-50' />
                <p>Nenhum requisito funcional adicionado ainda.</p>
                <p className='text-sm'>
                  Clique em Adicionar Requisito para começar.
                </p>
              </div>
            )}

            {fields.map((field, index) => {
              const priority = watch(`requirements.${index}.priority`);
              const priorityOption = getPriorityOption(priority);
              const Icon = priorityOption.icon;

              return (
                <Card key={field.id} className='border-l-4 border-l-blue-500'>
                  <CardContent className='pt-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex items-center gap-2'>
                        <Icon className='h-4 w-4 text-blue-600' />
                        <span className='text-sm font-medium text-gray-700'>
                          Requisito #{index + 1}
                        </span>
                        <Badge className={priorityOption.color}>
                          {priorityOption.label}
                        </Badge>
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => remove(index)}
                        className='text-red-600 hover:text-red-700 hover:bg-red-50'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor={`requirements.${index}.title`}>
                          Título do Requisito *
                        </Label>
                        <Input
                          {...register(`requirements.${index}.title`)}
                          placeholder='Ex: Autenticação de usuário'
                        />
                        {errors.requirements?.[index]?.title && (
                          <p className='text-sm text-red-600'>
                            {errors.requirements[index]?.title?.message}
                          </p>
                        )}
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor={`requirements.${index}.priority`}>
                          Prioridade *
                        </Label>
                        <Select
                          value={priority}
                          onValueChange={value =>
                            setValue(
                              `requirements.${index}.priority`,
                              value as
                                | 'obrigatorio'
                                | 'importante'
                                | 'desejavel'
                                | 'nao_prioritario'
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityOptions.map(option => {
                              const OptionIcon = option.icon;
                              return (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  <div className='flex items-center gap-2'>
                                    <OptionIcon className='h-4 w-4' />
                                    <div>
                                      <div className='font-medium'>
                                        {option.label}
                                      </div>
                                      <div className='text-xs text-gray-500'>
                                        {option.description}
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className='mt-4 space-y-2'>
                      <Label htmlFor={`requirements.${index}.description`}>
                        Descrição *
                      </Label>
                      <Textarea
                        {...register(`requirements.${index}.description`)}
                        placeholder='Descreva detalhadamente o que este requisito deve fazer...'
                        rows={3}
                      />
                      {errors.requirements?.[index]?.description && (
                        <p className='text-sm text-red-600'>
                          {errors.requirements[index]?.description?.message}
                        </p>
                      )}
                    </div>

                    <div className='mt-4 space-y-2'>
                      <Label
                        htmlFor={`requirements.${index}.acceptance_criteria`}
                      >
                        Critérios de Aceitação
                        <span className='text-gray-500 text-sm ml-1'>
                          (opcional)
                        </span>
                      </Label>
                      <Textarea
                        {...register(
                          `requirements.${index}.acceptance_criteria`
                        )}
                        placeholder='Como validar se este requisito foi implementado corretamente...'
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {fields.length > 0 && (
              <div className='flex justify-center pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={addRequirement}
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Adicionar Outro Requisito
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {fields.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Resumo dos Requisitos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {priorityOptions.map(option => {
                  const count = getRequirementsByPriority(option.value).length;
                  const Icon = option.icon;
                  return (
                    <div key={option.value} className='text-center'>
                      <div className='flex items-center justify-center mb-2'>
                        <Icon className='h-5 w-5 mr-2' />
                        <Badge className={option.color}>{count}</Badge>
                      </div>
                      <div className='text-sm font-medium'>{option.label}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className='flex justify-between pt-6'>
          <Button type='button' variant='outline' onClick={onBack}>
            Voltar
          </Button>
          <Button type='submit' disabled={fields.length === 0}>
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
}
