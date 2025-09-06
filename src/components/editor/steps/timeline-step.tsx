'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Calendar, Clock, Flag, CheckCircle2, AlertTriangle } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { timelineSchema, type TimelineFormData } from '@/lib/validations/project';
import { useProjectStore } from '@/stores/useProjectStore';
import { format, parseISO, addDays, addWeeks, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MilestoneData {
  title: string;
  description: string;
  due_date: string;
  type: string;
  status: string;
}

interface TimelineStepProps {
  onNext: () => void;
  onBack: () => void;
}

const milestoneTypes = [
  { value: 'planning', label: 'Planejamento', color: 'bg-blue-100 text-blue-800', icon: Calendar },
  { value: 'development', label: 'Desenvolvimento', color: 'bg-green-100 text-green-800', icon: Clock },
  { value: 'testing', label: 'Testes', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  { value: 'deployment', label: 'Deploy', color: 'bg-purple-100 text-purple-800', icon: Flag },
  { value: 'review', label: 'Revisão', color: 'bg-orange-100 text-orange-800', icon: CheckCircle2 },
  { value: 'milestone', label: 'Marco', color: 'bg-red-100 text-red-800', icon: Flag },
];

const commonMilestones = [
  { title: 'Kick-off do Projeto', type: 'planning', description: 'Reunião inicial e alinhamento da equipe' },
  { title: 'Finalização do Design', type: 'planning', description: 'Aprovação final dos layouts e protótipos' },
  { title: 'Setup do Ambiente', type: 'development', description: 'Configuração de repositórios e ambientes' },
  { title: 'MVP Funcional', type: 'development', description: 'Primeira versão funcional do produto' },
  { title: 'Testes de Integração', type: 'testing', description: 'Testes completos de integração' },
  { title: 'Testes de Usuário', type: 'testing', description: 'Validação com usuários finais' },
  { title: 'Deploy em Produção', type: 'deployment', description: 'Lançamento oficial do produto' },
  { title: 'Revisão Pós-Launch', type: 'review', description: 'Análise de métricas e feedback inicial' },
];

const quickDurations = [
  { label: '1 semana', days: 7 },
  { label: '2 semanas', days: 14 },
  { label: '1 mês', days: 30 },
  { label: '2 meses', days: 60 },
  { label: '3 meses', days: 90 },
  { label: '6 meses', days: 180 },
];

export function TimelineStep({ onNext, onBack }: TimelineStepProps) {
  const { project, setProject } = useProjectStore();
  const [showQuickSetup, setShowQuickSetup] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TimelineFormData>({
    resolver: zodResolver(timelineSchema),
    defaultValues: {
      start_date: project?.start_date || format(new Date(), 'yyyy-MM-dd'),
      end_date: project?.end_date || format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
      milestones: project?.milestones || [],
      methodology: project?.methodology || 'agile',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'milestones',
  });

  const watchedData = watch();
  const startDate = watchedData.start_date ? parseISO(watchedData.start_date) : new Date();
  const endDate = watchedData.end_date ? parseISO(watchedData.end_date) : addMonths(new Date(), 3);

  const addMilestone = (milestone?: MilestoneData) => {
    const newMilestone = milestone || {
      title: '',
      description: '',
      due_date: format(addWeeks(startDate, fields.length + 1), 'yyyy-MM-dd'),
      type: 'development',
      status: 'pending',
    };
    append(newMilestone);
  };

  const addCommonMilestone = (milestone: MilestoneData) => {
    const exists = watchedData.milestones?.some(m => 
      m.title.toLowerCase() === milestone.title.toLowerCase()
    );
    
    if (!exists) {
      addMilestone({
        ...milestone,
        due_date: format(addWeeks(startDate, fields.length + 1), 'yyyy-MM-dd'),
        status: 'pending',
      });
    }
  };

  const setQuickDuration = (days: number) => {
    const newEndDate = addDays(startDate, days);
    setValue('end_date', format(newEndDate, 'yyyy-MM-dd'));
    setShowQuickSetup(false);
  };

  const onSubmit = (data: TimelineFormData) => {
    setProject({
      ...project,
      start_date: data.start_date,
      end_date: data.end_date,
      milestones: data.milestones,
      methodology: data.methodology,
    });
    onNext();
  };

  const skipStep = () => {
    setProject({
      ...project,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
      milestones: [],
      methodology: 'agile',
    });
    onNext();
  };

  const getMilestoneTypeInfo = (type: string) => {
    return milestoneTypes.find(t => t.value === type) || milestoneTypes[1];
  };

  const sortedMilestones = watchedData.milestones?.sort((a, b) => 
    new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  ) || [];

  const projectDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Cronograma e Marcos
        </h2>
        <p className="text-gray-600">
          Defina o cronograma do projeto, marcos importantes e metodologia de desenvolvimento.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Project Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Cronograma do Projeto
            </CardTitle>
            <CardDescription>
              Duração: {projectDuration} dias ({Math.ceil(projectDuration / 7)} semanas)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Data de Início *</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register('start_date')}
                  className={errors.start_date ? 'border-red-500' : ''}
                />
                {errors.start_date && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.start_date.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="end_date">Data de Término *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuickSetup(!showQuickSetup)}
                  >
                    Duração Rápida
                  </Button>
                </div>
                <Input
                  id="end_date"
                  type="date"
                  {...register('end_date')}
                  className={errors.end_date ? 'border-red-500' : ''}
                />
                {errors.end_date && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.end_date.message}
                  </p>
                )}
                
                {showQuickSetup && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {quickDurations.map((duration) => (
                      <Button
                        key={duration.days}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickDuration(duration.days)}
                      >
                        {duration.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="methodology">Metodologia de Desenvolvimento</Label>
              <Select
                value={watchedData.methodology}
                onValueChange={(value) => setValue('methodology', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a metodologia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agile">Ágil (Scrum/Kanban)</SelectItem>
                  <SelectItem value="waterfall">Cascata (Waterfall)</SelectItem>
                  <SelectItem value="hybrid">Híbrida</SelectItem>
                  <SelectItem value="lean">Lean</SelectItem>
                  <SelectItem value="other">Outra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Flag className="h-5 w-5 mr-2" />
                  Marcos e Entregas
                </CardTitle>
                <CardDescription>
                  {fields.length === 0 
                    ? 'Nenhum marco definido ainda'
                    : `${fields.length} marco${fields.length > 1 ? 's' : ''} definido${fields.length > 1 ? 's' : ''}`
                  }
                </CardDescription>
              </div>
              <Button type="button" onClick={() => addMilestone()} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Marco
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Common Milestones */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Marcos Comuns:
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {commonMilestones.map((milestone) => {
                  const exists = watchedData.milestones?.some(m => 
                    m.title.toLowerCase() === milestone.title.toLowerCase()
                  );
                  const typeInfo = getMilestoneTypeInfo(milestone.type);
                  const TypeIcon = typeInfo.icon;
                  
                  return (
                    <Button
                      key={milestone.title}
                      type="button"
                      variant={exists ? "default" : "outline"}
                      size="sm"
                      onClick={() => addCommonMilestone(milestone)}
                      disabled={exists}
                      className="h-auto p-3 text-left justify-start"
                    >
                      <div className="flex items-start space-x-2">
                        {exists ? (
                          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        ) : (
                          <TypeIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <div className="text-xs font-medium">{milestone.title}</div>
                          <div className="text-xs text-muted-foreground">{milestone.description}</div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Added Milestones */}
            {fields.length === 0 ? (
              <div className="text-center py-8">
                <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum marco definido
                </h3>
                <p className="text-gray-600 mb-4">
                  Adicione marcos importantes para acompanhar o progresso do projeto.
                </p>
                <Button onClick={() => addMilestone()} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Marco
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => {
                  const milestone = watchedData.milestones?.[index];
                  const typeInfo = getMilestoneTypeInfo(milestone?.type || 'development');
                  
                  return (
                    <Card key={field.id} className="p-4 bg-gray-50">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`milestones.${index}.title`}>Título do Marco *</Label>
                            <Input
                              id={`milestones.${index}.title`}
                              placeholder="Ex: MVP Funcional"
                              {...register(`milestones.${index}.title`)}
                              className={errors.milestones?.[index]?.title ? 'border-red-500' : ''}
                            />
                            {errors.milestones?.[index]?.title && (
                              <p className="text-sm text-red-500 mt-1">
                                {errors.milestones[index]?.title?.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor={`milestones.${index}.due_date`}>Data de Entrega *</Label>
                            <Input
                              id={`milestones.${index}.due_date`}
                              type="date"
                              {...register(`milestones.${index}.due_date`)}
                              className={errors.milestones?.[index]?.due_date ? 'border-red-500' : ''}
                            />
                            {errors.milestones?.[index]?.due_date && (
                              <p className="text-sm text-red-500 mt-1">
                                {errors.milestones[index]?.due_date?.message}
                              </p>
                            )}
                          </div>

                          <div className="flex items-end space-x-2">
                            <div className="flex-1">
                              <Label htmlFor={`milestones.${index}.type`}>Tipo *</Label>
                              <Select
                                value={milestone?.type}
                                onValueChange={(value) => setValue(`milestones.${index}.type`, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Tipo do marco" />
                                </SelectTrigger>
                                <SelectContent>
                                  {milestoneTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                      <SelectItem key={type.value} value={type.value}>
                                        <div className="flex items-center">
                                          <Icon className="h-4 w-4 mr-2" />
                                          {type.label}
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`milestones.${index}.description`}>Descrição</Label>
                          <Textarea
                            id={`milestones.${index}.description`}
                            placeholder="Descreva o que será entregue neste marco..."
                            rows={2}
                            {...register(`milestones.${index}.description`)}
                          />
                        </div>

                        <input
                          type="hidden"
                          {...register(`milestones.${index}.status`)}
                          value="pending"
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline Visualization */}
        {sortedMilestones.length > 0 && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">Linha do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedMilestones.map((milestone, index) => {
                  const typeInfo = getMilestoneTypeInfo(milestone.type);
                  const TypeIcon = typeInfo.icon;
                  const dueDate = parseISO(milestone.due_date);
                  const isOverdue = dueDate < new Date();
                  
                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${typeInfo.color}`}>
                          <TypeIcon className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">{milestone.title}</h4>
                          <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                          {isOverdue && (
                            <Badge variant="destructive">Atrasado</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                        <p className="text-xs text-gray-500">
                          {format(dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onBack}>
            Voltar
          </Button>
          <div className="flex space-x-2">
            <Button type="button" variant="ghost" onClick={skipStep}>
              Pular Esta Etapa
            </Button>
            <Button type="submit">
              Próximo: Revisão
            </Button>
          </div>
        </div>
      </form>

      {/* Help Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <span className="text-blue-600 text-sm font-medium">💡</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Dicas para o cronograma:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Inclua buffer de tempo para imprevistos (15-20%)</li>
                <li>• Defina marcos mensuráveis e específicos</li>
                <li>• Considere dependências entre tarefas</li>
                <li>• Revise o cronograma regularmente</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}