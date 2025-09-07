'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Users,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

export default function ProjectsPage() {
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

  if (isLoading) {
    return (
      <AppLayout
        title='Projetos'
        description='Gerencie todos os seus projetos de documentação'
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
        title='Projetos'
        description='Gerencie todos os seus projetos de documentação'
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
    <AppLayout>
      <div className='min-h-screen bg-gray-50'>
        {/* Header */}
        <div className='sticky top-0 z-10 bg-white border-b'>
          <div className='max-w-7xl mx-auto'>
            <div className='flex items-center justify-between h-16 px-4'>
              <div className='flex items-center space-x-4'>
                <div className='flex items-center space-x-2'>
                  <FileText className='h-5 w-5 text-blue-600' />
                  <h1 className='text-lg font-semibold text-gray-900'>
                    Projetos
                  </h1>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <div className='text-sm text-gray-600'>
                  Gerencie todos os seus projetos de documentação
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='max-w-7xl mx-auto py-8 px-4'>
          <div className='space-y-6'>
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

            {/* Projects Table */}
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
              <div className='bg-white rounded-lg border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Equipe</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Atualizado</TableHead>
                      <TableHead className='w-[50px]'></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map(project => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div className='space-y-1'>
                            <Link
                              href={`/projects/${project.id}`}
                              className='font-medium hover:text-blue-600 transition-colors'
                            >
                              {project.title}
                            </Link>
                            {project.description && (
                              <p className='text-sm text-gray-500 line-clamp-1'>
                                {project.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          {project.members && project.members.length > 0 ? (
                            <div className='flex items-center text-sm text-gray-600'>
                              <Users className='h-4 w-4 mr-1' />
                              {project.members.length} membro
                              {project.members.length > 1 ? 's' : ''}
                            </div>
                          ) : (
                            <span className='text-gray-400'>-</span>
                          )}
                        </TableCell>
                        <TableCell className='text-sm text-gray-500'>
                          {formatDate(project.created_at)}
                        </TableCell>
                        <TableCell className='text-sm text-gray-500'>
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
                                <Link href={`/projects/${project.id}`}>
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

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={!!deleteProjectId}
            onOpenChange={() => setDeleteProjectId(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Projeto</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este projeto? Esta ação não
                  pode ser desfeita.
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
      </div>
    </AppLayout>
  );
}
