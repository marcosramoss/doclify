'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Download, Share2, Calendar, Users, Tag, Target } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AppLayout } from '@/components/layout/app-layout';
import { useProject } from '@/hooks/useProjects';
import { formatDate } from '@/utils/format';
import { exportToPDF } from '@/utils/export';

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
        title: project.name,
        text: project.description || 'Projeto Doclify',
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando projeto...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !project) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Projeto não encontrado</p>
          <Button onClick={() => router.back()}>Voltar</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              {project.description && (
                <p className="text-gray-600 mt-1">{project.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button asChild>
              <Link href={`/editor/${project.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
          </div>
        </div>

        {/* Status and Meta */}
        <div className="flex items-center space-x-4">
          <Badge 
            variant="secondary" 
            className={statusColors[project.status as keyof typeof statusColors]}
          >
            {statusLabels[project.status as keyof typeof statusLabels]}
          </Badge>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            Criado em {formatDate(project.created_at)}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            Atualizado em {formatDate(project.updated_at)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Visão Geral do Projeto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.description && (
                  <div>
                    <h4 className="font-medium mb-2">Descrição</h4>
                    <p className="text-gray-600">{project.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team */}
            {project.team && project.team.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Equipe ({project.team.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.team.map((member, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Technologies */}
            {project.technologies && project.technologies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Tecnologias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <Badge key={index} variant="outline">
                        {tech.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Objectives */}
            {project.objectives && project.objectives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Objetivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.objectives.map((objective, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-1">{objective.title}</h4>
                        {objective.description && (
                          <p className="text-sm text-gray-600">{objective.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Projeto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge 
                      variant="secondary" 
                      className={statusColors[project.status as keyof typeof statusColors]}
                    >
                      {statusLabels[project.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Criado em</label>
                  <p className="mt-1 text-sm">{formatDate(project.created_at)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Última atualização</label>
                  <p className="mt-1 text-sm">{formatDate(project.updated_at)}</p>
                </div>
                
                {project.team && project.team.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Membros da equipe</label>
                    <p className="mt-1 text-sm">{project.team.length} membro{project.team.length > 1 ? 's' : ''}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full justify-start">
                  <Link href={`/editor/${project.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Projeto
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
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