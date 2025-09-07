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
  Eye,
  Edit,
  Trash2,
  Grid3X3,
  List,
  Download,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppLayout } from '@/components/layout/app-layout';
import { useProjects } from '@/hooks/useProjects';
import { formatDate } from '@/utils/format';
import { exportToPDF, generateDocumentHTML } from '@/utils/export';
import { supabase } from '@/lib/supabase/client';
import { Project } from '@/types';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
    } catch {
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
      } catch {
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
      <div className='min-h-screen bg-gray-50'>
        {/* Header */}
        <div className='sticky top-0 z-10 bg-white border-b'>
          <div className='max-w-7xl '>
            <div className='flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4'>
              <div className='flex items-center space-x-2 sm:space-x-4'>
                <div className='flex items-center space-x-1 sm:space-x-2'>
                  <FileText className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600' />
                  <h1 className='text-base sm:text-lg font-semibold text-gray-900'>
                    Dashboard
                  </h1>
                </div>
              </div>

              <div className='hidden sm:flex items-center space-x-4'></div>
            </div>
          </div>
        </div>

        <div className='flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]'>
          {/* Sidebar */}
          <div className='w-full lg:w-80 bg-white border-b lg:border-r lg:border-b-0 border-gray-200 flex flex-col'>
            <div className='p-4 sm:p-6 border-b border-gray-200'>
              <h2 className='text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4'>
                Estatísticas
              </h2>

              {/* Stats Cards */}
              <div className='grid grid-cols-2 lg:grid-cols-1 gap-2 lg:space-y-2 lg:grid-cols-none'>
                <Card className='p-2 sm:p-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-xs font-medium text-gray-600'>
                        Total de Projetos
                      </div>
                      <div className='text-base sm:text-lg font-bold'>
                        {stats.total}
                      </div>
                    </div>
                    <FileText className='h-3 w-3 text-muted-foreground flex-shrink-0' />
                  </div>
                </Card>

                <Card className='p-2 sm:p-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-xs font-medium text-gray-600'>
                        Rascunhos
                      </div>
                      <div className='text-base sm:text-lg font-bold'>
                        {stats.draft}
                      </div>
                    </div>
                    <FileText className='h-3 w-3 text-muted-foreground flex-shrink-0' />
                  </div>
                </Card>

                <Card className='p-2 sm:p-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-xs font-medium text-gray-600'>
                        Em Progresso
                      </div>
                      <div className='text-base sm:text-lg font-bold'>
                        {stats.in_progress}
                      </div>
                    </div>
                    <FileText className='h-3 w-3 text-muted-foreground flex-shrink-0' />
                  </div>
                </Card>

                <Card className='p-2 sm:p-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-xs font-medium text-gray-600'>
                        Concluídos
                      </div>
                      <div className='text-base sm:text-lg font-bold'>
                        {stats.completed}
                      </div>
                    </div>
                    <FileText className='h-3 w-3 text-muted-foreground flex-shrink-0' />
                  </div>
                </Card>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-4 sm:p-6'>
              <h3 className='text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4'>
                Filtros e Busca
              </h3>

              {/* Search */}
              <div className='space-y-3 sm:space-y-4'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                  <Input
                    placeholder='Buscar projetos...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>

                <Button variant='outline' size='sm' className='w-full'>
                  <Filter className='h-4 w-4 mr-2' />
                  Filtros Avançados
                </Button>

                <Button asChild className='w-full text-xs sm:text-sm'>
                  <Link href='/editor/new'>
                    <Plus className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
                    Novo Projeto
                  </Link>
                </Button>

                <div className='mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200'>
                  <h4 className='text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3'>
                    Visualização
                  </h4>
                  <div className='flex gap-2'>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setViewMode('grid')}
                      className='flex-1 text-xs sm:text-sm'
                    >
                      <Grid3X3 className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
                      <span className='hidden sm:inline'>Grid</span>
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setViewMode('list')}
                      className='flex-1 text-xs sm:text-sm'
                    >
                      <List className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
                      <span className='hidden sm:inline'>Lista</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-1 overflow-y-auto'>
            <div className='p-4 sm:p-6'>
              <div className='mb-4 sm:mb-6'>
                <h1 className='text-xl sm:text-2xl font-bold text-gray-900'>
                  Meus Projetos
                </h1>
                <p className='text-gray-600 mt-1'>
                  Gerencie e acompanhe seus projetos de documentação
                </p>
              </div>

              {/* Projects Content */}
              {filteredProjects.length === 0 ? (
                <div className='text-center py-8 sm:py-12'>
                  <FileText className='h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4' />
                  <h3 className='text-base sm:text-lg font-medium text-gray-900 mb-2'>
                    {searchTerm
                      ? 'Nenhum projeto encontrado'
                      : 'Nenhum projeto ainda'}
                  </h3>
                  <p className='text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4'>
                    {searchTerm
                      ? 'Tente ajustar os termos de busca'
                      : 'Comece criando seu primeiro projeto de documentação'}
                  </p>
                  {!searchTerm && (
                    <Button asChild size='sm' className='text-sm'>
                      <Link href='/editor/new'>
                        <Plus className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
                        Criar Primeiro Projeto
                      </Link>
                    </Button>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl'>
                  {filteredProjects.map(project => (
                    <Card
                      key={project.id}
                      className='hover:shadow-md transition-shadow'
                    >
                      <CardHeader className='pb-2 sm:pb-3 p-3 sm:p-6'>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='space-y-1 flex-1 min-w-0'>
                            <CardTitle className='text-sm sm:text-base lg:text-lg line-clamp-1'>
                              <Link
                                href={`/editor/${project.id}`}
                                className='hover:text-blue-600 transition-colors'
                              >
                                {project.title}
                              </Link>
                            </CardTitle>
                            {project.description && (
                              <CardDescription className='line-clamp-2 text-xs sm:text-sm'>
                                {project.description}
                              </CardDescription>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 p-0'
                              >
                                <MoreHorizontal className='h-3 w-3 sm:h-4 sm:w-4' />
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
                                <Link href={`/editor/${project.id}`}>
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

                      <CardContent className='pt-0 p-3 sm:p-6'>
                        <div className='space-y-2 sm:space-y-3'>
                          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
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
                            <span className='text-xs sm:text-sm text-gray-500'>
                              {formatDistanceToNow(
                                new Date(project.updated_at),
                                {
                                  addSuffix: true,
                                  locale: ptBR,
                                }
                              )}
                            </span>
                          </div>

                          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-500'>
                            <div className='flex items-center'>
                              <Calendar className='h-3 w-3 sm:h-4 sm:w-4 mr-1' />
                              {formatDate(project.created_at)}
                            </div>
                            {project.members && project.members.length > 0 && (
                              <div className='flex items-center text-xs sm:text-sm text-gray-600'>
                                <Users className='h-3 w-3 sm:h-4 sm:w-4 mr-1' />
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
              ) : (
                <div className='bg-white rounded-lg border overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='text-xs sm:text-sm'>
                          Nome
                        </TableHead>
                        <TableHead className='text-xs sm:text-sm hidden sm:table-cell'>
                          Status
                        </TableHead>
                        <TableHead className='text-xs sm:text-sm hidden md:table-cell'>
                          Equipe
                        </TableHead>
                        <TableHead className='text-xs sm:text-sm hidden lg:table-cell'>
                          Criado em
                        </TableHead>
                        <TableHead className='text-xs sm:text-sm'>
                          Atualizado
                        </TableHead>
                        <TableHead className='w-[40px] sm:w-[50px]'></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map(project => (
                        <TableRow key={project.id}>
                          <TableCell className='min-w-[200px]'>
                            <div className='space-y-1'>
                              <Link
                                href={`/editor/${project.id}`}
                                className='text-sm sm:text-base font-medium hover:text-blue-600 transition-colors block'
                              >
                                {project.title}
                              </Link>
                              {project.description && (
                                <p className='text-xs sm:text-sm text-gray-500 line-clamp-1'>
                                  {project.description}
                                </p>
                              )}
                              {/* Mobile status badge */}
                              <div className='sm:hidden mt-1'>
                                <Badge
                                  variant='secondary'
                                  className={`text-xs ${
                                    statusColors[
                                      project.status as keyof typeof statusColors
                                    ]
                                  }`}
                                >
                                  {
                                    statusLabels[
                                      project.status as keyof typeof statusLabels
                                    ]
                                  }
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='hidden sm:table-cell'>
                            <Badge
                              variant='secondary'
                              className={`text-xs sm:text-sm ${
                                statusColors[
                                  project.status as keyof typeof statusColors
                                ]
                              }`}
                            >
                              {
                                statusLabels[
                                  project.status as keyof typeof statusLabels
                                ]
                              }
                            </Badge>
                          </TableCell>
                          <TableCell className='hidden md:table-cell'>
                            {project.members && project.members.length > 0 ? (
                              <div className='flex items-center text-xs sm:text-sm text-gray-600'>
                                <Users className='h-3 w-3 sm:h-4 sm:w-4 mr-1' />
                                {project.members.length} membro
                                {project.members.length > 1 ? 's' : ''}
                              </div>
                            ) : (
                              <span className='text-gray-400 text-xs sm:text-sm'>
                                -
                              </span>
                            )}
                          </TableCell>
                          <TableCell className='hidden lg:table-cell text-xs sm:text-sm text-gray-500'>
                            {formatDate(project.created_at)}
                          </TableCell>
                          <TableCell className='text-xs sm:text-sm text-gray-500'>
                            {formatDistanceToNow(new Date(project.updated_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='sm'>
                                  <MoreHorizontal className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem asChild>
                                  <Link href={`/editor/${project.id}`}>
                                    <Eye className='h-4 w-4 mr-2' />
                                    Ver Detalhes
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/editor/${project.id}`}>
                                    <Edit className='h-4 w-4 mr-2' />
                                    Editar
                                  </Link>
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
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
      </div>
    </AppLayout>
  );
}
