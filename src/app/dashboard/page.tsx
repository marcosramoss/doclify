'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, MoreHorizontal, FileText, Calendar, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: projects, isLoading, error } = useProjects();

  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = {
    total: projects?.length || 0,
    draft: projects?.filter(p => p.status === 'draft').length || 0,
    in_progress: projects?.filter(p => p.status === 'in_progress').length || 0,
    completed: projects?.filter(p => p.status === 'completed').length || 0,
  };

  if (isLoading) {
    return (
      <AppLayout title="Dashboard" description="Gerencie seus projetos de documentação">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando projetos...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Dashboard" description="Gerencie seus projetos de documentação">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Erro ao carregar projetos</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard" description="Gerencie seus projetos de documentação">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draft}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.in_progress}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
          
          <Button asChild>
            <Link href="/editor/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Link>
          </Button>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum projeto encontrado' : 'Nenhum projeto ainda'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Tente ajustar os termos de busca' 
                : 'Comece criando seu primeiro projeto de documentação'
              }
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link href="/editor/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Projeto
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg line-clamp-1">
                        <Link 
                          href={`/editor/${project.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {project.name}
                        </Link>
                      </CardTitle>
                      {project.description && (
                        <CardDescription className="line-clamp-2">
                          {project.description}
                        </CardDescription>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/editor/${project.id}`}>Editar</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.id}`}>Ver Detalhes</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="secondary" 
                        className={statusColors[project.status as keyof typeof statusColors]}
                      >
                        {statusLabels[project.status as keyof typeof statusLabels]}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(project.updated_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(project.created_at)}
                      </div>
                      {project.team && project.team.length > 0 && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {project.team.length} membro{project.team.length > 1 ? 's' : ''}
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
    </AppLayout>
  );
}