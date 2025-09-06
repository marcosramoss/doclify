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
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { reviewSchema, type ReviewFormData } from '@/lib/validations/project';
import { useProjectStore } from '@/stores/useProjectStore';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface ReviewStepProps {
  onBack: () => void;
  onFinish: () => void;
}

export function ReviewStep({ onBack, onFinish }: ReviewStepProps) {
  const { project, setProject } = useProjectStore();
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
      notes: project?.notes || '',
      version: project?.version || '1.0.0',
    },
  });

  const watchedData = watch();

  const onSubmit = async (data: ReviewFormData) => {
    setIsSaving(true);
    try {
      setProject({
        ...project,
        notes: data.notes,
        version: data.version,
        updated_at: new Date().toISOString(),
      });
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Documento salvo com sucesso!');
      onFinish();
    } catch (error) {
      toast.error('Erro ao salvar documento');
    } finally {
      setIsSaving(false);
    }
  };

  const exportDocument = () => {
    toast.success('Exportação iniciada! O download começará em breve.');
  };

  const shareDocument = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado para a área de transferência!');
  };

  const getCompletionStats = () => {
    const sections = [
      { name: 'Informações Básicas', completed: !!(project?.name && project?.description) },
      { name: 'Equipe', completed: !!(project?.team && project.team.length > 0) },
      { name: 'Tecnologias', completed: !!(project?.technologies && project.technologies.length > 0) },
      { name: 'Objetivos', completed: !!(project?.objectives && project.objectives.length > 0) },
      { name: 'Cronograma', completed: !!(project?.start_date && project?.end_date) },
    ];
    
    const completed = sections.filter(s => s.completed).length;
    const total = sections.length;
    const percentage = Math.round((completed / total) * 100);
    
    return { sections, completed, total, percentage };
  };

  const stats = getCompletionStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Revisão e Finalização
        </h2>
        <p className="text-gray-600">
          Revise todas as informações do documento antes de finalizar.
        </p>
      </div>

      {/* Completion Status */}
      <Card className={stats.percentage === 100 ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                {stats.percentage === 100 ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
                )}
                Status do Documento
              </CardTitle>
              <CardDescription>
                {stats.completed} de {stats.total} seções preenchidas ({stats.percentage}%)
              </CardDescription>
            </div>
            <Badge 
              className={stats.percentage === 100 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
            >
              {stats.percentage === 100 ? 'Completo' : 'Incompleto'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.sections.map((section, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{section.name}</span>
                {section.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
              </div>
            ))}
          </div>
          
          {stats.percentage < 100 && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Algumas seções estão incompletas. Você pode finalizar mesmo assim ou voltar para preenchê-las.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Document Preview */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
          <TabsTrigger value="tech">Tecnologias</TabsTrigger>
          <TabsTrigger value="objectives">Objetivos</TabsTrigger>
          <TabsTrigger value="timeline">Cronograma</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Informações do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-medium">Nome do Projeto</Label>
                <p className="text-sm text-gray-600">{project?.name || 'Não informado'}</p>
              </div>
              <div>
                <Label className="font-medium">Descrição</Label>
                <p className="text-sm text-gray-600">{project?.description || 'Não informada'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Status</Label>
                  <p className="text-sm text-gray-600">{project?.status || 'Não definido'}</p>
                </div>
                <div>
                  <Label className="font-medium">Versão</Label>
                  <p className="text-sm text-gray-600">{watchedData.version}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Equipe do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project?.team && project.team.length > 0 ? (
                <div className="space-y-3">
                  {project.team.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                      <Badge variant="secondary">{member.role}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Nenhum membro da equipe adicionado.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tech" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Stack Tecnológico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project?.technologies && project.technologies.length > 0 ? (
                <div className="space-y-4">
                  {['frontend', 'backend', 'database', 'mobile', 'devops', 'other'].map(category => {
                    const techs = project.technologies?.filter(t => t.category === category) || [];
                    if (techs.length === 0) return null;
                    
                    return (
                      <div key={category}>
                        <h4 className="font-medium mb-2 capitalize">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                          {techs.map((tech, index) => (
                            <Badge key={index} variant="outline">
                              {tech.name}
                              {tech.version && <span className="ml-1 text-xs">v{tech.version}</span>}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {project.architecture && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Arquitetura</h4>
                      <p className="text-sm text-gray-600">{project.architecture}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">Nenhuma tecnologia documentada.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="objectives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Objetivos e Metas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project?.objectives && project.objectives.length > 0 ? (
                <div className="space-y-4">
                  {project.objectives.map((objective, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{objective.title}</h4>
                        <Badge 
                          className={
                            objective.priority === 'high' ? 'bg-red-100 text-red-800' :
                            objective.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }
                        >
                          {objective.priority === 'high' ? 'Alta' :
                           objective.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                      {objective.description && (
                        <p className="text-sm text-gray-600 mb-2">{objective.description}</p>
                      )}
                      {objective.success_metric && (
                        <p className="text-xs text-gray-500">Métrica: {objective.success_metric}</p>
                      )}
                    </div>
                  ))}
                  
                  {project.success_criteria && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Critérios de Sucesso</h4>
                      <p className="text-sm text-gray-600">{project.success_criteria}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">Nenhum objetivo definido.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Cronograma
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project?.start_date && project?.end_date ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Data de Início</Label>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(project.start_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Data de Término</Label>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(project.end_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  
                  {project.methodology && (
                    <div>
                      <Label className="font-medium">Metodologia</Label>
                      <p className="text-sm text-gray-600 capitalize">{project.methodology}</p>
                    </div>
                  )}
                  
                  {project.milestones && project.milestones.length > 0 && (
                    <div>
                      <Label className="font-medium mb-2 block">Marcos</Label>
                      <div className="space-y-2">
                        {project.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium text-sm">{milestone.title}</p>
                              <p className="text-xs text-gray-600">{milestone.description}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="mb-1">{milestone.type}</Badge>
                              <p className="text-xs text-gray-500">
                                {format(parseISO(milestone.due_date), 'dd/MM/yyyy')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">Cronograma não definido.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Final Notes and Version */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Edit className="h-5 w-5 mr-2" />
                Notas Finais e Versão
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="version">Versão do Documento</Label>
              <Input
                id="version"
                placeholder="Ex: 1.0.0, v2.1, Draft"
                {...register('version')}
                disabled={!isEditing}
                className={errors.version ? 'border-red-500' : ''}
              />
              {errors.version && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.version.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Notas e Observações</Label>
              <Textarea
                id="notes"
                placeholder="Adicione notas finais, observações importantes ou próximos passos..."
                rows={4}
                {...register('notes')}
                disabled={!isEditing}
                className={errors.notes ? 'border-red-500' : ''}
              />
              {errors.notes && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.notes.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onBack}>
              Voltar
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Finalizar Documento
                </>
              )}
            </Button>
          </div>
          
          <Separator orientation="vertical" className="hidden sm:block" />
          
          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={exportDocument}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button type="button" variant="outline" onClick={shareDocument}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
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
                Próximos passos:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Compartilhe o documento com a equipe para revisão</li>
                <li>• Exporte em PDF para apresentações formais</li>
                <li>• Mantenha o documento atualizado conforme o projeto evolui</li>
                <li>• Use como referência para reuniões e tomadas de decisão</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}