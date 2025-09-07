'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Download,
  Share2,
  Calendar,
  Users,
  Tag,
  Target,
  CheckSquare,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AppLayout } from '@/components/layout/app-layout';
import {
  useProject,
  useTeamMembers,
  useTechnologies,
  useObjectives,
  useFunctionalRequirements,
  useNonFunctionalRequirements,
} from '@/hooks/useProjects';
import { formatDate } from '@/utils/format';
import { exportToPDF } from '@/utils/export';
import type {
  Project,
  Technology,
  Objective,
  TeamMember,
  FunctionalRequirement,
  NonFunctionalRequirement,
} from '@/types';

// Extended project type for display
interface ExtendedProject extends Project {
  technologies?: Technology[];
  objectives?: Objective[];
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
};

const statusLabels = {
  draft: 'Rascunho',
  in_progress: 'Em Progresso',
  review: 'Em Revisão',
  completed: 'Concluído',
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { data: project, isLoading, error } = useProject(projectId);
  const { data: teamMembers, isLoading: isLoadingTeam } =
    useTeamMembers(projectId);
  const { data: technologies, isLoading: isLoadingTech } =
    useTechnologies(projectId);
  const { data: objectives, isLoading: isLoadingObjectives } =
    useObjectives(projectId);
  const { data: functionalRequirements, isLoading: isLoadingFunctional } =
    useFunctionalRequirements(projectId);
  const { data: nonFunctionalRequirements, isLoading: isLoadingNonFunctional } =
    useNonFunctionalRequirements(projectId);

  const handleExportPDF = async () => {
    if (!project) return;

    try {
      await exportToPDF(project);
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar PDF');
    }
  };

  const handleShare = async () => {
    if (!project) return;

    try {
      await navigator.share({
        title: project.title,
        text: project.description || 'Projeto Doclify',
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  const isLoadingAny =
    isLoading ||
    isLoadingTeam ||
    isLoadingTech ||
    isLoadingObjectives ||
    isLoadingFunctional ||
    isLoadingNonFunctional;

  if (isLoadingAny) {
    return (
      <AppLayout>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4' />
            <p className='text-gray-600'>Carregando projeto...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !project) {
    return (
      <AppLayout>
        <div className='text-center py-12'>
          <p className='text-red-600 mb-4'>Projeto não encontrado</p>
          <Button onClick={() => router.back()}>Voltar</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Button variant='ghost' size='sm' onClick={() => router.back()}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Voltar
            </Button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                {project.title}
              </h1>
              {project.description && (
                <p className='text-gray-600 mt-1'>{project.description}</p>
              )}
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <Button variant='outline' size='sm' onClick={handleShare}>
              <Share2 className='h-4 w-4 mr-2' />
              Compartilhar
            </Button>
            <Button variant='outline' size='sm' onClick={handleExportPDF}>
              <Download className='h-4 w-4 mr-2' />
              Exportar PDF
            </Button>
            <Button asChild>
              <Link href={`/editor/${project.id}`}>
                <Edit className='h-4 w-4 mr-2' />
                Editar
              </Link>
            </Button>
          </div>
        </div>

        {/* Status and Meta */}
        <div className='flex items-center space-x-4'>
          <Badge
            variant='secondary'
            className={
              statusColors[project.status as keyof typeof statusColors]
            }
          >
            {statusLabels[project.status as keyof typeof statusLabels]}
          </Badge>
          <div className='flex items-center text-sm text-gray-500'>
            <Calendar className='h-4 w-4 mr-1' />
            Criado em {formatDate(project.created_at)}
          </div>
          <div className='flex items-center text-sm text-gray-500'>
            <Calendar className='h-4 w-4 mr-1' />
            Atualizado em {formatDate(project.updated_at)}
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Project Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Visão Geral do Projeto</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {project.description && (
                  <div>
                    <h4 className='font-medium mb-2'>Descrição</h4>
                    <p className='text-gray-600'>{project.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team */}
            {teamMembers && teamMembers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Users className='h-5 w-5 mr-2' />
                    Equipe ({teamMembers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {teamMembers.map((member, index) => (
                      <div
                        key={member.id || index}
                        className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'
                      >
                        <div className='h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center'>
                          <span className='text-sm font-medium text-blue-600'>
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className='font-medium'>{member.name}</p>
                          <p className='text-sm text-gray-500'>{member.role}</p>
                          {member.email && (
                            <p className='text-xs text-gray-400'>
                              {member.email}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Technologies */}
            {technologies && technologies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Tag className='h-5 w-5 mr-2' />
                    Tecnologias ({technologies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {Object.entries(
                      technologies.reduce(
                        (acc, tech) => {
                          if (!acc[tech.category]) acc[tech.category] = [];
                          acc[tech.category].push(tech);
                          return acc;
                        },
                        {} as Record<string, Technology[]>
                      )
                    ).map(([category, techs]) => (
                      <div key={category}>
                        <h4 className='font-medium text-sm text-gray-700 mb-2 capitalize'>
                          {category === 'frontend'
                            ? 'Frontend'
                            : category === 'backend'
                              ? 'Backend'
                              : category === 'database'
                                ? 'Banco de Dados'
                                : category === 'mobile'
                                  ? 'Mobile'
                                  : category === 'devops'
                                    ? 'DevOps'
                                    : 'Outros'}
                        </h4>
                        <div className='flex flex-wrap gap-2'>
                          {techs.map((tech, index) => (
                            <Badge
                              key={tech.id || index}
                              variant='outline'
                              className='text-xs'
                            >
                              {tech.name}
                              {tech.version && (
                                <span className='ml-1 text-gray-500'>
                                  v{tech.version}
                                </span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Objectives */}
            {objectives && objectives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Target className='h-5 w-5 mr-2' />
                    Objetivos ({objectives.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {objectives.map((objective, index) => {
                      const priorityColors = {
                        high: 'bg-red-100 text-red-800',
                        medium: 'bg-yellow-100 text-yellow-800',
                        low: 'bg-green-100 text-green-800',
                      };
                      const priorityLabels = {
                        high: 'Alta',
                        medium: 'Média',
                        low: 'Baixa',
                      };

                      return (
                        <div
                          key={objective.id || index}
                          className='p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500'
                        >
                          <div className='flex items-start justify-between mb-2'>
                            <h4 className='font-medium text-gray-900'>
                              {objective.title}
                            </h4>
                            <Badge
                              variant='secondary'
                              className={`text-xs ${priorityColors[objective.priority]}`}
                            >
                              {priorityLabels[objective.priority]}
                            </Badge>
                          </div>
                          {objective.description && (
                            <p className='text-sm text-gray-600 mt-2'>
                              {objective.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Functional Requirements */}
            {functionalRequirements && functionalRequirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <CheckSquare className='h-5 w-5 mr-2' />
                    Requisitos Funcionais ({functionalRequirements.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {functionalRequirements.map((requirement, index) => {
                      const priorityColors = {
                        must_have: 'bg-red-100 text-red-800',
                        should_have: 'bg-yellow-100 text-yellow-800',
                        could_have: 'bg-blue-100 text-blue-800',
                        wont_have: 'bg-gray-100 text-gray-800',
                      };
                      const priorityLabels = {
                        must_have: 'Obrigatório',
                        should_have: 'Importante',
                        could_have: 'Desejável',
                        wont_have: 'Não Prioritário',
                      };

                      return (
                        <div
                          key={requirement.id || index}
                          className='p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500'
                        >
                          <div className='flex items-start justify-between mb-2'>
                            <h4 className='font-medium text-gray-900'>
                              {requirement.title}
                            </h4>
                            <Badge
                              variant='secondary'
                              className={`text-xs ${priorityColors[requirement.priority]}`}
                            >
                              {priorityLabels[requirement.priority]}
                            </Badge>
                          </div>
                          {requirement.description && (
                            <p className='text-sm text-gray-600 mt-2'>
                              {requirement.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Non-Functional Requirements */}
            {nonFunctionalRequirements &&
              nonFunctionalRequirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <Shield className='h-5 w-5 mr-2' />
                      Requisitos Não Funcionais (
                      {nonFunctionalRequirements.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      {nonFunctionalRequirements.map((requirement, index) => {
                        const categoryColors = {
                          performance: 'bg-orange-100 text-orange-800',
                          security: 'bg-red-100 text-red-800',
                          usability: 'bg-blue-100 text-blue-800',
                          reliability: 'bg-green-100 text-green-800',
                          scalability: 'bg-purple-100 text-purple-800',
                          other: 'bg-gray-100 text-gray-800',
                        };
                        const categoryLabels = {
                          performance: 'Performance',
                          security: 'Segurança',
                          usability: 'Usabilidade',
                          reliability: 'Confiabilidade',
                          scalability: 'Escalabilidade',
                          other: 'Outros',
                        };

                        return (
                          <div
                            key={requirement.id || index}
                            className='p-4 bg-green-50 rounded-lg border-l-4 border-green-500'
                          >
                            <div className='flex items-start justify-between mb-2'>
                              <h4 className='font-medium text-gray-900'>
                                {requirement.title}
                              </h4>
                              <Badge
                                variant='secondary'
                                className={`text-xs ${categoryColors[requirement.category]}`}
                              >
                                {categoryLabels[requirement.category]}
                              </Badge>
                            </div>
                            {requirement.description && (
                              <p className='text-sm text-gray-600 mt-2'>
                                {requirement.description}
                              </p>
                            )}
                            {requirement.metric && (
                              <div className='mt-2 text-xs text-gray-500'>
                                <span className='font-medium'>Métrica:</span>{' '}
                                {requirement.metric}
                                {requirement.target_value && (
                                  <span className='ml-2'>
                                    <span className='font-medium'>Meta:</span>{' '}
                                    {requirement.target_value}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Projeto</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Status
                  </label>
                  <div className='mt-1'>
                    <Badge
                      variant='secondary'
                      className={
                        statusColors[
                          project.status as keyof typeof statusColors
                        ]
                      }
                    >
                      {
                        statusLabels[
                          project.status as keyof typeof statusLabels
                        ]
                      }
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Criado em
                  </label>
                  <p className='mt-1 text-sm'>
                    {formatDate(project.created_at)}
                  </p>
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Última atualização
                  </label>
                  <p className='mt-1 text-sm'>
                    {formatDate(project.updated_at)}
                  </p>
                </div>

                {teamMembers && teamMembers.length > 0 && (
                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      Membros da equipe
                    </label>
                    <p className='mt-1 text-sm'>
                      {teamMembers.length} membro
                      {teamMembers.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {technologies && technologies.length > 0 && (
                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      Tecnologias
                    </label>
                    <p className='mt-1 text-sm'>
                      {technologies.length} tecnologia
                      {technologies.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {objectives && objectives.length > 0 && (
                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      Objetivos
                    </label>
                    <p className='mt-1 text-sm'>
                      {objectives.length} objetivo
                      {objectives.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {functionalRequirements &&
                  functionalRequirements.length > 0 && (
                    <div>
                      <label className='text-sm font-medium text-gray-500'>
                        Requisitos Funcionais
                      </label>
                      <p className='mt-1 text-sm'>
                        {functionalRequirements.length} requisito
                        {functionalRequirements.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}

                {nonFunctionalRequirements &&
                  nonFunctionalRequirements.length > 0 && (
                    <div>
                      <label className='text-sm font-medium text-gray-500'>
                        Requisitos Não Funcionais
                      </label>
                      <p className='mt-1 text-sm'>
                        {nonFunctionalRequirements.length} requisito
                        {nonFunctionalRequirements.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Button asChild className='w-full justify-start'>
                  <Link href={`/editor/${project.id}`}>
                    <Edit className='h-4 w-4 mr-2' />
                    Editar Projeto
                  </Link>
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={handleExportPDF}
                >
                  <Download className='h-4 w-4 mr-2' />
                  Exportar PDF
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={handleShare}
                >
                  <Share2 className='h-4 w-4 mr-2' />
                  Compartilhar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
