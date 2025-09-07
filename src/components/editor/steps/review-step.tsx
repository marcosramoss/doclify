'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FileText,
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
  Users,
  Code,
  Target,
  Calendar,
  Edit,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
  Project,
  FunctionalRequirement,
  NonFunctionalRequirement,
  Audience,
  PaymentInfo,
  Stakeholder,
} from '@/types';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { reviewSchema, type ReviewFormData } from '@/lib/validations/project';
import { useProjectStore } from '@/stores/useProjectStore';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { exportToPDF, generateDocumentHTML } from '@/utils/export';

interface ReviewStepProps {
  onBack: () => void;
  onFinish: () => void;
}

// Extended project type for review state
interface ExtendedProject extends Project {
  functional_requirements?: FunctionalRequirement[];
  non_functional_requirements?: NonFunctionalRequirement[];
  audiences?: Audience[];
  payment_info?: PaymentInfo;
  stakeholders?: Stakeholder[];
}

export function ReviewStep({ onBack, onFinish }: ReviewStepProps) {
  const { currentProject, setCurrentProject: setProject } = useProjectStore();
  const project = currentProject as ExtendedProject | null;
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      notes: '',
      version: '1.0.0',
    },
  });

  const watchedData = watch();

  const onSubmit = async (data: ReviewFormData) => {
    console.log('ReviewStep onSubmit called with data:', data);
    console.log('Current project state:', project);
    setIsSaving(true);
    try {
      const updatedProject = {
        ...project,
        updated_at: new Date().toISOString(),
      } as Project;
      console.log('Updated project data:', updatedProject);

      setProject(updatedProject);

      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('About to call onFinish()');
      toast.success('Documento salvo com sucesso!');
      onFinish();
    } catch (error) {
      console.error('Error in ReviewStep onSubmit:', error);
      toast.error(
        'Erro ao salvar documento: ' +
          (error instanceof Error ? error.message : 'Erro desconhecido')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const exportDocument = async () => {
    if (!project) {
      toast.error('Nenhum projeto encontrado para exportar');
      return;
    }

    try {
      // Create temporary element with project content
      const tempDiv = document.createElement('div');
      tempDiv.id = 'temp-document-content';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '210mm';
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.fontFamily = 'Arial, sans-serif';

      // Generate HTML content using the same function as dashboard
      const extendedProject = {
        ...project,
        members: project.members || [],
        technologies: project.technologies || [],
        objectives: project.objectives || [],
        milestones: project.milestones || [],
        audiences: project.audiences || [],
        functional_requirements: project.functional_requirements || [],
        non_functional_requirements: project.non_functional_requirements || [],
        payment_info: project.payment_info,
        stakeholders: project.stakeholders || [],
      };

      tempDiv.innerHTML = generateDocumentHTML(extendedProject);
      document.body.appendChild(tempDiv);

      // Export to PDF
      const result = await exportToPDF(
        extendedProject,
        'temp-document-content'
      );

      // Clean up
      document.body.removeChild(tempDiv);

      if (result.success) {
        toast.success(`PDF exportado com sucesso! Arquivo: ${result.fileName}`);
      } else {
        toast.error(`Erro ao exportar PDF: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  const shareDocument = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado para a área de transferência!');
  };

  const getCompletionStats = () => {
    const sections = [
      {
        name: 'Informações Básicas',
        completed: !!(project?.title && project?.description),
      },
      {
        name: 'Equipe',
        completed: !!(project?.members && project.members.length > 0),
      },
      {
        name: 'Tecnologias',
        completed: !!(project?.technologies && project.technologies.length > 0),
      },
      {
        name: 'Objetivos',
        completed: !!(project?.objectives && project.objectives.length > 0),
      },
      {
        name: 'Requisitos Funcionais',
        completed: !!(
          project?.functional_requirements &&
          project.functional_requirements.length > 0
        ),
      },
      {
        name: 'Requisitos Não Funcionais',
        completed: !!(
          project?.non_functional_requirements &&
          project.non_functional_requirements.length > 0
        ),
      },
      {
        name: 'Cronograma',
        completed: !!(project?.start_date && project?.end_date),
      },
    ];

    const completed = sections.filter(s => s.completed).length;
    const total = sections.length;
    const percentage = Math.round((completed / total) * 100);

    return { sections, completed, total, percentage };
  };

  const stats = getCompletionStats();

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>
          Revisão e Finalização
        </h2>
        <p className='text-gray-600'>
          Revise todas as informações do documento antes de finalizar.
        </p>
      </div>

      {/* Completion Status */}
      <Card
        className={
          stats.percentage === 100
            ? 'border-green-200 bg-green-50'
            : 'border-yellow-200 bg-yellow-50'
        }
      >
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center'>
                {stats.percentage === 100 ? (
                  <CheckCircle className='h-5 w-5 mr-2 text-green-600' />
                ) : (
                  <AlertCircle className='h-5 w-5 mr-2 text-yellow-600' />
                )}
                Status do Documento
              </CardTitle>
              <CardDescription>
                {stats.completed} de {stats.total} seções preenchidas (
                {stats.percentage}%)
              </CardDescription>
            </div>
            <Badge
              className={
                stats.percentage === 100
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }
            >
              {stats.percentage === 100 ? 'Completo' : 'Incompleto'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {stats.sections.map((section, index) => (
              <div key={index} className='flex items-center justify-between'>
                <span className='text-sm'>{section.name}</span>
                {section.completed ? (
                  <CheckCircle className='h-4 w-4 text-green-600' />
                ) : (
                  <AlertCircle className='h-4 w-4 text-yellow-600' />
                )}
              </div>
            ))}
          </div>

          {stats.percentage < 100 && (
            <Alert className='mt-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                Algumas seções estão incompletas. Você pode finalizar mesmo
                assim ou voltar para preenchê-las.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Document Preview */}
      <Tabs defaultValue='overview' className='w-full'>
        <TabsList className='grid w-full grid-cols-4 lg:grid-cols-8'>
          <TabsTrigger value='overview'>Visão Geral</TabsTrigger>
          <TabsTrigger value='team'>Equipe</TabsTrigger>
          <TabsTrigger value='tech'>Tecnologias</TabsTrigger>
          <TabsTrigger value='objectives'>Objetivos</TabsTrigger>
          <TabsTrigger value='timeline'>Cronograma</TabsTrigger>
          <TabsTrigger value='requirements'>Requisitos</TabsTrigger>
          <TabsTrigger value='stakeholders'>Stakeholders</TabsTrigger>
          <TabsTrigger value='payment'>Pagamento</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <FileText className='h-5 w-5 mr-2' />
                Informações do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label className='font-medium'>Nome do Projeto</Label>
                <p className='text-sm text-gray-600'>
                  {project?.title || 'Não informado'}
                </p>
              </div>
              <div>
                <Label className='font-medium'>Descrição</Label>
                <p className='text-sm text-gray-600'>
                  {project?.description || 'Não informada'}
                </p>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='font-medium'>Empresa</Label>
                  <p className='text-sm text-gray-600'>
                    {project?.company_name || 'Não informada'}
                  </p>
                </div>
                <div>
                  <Label className='font-medium'>Tipo de Projeto</Label>
                  <p className='text-sm text-gray-600'>
                    {project?.project_type || 'Não definido'}
                  </p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='font-medium'>Status</Label>
                  <p className='text-sm text-gray-600'>
                    {project?.status || 'Não definido'}
                  </p>
                </div>
                <div>
                  <Label className='font-medium'>Versão</Label>
                  <p className='text-sm text-gray-600'>{watchedData.version}</p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='font-medium'>Data de Início</Label>
                  <p className='text-sm text-gray-600'>
                    {project?.start_date
                      ? format(parseISO(project.start_date), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })
                      : 'Não definida'}
                  </p>
                </div>
                <div>
                  <Label className='font-medium'>Data de Término</Label>
                  <p className='text-sm text-gray-600'>
                    {project?.end_date
                      ? format(parseISO(project.end_date), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })
                      : 'Não definida'}
                  </p>
                </div>
              </div>
              <div>
                <Label className='font-medium'>Metodologia</Label>
                <p className='text-sm text-gray-600'>
                  {project?.methodology || 'Não definida'}
                </p>
              </div>
              <div>
                <Label className='font-medium'>Arquitetura</Label>
                <p className='text-sm text-gray-600'>
                  {project?.architecture || 'Não definida'}
                </p>
              </div>
              <div>
                <Label className='font-medium'>Critérios de Sucesso</Label>
                <p className='text-sm text-gray-600'>
                  {project?.success_criteria || 'Não definidos'}
                </p>
              </div>
              <div>
                <Label className='font-medium'>Restrições</Label>
                <p className='text-sm text-gray-600'>
                  {project?.constraints || 'Não definidas'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='team' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Users className='h-5 w-5 mr-2' />
                Equipe do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project?.members && project.members.length > 0 ? (
                <div className='space-y-2'>
                  {project.members.map((member, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                    >
                      <div>
                        <p className='font-medium'>{member.name}</p>
                        <p className='text-sm text-gray-600'>{member.email}</p>
                      </div>
                      <Badge variant='secondary'>{member.role}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-gray-600'>
                  Nenhum membro da equipe adicionado.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='tech' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Code className='h-5 w-5 mr-2' />
                Stack Tecnológico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project?.technologies && project.technologies.length > 0 ? (
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {project.technologies.map((tech, index) => (
                      <div
                        key={index}
                        className='p-4 bg-gray-50 rounded-lg border'
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <h4 className='font-medium text-gray-900'>
                            {tech.name}
                          </h4>
                          <Badge variant='outline'>
                            {tech.category === 'frontend' && 'Frontend'}
                            {tech.category === 'backend' && 'Backend'}
                            {tech.category === 'database' && 'Database'}
                            {tech.category === 'mobile' && 'Mobile'}
                            {tech.category === 'devops' && 'DevOps'}
                            {tech.category === 'other' && 'Outros'}
                          </Badge>
                        </div>
                        {tech.version && (
                          <p className='text-sm text-gray-600 mb-1'>
                            <span className='font-medium'>Versão:</span>{' '}
                            {tech.version}
                          </p>
                        )}
                        {tech.description && (
                          <p className='text-sm text-gray-600'>
                            {tech.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  <Code className='h-12 w-12 mx-auto mb-4 opacity-50' />
                  <p>Nenhuma tecnologia configurada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='objectives' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Target className='h-5 w-5 mr-2' />
                Objetivos e Metas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project?.objectives && project.objectives.length > 0 ? (
                <div className='space-y-4'>
                  {project.objectives.map((objective, index) => (
                    <div
                      key={index}
                      className='p-4 bg-gray-50 rounded-lg border'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <h4 className='font-medium text-gray-900'>
                          {objective.title}
                        </h4>
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant={
                              objective.priority === 'high'
                                ? 'destructive'
                                : objective.priority === 'medium'
                                  ? 'default'
                                  : 'secondary'
                            }
                          >
                            {objective.priority === 'high' && 'Alta'}
                            {objective.priority === 'medium' && 'Média'}
                            {objective.priority === 'low' && 'Baixa'}
                          </Badge>
                          {objective.status && (
                            <Badge variant='outline'>
                              {objective.status === 'pending' && 'Pendente'}
                              {objective.status === 'in_progress' &&
                                'Em Progresso'}
                              {objective.status === 'completed' && 'Concluído'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {objective.description && (
                        <p className='text-sm text-gray-600 mb-2'>
                          {objective.description}
                        </p>
                      )}
                      {objective.type && (
                        <p className='text-xs text-gray-500'>
                          <span className='font-medium'>Tipo:</span>
                          {objective.type === 'business' && ' Negócio'}
                          {objective.type === 'technical' && ' Técnico'}
                          {objective.type === 'user' && ' Usuário'}
                          {objective.type === 'performance' && ' Performance'}
                          {objective.type === 'security' && ' Segurança'}
                          {objective.type === 'other' && ' Outros'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  <Target className='h-12 w-12 mx-auto mb-4 opacity-50' />
                  <p>Nenhum objetivo configurado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='timeline' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Calendar className='h-5 w-5 mr-2' />
                Cronograma
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project?.milestones && project.milestones.length > 0 ? (
                <div className='space-y-4'>
                  <div className='grid gap-4'>
                    {project.milestones
                      .sort(
                        (a, b) =>
                          new Date(a.due_date).getTime() -
                          new Date(b.due_date).getTime()
                      )
                      .map((milestone, index) => (
                        <div
                          key={index}
                          className='p-4 bg-gray-50 rounded-lg border relative'
                        >
                          <div className='flex items-center justify-between mb-2'>
                            <h4 className='font-medium text-gray-900'>
                              {milestone.title}
                            </h4>
                            <div className='flex items-center gap-2'>
                              {milestone.type && (
                                <Badge variant='outline'>
                                  {milestone.type === 'planning' &&
                                    'Planejamento'}
                                  {milestone.type === 'development' &&
                                    'Desenvolvimento'}
                                  {milestone.type === 'testing' && 'Testes'}
                                  {milestone.type === 'deployment' && 'Deploy'}
                                  {milestone.type === 'review' && 'Revisão'}
                                  {milestone.type === 'milestone' && 'Marco'}
                                  {![
                                    'planning',
                                    'development',
                                    'testing',
                                    'deployment',
                                    'review',
                                    'milestone',
                                  ].includes(milestone.type) && milestone.type}
                                </Badge>
                              )}
                              <Badge
                                variant={
                                  milestone.status === 'completed'
                                    ? 'default'
                                    : milestone.status === 'in_progress'
                                      ? 'secondary'
                                      : 'outline'
                                }
                              >
                                {milestone.status === 'pending' && 'Pendente'}
                                {milestone.status === 'in_progress' &&
                                  'Em Progresso'}
                                {milestone.status === 'completed' &&
                                  'Concluído'}
                              </Badge>
                            </div>
                          </div>
                          <div className='flex items-center gap-4 text-sm text-gray-600 mb-2'>
                            <span className='flex items-center gap-1'>
                              <Calendar className='h-4 w-4' />
                              {format(
                                parseISO(milestone.due_date),
                                'dd/MM/yyyy',
                                { locale: ptBR }
                              )}
                            </span>
                          </div>
                          {milestone.description && (
                            <p className='text-sm text-gray-600'>
                              {milestone.description}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  <Calendar className='h-12 w-12 mx-auto mb-4 opacity-50' />
                  <p>Nenhum cronograma configurado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='requirements' className='space-y-4'>
          <div className='grid gap-4'>
            {/* Functional Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <CheckCircle className='h-5 w-5 mr-2' />
                  Requisitos Funcionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project?.functional_requirements &&
                project.functional_requirements.length > 0 ? (
                  <div className='space-y-4'>
                    {project.functional_requirements.map((req, index) => (
                      <div
                        key={index}
                        className='p-4 bg-gray-50 rounded-lg border'
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <h4 className='font-medium text-gray-900'>
                            {req.title}
                          </h4>
                          <div className='flex items-center gap-2'>
                            <Badge
                              variant={
                                req.priority === 'must_have' ||
                                req.priority === 'obrigatorio'
                                  ? 'destructive'
                                  : req.priority === 'should_have' ||
                                      req.priority === 'importante'
                                    ? 'default'
                                    : req.priority === 'could_have' ||
                                        req.priority === 'desejavel'
                                      ? 'secondary'
                                      : 'outline'
                              }
                            >
                              {(req.priority === 'must_have' ||
                                req.priority === 'obrigatorio') &&
                                'Obrigatório'}
                              {(req.priority === 'should_have' ||
                                req.priority === 'importante') &&
                                'Importante'}
                              {(req.priority === 'could_have' ||
                                req.priority === 'desejavel') &&
                                'Desejável'}
                              {(req.priority === 'wont_have' ||
                                req.priority === 'nao_prioritario') &&
                                'Não Prioritário'}
                            </Badge>
                          </div>
                        </div>
                        {req.description && (
                          <p className='text-sm text-gray-600 mb-2'>
                            {req.description}
                          </p>
                        )}
                        {req.acceptance_criteria && (
                          <p className='text-xs text-gray-500'>
                            <span className='font-medium'>
                              Critérios de Aceitação:
                            </span>{' '}
                            {req.acceptance_criteria}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8 text-gray-500'>
                    <CheckCircle className='h-12 w-12 mx-auto mb-4 opacity-50' />
                    <p>Nenhum requisito funcional configurado</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Non-Functional Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <AlertCircle className='h-5 w-5 mr-2' />
                  Requisitos Não Funcionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project?.non_functional_requirements &&
                project.non_functional_requirements.length > 0 ? (
                  <div className='space-y-4'>
                    {project.non_functional_requirements.map((req, index) => (
                      <div
                        key={index}
                        className='p-4 bg-gray-50 rounded-lg border'
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <h4 className='font-medium text-gray-900'>
                            {req.title}
                          </h4>
                          <Badge
                            variant={
                              req.category === 'performance'
                                ? 'default'
                                : req.category === 'security'
                                  ? 'destructive'
                                  : req.category === 'usability'
                                    ? 'secondary'
                                    : 'outline'
                            }
                          >
                            {req.category === 'performance' && 'Performance'}
                            {req.category === 'security' && 'Segurança'}
                            {req.category === 'usability' && 'Usabilidade'}
                            {req.category === 'reliability' && 'Confiabilidade'}
                            {req.category === 'scalability' && 'Escalabilidade'}
                            {req.category === 'other' && 'Outros'}
                          </Badge>
                        </div>
                        {req.description && (
                          <p className='text-sm text-gray-600 mb-2'>
                            {req.description}
                          </p>
                        )}
                        <div className='flex gap-4 text-xs text-gray-500'>
                          {req.metric && (
                            <span>
                              <span className='font-medium'>Métrica:</span>{' '}
                              {req.metric}
                            </span>
                          )}
                          {req.target_value && (
                            <span>
                              <span className='font-medium'>Valor Alvo:</span>{' '}
                              {req.target_value}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8 text-gray-500'>
                    <AlertCircle className='h-12 w-12 mx-auto mb-4 opacity-50' />
                    <p>Nenhum requisito não funcional configurado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='stakeholders' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Users className='h-5 w-5 mr-2' />
                Stakeholders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8 text-gray-500'>
                <Users className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>Nenhum stakeholder configurado</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='payment' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <FileText className='h-5 w-5 mr-2' />
                Informações de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8 text-gray-500'>
                <FileText className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>Nenhuma informação de pagamento configurada</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Final Notes and Version */}
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span className='flex items-center'>
                <Edit className='h-5 w-5 mr-2' />
                Notas Finais e Versão
              </span>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='version'>Versão do Documento</Label>
              <Input
                id='version'
                placeholder='Ex: 1.0.0, v2.1, Draft'
                {...register('version')}
                disabled={!isEditing}
                className={errors.version ? 'border-red-500' : ''}
              />
              {errors.version && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.version.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor='notes'>Notas e Observações</Label>
              <Textarea
                id='notes'
                placeholder='Adicione notas finais, observações importantes ou próximos passos...'
                rows={4}
                {...register('notes')}
                disabled={!isEditing}
                className={errors.notes ? 'border-red-500' : ''}
              />
              {errors.notes && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.notes.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex space-x-2'>
            <Button type='button' variant='outline' onClick={onBack}>
              Voltar
            </Button>
            <Button
              type='submit'
              disabled={isSaving}
              className='bg-green-600 hover:bg-green-700'
            >
              {isSaving ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  Finalizar Documento
                </>
              )}
            </Button>
          </div>

          <Separator orientation='vertical' className='hidden sm:block' />

          <div className='flex space-x-2'>
            <Button type='button' variant='outline' onClick={exportDocument}>
              <Download className='h-4 w-4 mr-2' />
              Exportar PDF
            </Button>
            <Button type='button' variant='outline' onClick={shareDocument}>
              <Share2 className='h-4 w-4 mr-2' />
              Compartilhar
            </Button>
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
                Próximos passos:
              </h4>
              <ul className='text-sm text-blue-800 space-y-1'>
                <li>• Compartilhe o documento com a equipe para revisão</li>
                <li>• Exporte em PDF para apresentações formais</li>
                <li>
                  • Mantenha o documento atualizado conforme o projeto evolui
                </li>
                <li>
                  • Use como referência para reuniões e tomadas de decisão
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
