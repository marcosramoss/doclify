'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Calendar,
  Users,
  Trash2,
  Download,
  Edit,
  Eye,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AppLayout } from '@/components/layout/app-layout';
import { useProjects } from '@/hooks/useProjects';
import { formatDate } from '@/utils/format';
import { exportToPDF, generateDocumentHTML } from '@/utils/export';
import { supabase } from '@/lib/supabase/client';
import {
  Project,
  TeamMember,
  Technology,
  Objective,
  Milestone,
  FunctionalRequirement,
  NonFunctionalRequirement,
  Audience,
  Stakeholder,
} from '@/types';

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

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const { projects, isLoading, error, deleteProject, isDeleting } =
    useProjects();

  const filteredProjects =
    projects?.filter(
      project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const stats = {
    total: projects?.length || 0,
    draft: projects?.filter(p => p.status === 'draft').length || 0,
    in_progress: projects?.filter(p => p.status === 'in_progress').length || 0,
    completed: projects?.filter(p => p.status === 'completed').length || 0,
  };

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return;

    try {
      await deleteProject(deleteProjectId);
      toast.success('Projeto excluído com sucesso!');
      setDeleteProjectId(null);
    } catch (error) {
      toast.error('Erro ao excluir projeto');
    }
  };

  const handleExportPDF = async (project: Project) => {
    try {
      console.log('Iniciando exportação de PDF para projeto:', project.title);

      // Load all related data for the project using Supabase directly
      console.log('Carregando dados relacionados do projeto...');

      // Load payment info separately to handle potential errors
      let paymentData = null;
      try {
        const { data } = await supabase
          .from('payment')
          .select('*')
          .eq('project_id', project.id)
          .single();
        paymentData = data;
      } catch (error) {
        console.log('No payment info found for project:', project.id);
      }

      const [
        teamData,
        techData,
        objectivesData,
        milestonesData,
        functionalReqData,
        nonFunctionalReqData,
        audiencesData,
        stakeholdersData,
      ] = await Promise.all([
        // Team members
        supabase
          .from('team')
          .select('*')
          .eq('project_id', project.id)
          .then(({ data }) => data || []),
        // Technologies
        supabase
          .from('technologies')
          .select('*')
          .eq('project_id', project.id)
          .then(({ data }) => data || []),
        // Objectives
        supabase
          .from('objectives')
          .select('*')
          .eq('project_id', project.id)
          .then(({ data }) => data || []),
        // Milestones
        supabase
          .from('milestones')
          .select('*')
          .eq('project_id', project.id)
          .then(({ data }) => data || []),
        // Functional requirements
        supabase
          .from('requirements_functional')
          .select('*')
          .eq('project_id', project.id)
          .then(({ data }) => data || []),
        // Non-functional requirements
        supabase
          .from('requirements_non_functional')
          .select('*')
          .eq('project_id', project.id)
          .then(({ data }) => data || []),
        // Audiences
        supabase
          .from('audiences')
          .select('*')
          .eq('project_id', project.id)
          .then(({ data }) => data || []),
        // Stakeholders
        supabase
          .from('stakeholders')
          .select('*')
          .eq('project_id', project.id)
          .then(({ data }) => data || []),
      ]);

      console.log('Dados carregados:', {
        team: teamData?.length || 0,
        technologies: techData?.length || 0,
        objectives: objectivesData?.length || 0,
        milestones: milestonesData?.length || 0,
        functionalReq: functionalReqData?.length || 0,
        nonFunctionalReq: nonFunctionalReqData?.length || 0,
        audiences: audiencesData?.length || 0,
        payment: paymentData ? 'sim' : 'não',
        stakeholders: stakeholdersData?.length || 0,
      });

      // Create extended project with all related data
      const extendedProject = {
        ...project,
        members: teamData,
        technologies: techData,
        objectives: objectivesData,
        milestones: milestonesData,
        requirements_functional: functionalReqData,
        requirements_non_functional: nonFunctionalReqData,
        audiences: audiencesData,
        payment_info: paymentData,
        stakeholders: stakeholdersData,
      };

      console.log('Dados carregados:', extendedProject);

      // Create a temporary element with the project content for PDF export
      const tempDiv = document.createElement('div');
      tempDiv.id = 'temp-document-content';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '20px';

      // Generate HTML content using the updated generateDocumentHTML function
      tempDiv.innerHTML = generateDocumentHTML({
        ...extendedProject,
        members: extendedProject.members,
        technologies: extendedProject.technologies,
        audiences: extendedProject.audiences,
        objectives: extendedProject.objectives,
        milestones: extendedProject.milestones,
        requirements_functional: extendedProject.requirements_functional,
        requirements_non_functional:
          extendedProject.requirements_non_functional,
        payment: extendedProject.payment_info,
        stakeholders: extendedProject.stakeholders,
      });

      console.log('Elemento temporário criado, adicionando ao DOM');
      document.body.appendChild(tempDiv);

      console.log('Chamando função exportToPDF...');
      const result = await exportToPDF(project, 'temp-document-content');
      console.log('Resultado da exportação:', result);

      // Clean up
      document.body.removeChild(tempDiv);
      console.log('Elemento temporário removido');

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

  if (isLoading) {
    return (
      <AppLayout
        title='Dashboard'
        description='Gerencie seus projetos de documentação'
      >
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4' />
            <p className='text-gray-600'>Carregando projetos...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout
        title='Dashboard'
        description='Gerencie seus projetos de documentação'
      >
        <div className='text-center py-12'>
          <p className='text-red-600 mb-4'>Erro ao carregar projetos</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title='Dashboard'
      description='Gerencie seus projetos de documentação'
    >
      <div className='space-y-6'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total de Projetos
              </CardTitle>
              <FileText className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Rascunhos</CardTitle>
              <FileText className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.draft}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Em Progresso
              </CardTitle>
              <FileText className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.in_progress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Concluídos</CardTitle>
              <FileText className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div className='flex flex-1 items-center space-x-2'>
            <div className='relative flex-1 max-w-sm'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                placeholder='Buscar projetos...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <Button variant='outline' size='sm'>
              <Filter className='h-4 w-4 mr-2' />
              Filtros
            </Button>
          </div>

          <Button asChild>
            <Link href='/editor/new'>
              <Plus className='h-4 w-4 mr-2' />
              Novo Projeto
            </Link>
          </Button>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className='text-center py-12'>
            <FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              {searchTerm
                ? 'Nenhum projeto encontrado'
                : 'Nenhum projeto ainda'}
            </h3>
            <p className='text-gray-600 mb-6'>
              {searchTerm
                ? 'Tente ajustar os termos de busca'
                : 'Comece criando seu primeiro projeto de documentação'}
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link href='/editor/new'>
                  <Plus className='h-4 w-4 mr-2' />
                  Criar Primeiro Projeto
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredProjects.map(project => (
              <Card
                key={project.id}
                className='hover:shadow-md transition-shadow'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1 flex-1'>
                      <CardTitle className='text-lg line-clamp-1'>
                        <Link
                          href={`/editor/${project.id}`}
                          className='hover:text-blue-600 transition-colors'
                        >
                          {project.title}
                        </Link>
                      </CardTitle>
                      {project.description && (
                        <CardDescription className='line-clamp-2'>
                          {project.description}
                        </CardDescription>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem asChild>
                          <Link href={`/editor/${project.id}`}>
                            <Edit className='h-4 w-4 mr-2' />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.id}`}>
                            <Eye className='h-4 w-4 mr-2' />
                            Ver Detalhes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExportPDF(project)}
                        >
                          <Download className='h-4 w-4 mr-2' />
                          Exportar PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className='text-red-600 focus:text-red-600'
                          onClick={() => setDeleteProjectId(project.id)}
                        >
                          <Trash2 className='h-4 w-4 mr-2' />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className='pt-0'>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
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
                      <span className='text-sm text-gray-500'>
                        {formatDistanceToNow(new Date(project.updated_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>

                    <div className='flex items-center justify-between text-sm text-gray-500'>
                      <div className='flex items-center'>
                        <Calendar className='h-4 w-4 mr-1' />
                        {formatDate(project.created_at)}
                      </div>
                      {project.members && project.members.length > 0 && (
                        <div className='flex items-center text-sm text-gray-600'>
                          <Users className='h-4 w-4 mr-1' />
                          {project.members.length} membro
                          {project.members.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteProjectId}
        onOpenChange={() => setDeleteProjectId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Projeto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este projeto? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className='bg-red-600 hover:bg-red-700'
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
