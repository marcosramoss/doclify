'use client';

import { useParams } from 'next/navigation';
import { useProject } from '@/hooks/useProjects';
import { AppLayout } from '@/components/layout/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, FileText, Download, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function ProjectEditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { data: project, isLoading, error } = useProject(projectId);

  if (isLoading) {
    return (
      <AppLayout title='Carregando...' description='Carregando projeto'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !project) {
    return (
      <AppLayout
        title='Projeto não encontrado'
        description='O projeto solicitado não foi encontrado'
      >
        <div className='max-w-2xl mx-auto text-center space-y-4'>
          <div className='text-6xl'>🔍</div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Projeto não encontrado
          </h1>
          <p className='text-gray-600'>
            O projeto que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Voltar ao Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleEdit = () => {
    toast.info('Funcionalidade de edição em desenvolvimento');
  };

  const handleExport = () => {
    toast.success('Exportação iniciada! O download começará em breve.');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado para a área de transferência!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'in_progress':
        return 'Em Progresso';
      case 'draft':
        return 'Rascunho';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <AppLayout title={project.title} description='Editor de projeto'>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Voltar ao Dashboard
            </Button>
            <div className='flex items-center space-x-2'>
              <FileText className='h-5 w-5 text-blue-600' />
              <h1 className='text-xl font-semibold'>{project.title}</h1>
              <Badge className={getStatusColor(project.status)}>
                {getStatusLabel(project.status)}
              </Badge>
            </div>
          </div>

          <div className='flex space-x-2'>
            <Button variant='outline' onClick={handleEdit}>
              <Edit className='h-4 w-4 mr-2' />
              Editar
            </Button>
            <Button variant='outline' onClick={handleExport}>
              <Download className='h-4 w-4 mr-2' />
              Exportar
            </Button>
            <Button variant='outline' onClick={handleShare}>
              <Share2 className='h-4 w-4 mr-2' />
              Compartilhar
            </Button>
          </div>
        </div>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Projeto</CardTitle>
            <CardDescription>
              Informações básicas e configurações do projeto
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Título
                </label>
                <p className='text-gray-900'>{project.title}</p>
              </div>

              {project.company_name && (
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Empresa
                  </label>
                  <p className='text-gray-900'>{project.company_name}</p>
                </div>
              )}

              {project.project_type && (
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Tipo de Projeto
                  </label>
                  <p className='text-gray-900'>{project.project_type}</p>
                </div>
              )}

              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Status
                </label>
                <div className='mt-1'>
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>
              </div>
            </div>

            {project.description && (
              <>
                <Separator />
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Descrição
                  </label>
                  <p className='text-gray-900 mt-1'>{project.description}</p>
                </div>
              </>
            )}

            <Separator />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600'>
              <div>
                <label className='font-medium'>Criado em:</label>
                <p>
                  {new Date(project.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <label className='font-medium'>Última atualização:</label>
                <p>
                  {new Date(project.updated_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Features */}
        <Card className='bg-blue-50 border-blue-200'>
          <CardContent className='pt-6'>
            <div className='flex items-start space-x-3'>
              <div className='flex-shrink-0'>
                <div className='flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full'>
                  <span className='text-blue-600 text-sm font-medium'>🚀</span>
                </div>
              </div>
              <div>
                <h4 className='text-sm font-medium text-blue-900 mb-1'>
                  Funcionalidades em desenvolvimento:
                </h4>
                <ul className='text-sm text-blue-800 space-y-1'>
                  <li>• Editor completo de documentação</li>
                  <li>• Gerenciamento de equipe e tecnologias</li>
                  <li>• Exportação para PDF e DOCX</li>
                  <li>• Colaboração em tempo real</li>
                  <li>• Templates personalizáveis</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
