'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Trash2,
  Shield,
  Zap,
  Users,
  RefreshCw,
  TrendingUp,
  Settings,
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
  nonFunctionalRequirementsSchema,
  type NonFunctionalRequirementsFormData,
} from '@/lib/validations/project';
import { useProjectStore } from '@/stores/useProjectStore';
import type { Project, NonFunctionalRequirement } from '@/types';

interface NonFunctionalRequirementsStepProps {
  onNext: () => void;
  onBack: () => void;
}

// Extended project type for editor state
interface ExtendedProject extends Project {
  non_functional_requirements?: NonFunctionalRequirement[];
}

const categoryOptions = [
  {
    value: 'performance',
    label: 'Performance',
    description: 'Velocidade, tempo de resposta, throughput',
    color: 'bg-green-100 text-green-800',
    icon: Zap,
  },
  {
    value: 'security',
    label: 'Segurança',
    description: 'Autenticação, autorização, criptografia',
    color: 'bg-red-100 text-red-800',
    icon: Shield,
  },
  {
    value: 'usability',
    label: 'Usabilidade',
    description: 'Interface, experiência do usuário',
    color: 'bg-blue-100 text-blue-800',
    icon: Users,
  },
  {
    value: 'reliability',
    label: 'Confiabilidade',
    description: 'Disponibilidade, recuperação de falhas',
    color: 'bg-purple-100 text-purple-800',
    icon: RefreshCw,
  },
  {
    value: 'scalability',
    label: 'Escalabilidade',
    description: 'Capacidade de crescimento, carga',
    color: 'bg-orange-100 text-orange-800',
    icon: TrendingUp,
  },
  {
    value: 'other',
    label: 'Outros',
    description: 'Outros requisitos não funcionais',
    color: 'bg-gray-100 text-gray-800',
    icon: Settings,
  },
];

const exampleRequirements = [
  {
    title: 'Tempo de resposta da API',
    description: 'As APIs devem responder em menos de 500ms',
    category: 'performance' as const,
    metric: 'Tempo de resposta',
    target_value: '< 500ms',
  },
  {
    title: 'Autenticação segura',
    description: 'Sistema deve usar autenticação JWT com refresh tokens',
    category: 'security' as const,
    metric: 'Método de autenticação',
    target_value: 'JWT + Refresh Token',
  },
  {
    title: 'Interface responsiva',
    description: 'Interface deve funcionar em dispositivos móveis e desktop',
    category: 'usability' as const,
    metric: 'Compatibilidade',
    target_value: 'Mobile + Desktop',
  },
  {
    title: 'Disponibilidade do sistema',
    description: 'Sistema deve ter 99.9% de uptime',
    category: 'reliability' as const,
    metric: 'Uptime',
    target_value: '99.9%',
  },
];

