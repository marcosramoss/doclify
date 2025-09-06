'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { projectSchema, type ProjectFormData } from '@/lib/validations/project';
import { useProjectStore } from '@/stores/useProjectStore';
import type { Project } from '@/types';

interface ProjectInfoStepProps {
  onNext: () => void;
  onBack?: () => void;
}

const statusOptions = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'in_progress', label: 'Em Progresso' },
  { value: 'review', label: 'Em Revisão' },
  { value: 'completed', label: 'Concluído' },
];

export function ProjectInfoStep({ onNext, onBack }: ProjectInfoStepProps) {
  const { currentProject: project, setCurrentProject: setProject } =
    useProjectStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.title || '',
      description: project?.description || '',
      status: project?.status || 'draft',
    },
  });

  const watchedStatus = watch('status');

  const onSubmit = (data: ProjectFormData) => {
    console.log('ProjectInfoStep - onSubmit called with data:', data);
    console.log('ProjectInfoStep - Current project:', project);
    setProject({
      ...project,
      title: data.name, // Map name to title
      description: data.description,
      status: data.status || 'draft',
    } as Project);
    console.log('ProjectInfoStep - Calling onNext()');
    onNext();
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>
          Informações do Projeto
        </h2>
        <p className='text-gray-600'>
          Vamos começar com as informações básicas do seu projeto de
          documentação.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes Básicos</CardTitle>
          <CardDescription>
            Forneça as informações essenciais sobre o projeto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit, errors => {
              console.log('ProjectInfoStep - Validation errors:', errors);
            })}
            className='space-y-6'
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='md:col-span-2'>
                <Label htmlFor='name'>Nome do Projeto *</Label>
                <Input
                  id='name'
                  placeholder='Ex: Sistema de Gestão de Vendas'
                  {...register('name')}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className='text-sm text-red-500 mt-1'>
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className='md:col-span-2'>
                <Label htmlFor='description'>Descrição</Label>
                <Textarea
                  id='description'
                  placeholder='Descreva brevemente o objetivo e escopo do projeto...'
                  rows={4}
                  {...register('description')}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className='text-sm text-red-500 mt-1'>
                    {errors.description.message}
                  </p>
                )}
                <p className='text-sm text-gray-500 mt-1'>
                  Uma boa descrição ajuda a contextualizar o projeto para todos
                  os envolvidos.
                </p>
              </div>

              <div>
                <Label htmlFor='status'>Status do Projeto</Label>
                <Select
                  value={watchedStatus}
                  onValueChange={value =>
                    setValue(
                      'status',
                      value as 'draft' | 'in_progress' | 'completed'
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione o status' />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className='text-sm text-red-500 mt-1'>
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>

            <div className='flex justify-between pt-6'>
              <div>
                {onBack && (
                  <Button type='button' variant='outline' onClick={onBack}>
                    Voltar
                  </Button>
                )}
              </div>
              <Button type='submit'>Próximo: Equipe</Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
                Dicas para um bom nome de projeto
              </h4>
              <ul className='text-sm text-blue-800 space-y-1'>
                <li>• Use um nome claro e descritivo</li>
                <li>• Evite abreviações muito técnicas</li>
                <li>• Considere o público que lerá a documentação</li>
                <li>• Mantenha entre 3-8 palavras quando possível</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
