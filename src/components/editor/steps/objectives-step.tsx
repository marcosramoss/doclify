'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Trash2,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  objectivesSchema,
  type ObjectivesFormData,
} from '@/lib/validations/project';
import { useProjectStore } from '@/stores/useProjectStore';
import type { Project, Objective } from '@/types';

// Extended interface to include objectives property
interface ExtendedProject extends Project {
  objectives?: Objective[];
  success_criteria?: string;
  constraints?: string;
}

interface ObjectivesStepProps {
  onNext: () => void;
  onBack: () => void;
}

const priorityOptions = [
  {
    value: 'high',
    label: 'Alta',
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle,
  },
  {
    value: 'medium',
    label: 'Média',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  {
    value: 'low',
    label: 'Baixa',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
];

const typeOptions = [
  {
    value: 'business',
    label: 'Negócio',
    description: 'Objetivos relacionados ao negócio e ROI',
  },
  {
    value: 'technical',
    label: 'Técnico',
    description: 'Objetivos técnicos e de arquitetura',
  },
  {
    value: 'user',
    label: 'Usuário',
    description: 'Experiência e satisfação do usuário',
  },
  {
    value: 'performance',
    label: 'Performance',
    description: 'Métricas de desempenho e velocidade',
  },
  {
    value: 'security',
    label: 'Segurança',
    description: 'Objetivos de segurança e compliance',
  },
  { value: 'other', label: 'Outro', description: 'Outros tipos de objetivos' },
];

const commonObjectives = {
  business: [
    'Aumentar conversão em 20%',
    'Reduzir custos operacionais',
    'Melhorar satisfação do cliente',
    'Expandir base de usuários',
    'Aumentar receita recorrente',
  ],
  technical: [
    'Melhorar performance da aplicação',
    'Implementar arquitetura escalável',
    'Reduzir tempo de deploy',
    'Aumentar cobertura de testes',
    'Modernizar stack tecnológico',
  ],
  user: [
    'Simplificar fluxo de cadastro',
    'Melhorar usabilidade mobile',
    'Reduzir tempo de carregamento',
    'Implementar acessibilidade',
    'Personalizar experiência',
  ],
  performance: [
    'Reduzir tempo de resposta para <200ms',
    'Suportar 10k usuários simultâneos',
    'Otimizar queries do banco',
    'Implementar cache eficiente',
    'Melhorar Core Web Vitals',
  ],
  security: [
    'Implementar autenticação 2FA',
    'Criptografar dados sensíveis',
    'Compliance com LGPD',
    'Auditoria de segurança',
    'Backup e disaster recovery',
  ],
};

export function ObjectivesStep({ onNext, onBack }: ObjectivesStepProps) {
  const { currentProject, setCurrentProject: setProject } = useProjectStore();
  const project = currentProject as ExtendedProject | null;
  const [activeTab, setActiveTab] = useState('business');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ObjectivesFormData>({
    resolver: zodResolver(objectivesSchema),
    defaultValues: {
      objectives: project?.objectives || [],
      success_criteria: project?.success_criteria || '',
      constraints: project?.constraints || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'objectives',
  });

  const watchedObjectives = watch('objectives');

  const addObjective = (type: string, title?: string) => {
    append({
      title: title || '',
      description: '',
      priority: 'medium',
      type: type as
        | 'business'
        | 'technical'
        | 'user'
        | 'performance'
        | 'security'
        | 'other',
    });
  };

  const addCommonObjective = (type: string, title: string) => {
    const exists = watchedObjectives.some(
      obj => obj.title.toLowerCase() === title.toLowerCase()
    );

    if (!exists) {
      append({
        title,
        description: '',
        priority: 'medium',
        type: type as
          | 'business'
          | 'technical'
          | 'user'
          | 'performance'
          | 'security'
          | 'other',
      });
    }
  };

  const onSubmit = (data: ObjectivesFormData) => {
    console.log('ObjectivesStep onSubmit called with data:', data);
    console.log('Current project state:', project);

    const updatedProject = {
      ...project,
      objectives: data.objectives,
      success_criteria: data.success_criteria,
      constraints: data.constraints,
    } as ExtendedProject;

    console.log('Updated project data:', updatedProject);
    setProject(updatedProject as Project);

    console.log('Calling onNext()');
    onNext();
  };

  const skipStep = () => {
    setProject({
      ...project,
      objectives: [],
      success_criteria: '',
      constraints: '',
    } as Project);
    onNext();
  };

  // Removed getObjectivesByType function as 'type' property doesn't exist in Objective type

  const getPriorityInfo = (priority: string) => {
    return (
      priorityOptions.find(p => p.value === priority) || priorityOptions[1]
    );
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>
          Objetivos e Metas
        </h2>
        <p className='text-gray-600'>
          Define os objetivos do projeto, critérios de sucesso e possíveis
          limitações.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-6'>
            {typeOptions.map(type => {
              const count = watchedObjectives.filter(
                obj => obj.type === type.value
              ).length;
              return (
                <TabsTrigger
                  key={type.value}
                  value={type.value}
                  className='flex items-center space-x-1'
                >
                  <span className='hidden sm:inline'>{type.label}</span>
                  {count > 0 && (
                    <Badge
                      variant='secondary'
                      className='ml-1 h-5 w-5 p-0 text-xs'
                    >
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {typeOptions.map(type => {
            // Filter objectives by type
            const typeObjectives = watchedObjectives.filter(
              obj => obj.type === type.value
            );
            const commonObjs =
              commonObjectives[type.value as keyof typeof commonObjectives] ||
              [];

            return (
              <TabsContent
                key={type.value}
                value={type.value}
                className='space-y-4'
              >
                <Card>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <div>
                        <CardTitle className='flex items-center'>
                          <Target className='h-5 w-5 mr-2' />
                          Objetivos de {type.label}
                        </CardTitle>
                        <CardDescription>{type.description}</CardDescription>
                      </div>
                      <Button
                        type='button'
                        onClick={() => addObjective(type.value)}
                        size='sm'
                      >
                        <Plus className='h-4 w-4 mr-2' />
                        Adicionar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {/* Common Objectives */}
                    {commonObjs.length > 0 && (
                      <div>
                        <Label className='text-sm font-medium mb-2 block'>
                          Objetivos Comuns:
                        </Label>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                          {commonObjs.map(obj => {
                            const exists = watchedObjectives.some(
                              o => o.title.toLowerCase() === obj.toLowerCase()
                            );
                            return (
                              <Button
                                key={obj}
                                type='button'
                                variant={exists ? 'default' : 'outline'}
                                size='sm'
                                onClick={() =>
                                  addCommonObjective(type.value, obj)
                                }
                                disabled={exists}
                                className='h-auto p-3 text-left justify-start'
                              >
                                {exists && (
                                  <CheckCircle className='h-4 w-4 mr-2 flex-shrink-0' />
                                )}
                                <span className='text-xs'>{obj}</span>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Added Objectives */}
                    <div className='space-y-4'>
                      {fields.map((field, index) => {
                        if (watchedObjectives[index]?.type !== type.value)
                          return null;
                        const priorityInfo = getPriorityInfo(
                          watchedObjectives[index]?.priority || 'medium'
                        );

                        return (
                          <Card key={field.id} className='p-4 bg-gray-50'>
                            <div className='space-y-4'>
                              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                  <Label htmlFor={`objectives.${index}.title`}>
                                    Título do Objetivo *
                                  </Label>
                                  <Input
                                    id={`objectives.${index}.title`}
                                    placeholder='Ex: Aumentar conversão em 20%'
                                    {...register(`objectives.${index}.title`)}
                                    className={
                                      errors.objectives?.[index]?.title
                                        ? 'border-red-500'
                                        : ''
                                    }
                                  />
                                  {errors.objectives?.[index]?.title && (
                                    <p className='text-sm text-red-500 mt-1'>
                                      {errors.objectives[index]?.title?.message}
                                    </p>
                                  )}
                                </div>

                                <div className='flex items-end space-x-2'>
                                  <div className='flex-1'>
                                    <Label
                                      htmlFor={`objectives.${index}.priority`}
                                    >
                                      Prioridade *
                                    </Label>
                                    <Select
                                      value={watchedObjectives[index]?.priority}
                                      onValueChange={value =>
                                        setValue(
                                          `objectives.${index}.priority`,
                                          value as 'high' | 'medium' | 'low'
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder='Selecione a prioridade' />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {priorityOptions.map(option => {
                                          const Icon = option.icon;
                                          return (
                                            <SelectItem
                                              key={option.value}
                                              value={option.value}
                                            >
                                              <div className='flex items-center'>
                                                <Icon className='h-4 w-4 mr-2' />
                                                {option.label}
                                              </div>
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    onClick={() => remove(index)}
                                    className='text-red-600 hover:text-red-700'
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <Label
                                  htmlFor={`objectives.${index}.description`}
                                >
                                  Descrição
                                </Label>
                                <Textarea
                                  id={`objectives.${index}.description`}
                                  placeholder='Descreva detalhadamente este objetivo...'
                                  rows={2}
                                  {...register(
                                    `objectives.${index}.description`
                                  )}
                                />
                              </div>

                              {/* Removed success_metric and type fields as they don't exist in ObjectivesFormData */}
                            </div>
                          </Card>
                        );
                      })}
                    </div>

                    {typeObjectives.length === 0 && (
                      <div className='text-center py-6'>
                        <Target className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                        <p className='text-gray-600 mb-4'>
                          Nenhum objetivo de {type.label.toLowerCase()}{' '}
                          adicionado ainda.
                        </p>
                        <Button
                          type='button'
                          onClick={() => addObjective(type.value)}
                          variant='outline'
                        >
                          <Plus className='h-4 w-4 mr-2' />
                          Adicionar Primeiro Objetivo
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Success Criteria */}
        <Card>
          <CardHeader>
            <CardTitle>Critérios Gerais de Sucesso</CardTitle>
            <CardDescription>
              Defina os critérios gerais que determinarão o sucesso do projeto
              como um todo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder='Ex: O projeto será considerado bem-sucedido quando atingir 90% dos objetivos definidos, com satisfação do usuário acima de 4.5/5 e ROI positivo em 6 meses...'
              rows={4}
              {...register('success_criteria')}
              className={errors.success_criteria ? 'border-red-500' : ''}
            />
            {errors.success_criteria && (
              <p className='text-sm text-red-500 mt-1'>
                {errors.success_criteria.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Constraints */}
        <Card>
          <CardHeader>
            <CardTitle>Restrições e Limitações</CardTitle>
            <CardDescription>
              Documente limitações de orçamento, tempo, recursos, tecnologia ou
              outras restrições importantes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder='Ex: Orçamento limitado a R$ 50.000, prazo máximo de 3 meses, deve ser compatível com sistemas legados, equipe de apenas 3 desenvolvedores...'
              rows={4}
              {...register('constraints')}
              className={errors.constraints ? 'border-red-500' : ''}
            />
            {errors.constraints && (
              <p className='text-sm text-red-500 mt-1'>
                {errors.constraints.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Objectives Summary */}
        {watchedObjectives.length > 0 && (
          <Card className='bg-gray-50'>
            <CardHeader>
              <CardTitle className='text-lg'>Resumo dos Objetivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {typeOptions.map(type => {
                  const objs = watchedObjectives.filter(
                    obj => obj.type === type.value
                  );
                  if (objs.length === 0) return null;

                  return (
                    <div key={type.value}>
                      <div className='flex items-center mb-2'>
                        <Target className='h-4 w-4 mr-2 text-gray-600' />
                        <span className='font-medium text-sm text-gray-700'>
                          {type.label}:
                        </span>
                      </div>
                      <div className='space-y-2 ml-6'>
                        {objs.map((obj, index) => {
                          const priorityInfo = getPriorityInfo(obj.priority);
                          const PriorityIcon = priorityInfo.icon;

                          return (
                            <div
                              key={index}
                              className='flex items-center space-x-2'
                            >
                              <Badge className={priorityInfo.color}>
                                <PriorityIcon className='h-3 w-3 mr-1' />
                                {priorityInfo.label}
                              </Badge>
                              <span className='text-sm'>{obj.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className='flex justify-between pt-6'>
          <Button type='button' variant='outline' onClick={onBack}>
            Voltar
          </Button>
          <div className='flex space-x-2'>
            <Button type='button' variant='ghost' onClick={skipStep}>
              Pular Esta Etapa
            </Button>
            <Button type='submit'>Próximo: Cronograma</Button>
          </div>
        </div>
      </form>

      {/* Help Card */}
      <Card className='bg-blue-50 border-blue-200'>
        <CardContent className='pt-6'>
          <div className='flex items-start space-x-3'>
            <div className='flex-shrink-0'>
              <div className='flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full'>
                <span className='text-blue-600 text-sm font-medium'>💡</span>
              </div>
            </div>
            <div>
              <h4 className='text-sm font-medium text-blue-900 mb-1'>
                Dicas para definir objetivos:
              </h4>
              <ul className='text-sm text-blue-800 space-y-1'>
                <li>
                  • Use o método SMART (Específico, Mensurável, Atingível,
                  Relevante, Temporal)
                </li>
                <li>• Defina métricas claras para cada objetivo</li>
                <li>• Priorize objetivos por impacto e urgência</li>
                <li>• Considere objetivos de curto, médio e longo prazo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
