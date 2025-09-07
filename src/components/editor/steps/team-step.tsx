'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { teamSchema, type TeamFormData } from '@/lib/validations/project';
import { useProjectStore } from '@/stores/useProjectStore';

interface TeamStepProps {
  onNext: () => void;
  onBack: () => void;
}

const roleOptions = [
  { value: 'front_end_developer', label: 'Desenvolvedor Front-end' },
  { value: 'back_end_developer', label: 'Desenvolvedor Back-end' },
  { value: 'full_stack_developer', label: 'Desenvolvedor Full-stack' },
  { value: 'mobile_developer', label: 'Desenvolvedor Mobile' },
  { value: 'database_administrator', label: 'Administrador de Banco de Dados' },
  { value: 'project_manager', label: 'Gerente de Projeto' },
  { value: 'tech_lead', label: 'Líder Técnico' },
  { value: 'designer', label: 'Designer' },
  { value: 'analyst', label: 'Analista' },
  { value: 'qa', label: 'Analista de Qualidade' },
  { value: 'devops', label: 'Engenheiro DevOps' },
  { value: 'product_owner', label: 'Dono do Produto' },
  { value: 'scrum_master', label: 'Scrum Master' },
  { value: 'stakeholder', label: 'Parte Interessada' },
  { value: 'other', label: 'Outro' },
];

export function TeamStep({ onNext, onBack }: TeamStepProps) {
  const { currentProject: project, updateProject } = useProjectStore();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      members: project?.members || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'members',
  });

  const watchedMembers = watch('members');

  const addTeamMember = () => {
    append({
      name: '',
      email: '',
      role: 'developer',
    });
  };

  const onSubmit = (data: TeamFormData) => {
    // Transform form data to match TeamMember type structure
    const transformedMembers = data.members.map((member, index) => ({
      id: `temp-${index}`, // Temporary ID for form state
      project_id: project?.id || '',
      name: member.name,
      role: member.role,
      email: member.email,
      created_at: new Date().toISOString(),
    }));

    updateProject({
      members: transformedMembers,
    });
    onNext();
  };

  const skipStep = () => {
    updateProject({
      members: [],
    });
    onNext();
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>
          Equipe do Projeto
        </h2>
        <p className='text-gray-600'>
          Adicione os membros da equipe que participarão do projeto. Isso ajuda
          na documentação de responsabilidades.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center'>
                <Users className='h-5 w-5 mr-2' />
                Membros da Equipe
              </CardTitle>
              <CardDescription>
                {fields.length === 0
                  ? 'Nenhum membro adicionado ainda'
                  : `${fields.length} membro${fields.length > 1 ? 's' : ''} adicionado${fields.length > 1 ? 's' : ''}`}
              </CardDescription>
            </div>
            <Button onClick={addTeamMember} size='sm'>
              <Plus className='h-4 w-4 mr-2' />
              Adicionar Membro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {fields.length === 0 ? (
              <div className='text-center py-8'>
                <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Nenhum membro na equipe
                </h3>
                <p className='text-gray-600 mb-4'>
                  Adicione membros da equipe para documentar responsabilidades e
                  contatos.
                </p>
                <Button onClick={addTeamMember} variant='outline'>
                  <Plus className='h-4 w-4 mr-2' />
                  Adicionar Primeiro Membro
                </Button>
              </div>
            ) : (
              <div className='space-y-4'>
                {fields.map((field, index) => (
                  <Card key={field.id} className='p-4'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      <div>
                        <Label htmlFor={`members.${index}.name`}>Nome *</Label>
                        <Input
                          id={`members.${index}.name`}
                          placeholder='Nome completo'
                          {...register(`members.${index}.name`)}
                          className={
                            errors.members?.[index]?.name
                              ? 'border-red-500'
                              : ''
                          }
                        />
                        {errors.members?.[index]?.name && (
                          <p className='text-sm text-red-500 mt-1'>
                            {errors.members[index]?.name?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor={`members.${index}.email`}>Email</Label>
                        <Input
                          id={`members.${index}.email`}
                          type='email'
                          placeholder='email@exemplo.com'
                          {...register(`members.${index}.email`)}
                          className={
                            errors.members?.[index]?.email
                              ? 'border-red-500'
                              : ''
                          }
                        />
                        {errors.members?.[index]?.email && (
                          <p className='text-sm text-red-500 mt-1'>
                            {errors.members[index]?.email?.message}
                          </p>
                        )}
                      </div>

                      <div className='flex items-end space-x-2'>
                        <div className='flex-1'>
                          <Label htmlFor={`members.${index}.role`}>
                            Função *
                          </Label>
                          <Select
                            value={watchedMembers[index]?.role}
                            onValueChange={value =>
                              setValue(`members.${index}.role`, value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Selecione a função' />
                            </SelectTrigger>
                            <SelectContent>
                              {roleOptions.map(option => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.members?.[index]?.role && (
                            <p className='text-sm text-red-500 mt-1'>
                              {errors.members[index]?.role?.message}
                            </p>
                          )}
                        </div>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => remove(index)}
                          className='text-red-600 hover:text-red-700'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className='flex justify-between pt-6'>
              <Button type='button' variant='outline' onClick={onBack}>
                Voltar
              </Button>
              <div className='flex space-x-2'>
                <Button type='button' variant='ghost' onClick={skipStep}>
                  Pular Esta Etapa
                </Button>
                <Button type='submit'>Próximo: Tecnologias</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Team Summary */}
      {fields.length > 0 && (
        <Card className='bg-gray-50'>
          <CardHeader>
            <CardTitle className='text-lg'>Resumo da Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {watchedMembers.map(
                (member, index) =>
                  member.name && (
                    <Badge
                      key={index}
                      variant='secondary'
                      className='px-3 py-1'
                    >
                      {member.name} -{' '}
                      {roleOptions.find(r => r.value === member.role)?.label}
                    </Badge>
                  )
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
                Por que documentar a equipe?
              </h4>
              <ul className='text-sm text-blue-800 space-y-1'>
                <li>• Facilita o contato entre membros</li>
                <li>• Define responsabilidades claras</li>
                <li>• Ajuda novos membros a se orientarem</li>
                <li>• Importante para auditoria e compliance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