export function NonFunctionalRequirementsStep({
  onNext,
  onBack,
}: NonFunctionalRequirementsStepProps) {
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
  } = useForm<NonFunctionalRequirementsFormData>({
    resolver: zodResolver(nonFunctionalRequirementsSchema),
    defaultValues: {
      requirements:
        project?.non_functional_requirements?.map(req => ({
          title: req.title,
          description: req.description,
          category: req.category,
          metric: req.metric,
          target_value: req.target_value,
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
      category: 'performance',
      metric: '',
      target_value: '',
    });
  };

  const addExampleRequirements = () => {
    exampleRequirements.forEach(req => {
      append(req);
    });
    setShowExamples(false);
  };

  const onSubmit = (data: NonFunctionalRequirementsFormData) => {
    if (project) {
      const updatedProject: ExtendedProject = {
        ...project,
        non_functional_requirements: data.requirements.map((req, index) => ({
          id: `temp-${index}`,
          project_id: project.id,
          title: req.title,
          description: req.description,
          category: req.category,
          metric: req.metric,
          target_value: req.target_value,
          created_at: new Date().toISOString(),
        })),
      };
      setProject(updatedProject);
    }
    onNext();
  };

  const getCategoryOption = (category: string) => {
    return (
      categoryOptions.find(opt => opt.value === category) || categoryOptions[0]
    );
  };

  const getRequirementsByCategory = (category: string) => {
    return watchedRequirements.filter(req => req.category === category);
  };

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <Shield className='mx-auto h-12 w-12 text-blue-600 mb-4' />
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>
          Requisitos Não Funcionais
        </h2>
        <p className='text-gray-600 max-w-2xl mx-auto'>
          Defina os requisitos de qualidade do sistema. Os requisitos não
          funcionais descrevem como o sistema deve se comportar.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <Settings className='h-5 w-5' />
                  Requisitos Não Funcionais
                </CardTitle>
                <CardDescription>
                  Defina os critérios de qualidade e performance do sistema
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
                  Exemplos de Requisitos Não Funcionais:
                </h4>
                <div className='space-y-2 text-sm text-blue-800'>
                  {exampleRequirements.map((req, index) => {
                    const categoryOption = getCategoryOption(req.category);
                    return (
                      <div key={index} className='flex items-start gap-2'>
                        <Badge className={categoryOption.color}>
                          {categoryOption.label}
                        </Badge>
                        <div>
                          <div className='font-medium'>{req.title}</div>
                          <div className='text-blue-600'>{req.description}</div>
                          {req.target_value && (
                            <div className='text-xs text-blue-500'>
                              Meta: {req.target_value}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                <Shield className='mx-auto h-12 w-12 mb-4 opacity-50' />
                <p>Nenhum requisito não funcional adicionado ainda.</p>
                <p className='text-sm'>
                  Clique em Adicionar Requisito para começar.
                </p>
              </div>
            )}

            {fields.map((field, index) => {
              const category = watch(`requirements.${index}.category`);
              const categoryOption = getCategoryOption(category);
              const Icon = categoryOption.icon;

              return (
                <Card key={field.id} className='border-l-4 border-l-purple-500'>
                  <CardContent className='pt-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex items-center gap-2'>
                        <Icon className='h-4 w-4 text-purple-600' />
                        <span className='text-sm font-medium text-gray-700'>
                          Requisito #{index + 1}
                        </span>
                        <Badge className={categoryOption.color}>
                          {categoryOption.label}
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
                          placeholder='Ex: Tempo de resposta da API'
                        />
                        {errors.requirements?.[index]?.title && (
                          <p className='text-sm text-red-600'>
                            {errors.requirements[index]?.title?.message}
                          </p>
                        )}
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor={`requirements.${index}.category`}>
                          Categoria *
                        </Label>
                        <Select
                          value={category}
                          onValueChange={value =>
                            setValue(
                              `requirements.${index}.category`,
                              value as
                                | 'performance'
                                | 'security'
                                | 'usability'
                                | 'reliability'
                                | 'scalability'
                                | 'other'
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map(option => {
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
                        placeholder='Descreva detalhadamente este requisito de qualidade...'
                        rows={3}
                      />
                      {errors.requirements?.[index]?.description && (
                        <p className='text-sm text-red-600'>
                          {errors.requirements[index]?.description?.message}
                        </p>
                      )}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
                      <div className='space-y-2'>
                        <Label htmlFor={`requirements.${index}.metric`}>
                          Métrica
                          <span className='text-gray-500 text-sm ml-1'>
                            (opcional)
                          </span>
                        </Label>
                        <Input
                          {...register(`requirements.${index}.metric`)}
                          placeholder='Ex: Tempo de resposta, Uptime, etc.'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor={`requirements.${index}.target_value`}>
                          Valor Alvo
                          <span className='text-gray-500 text-sm ml-1'>
                            (opcional)
                          </span>
                        </Label>
                        <Input
                          {...register(`requirements.${index}.target_value`)}
                          placeholder='Ex: < 500ms, 99.9%, etc.'
                        />
                      </div>
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
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                {categoryOptions.map(option => {
                  const count = getRequirementsByCategory(option.value).length;
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
