'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Code, Database, Server, Smartphone, Globe, Wrench } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { techStackSchema, type TechStackFormData } from '@/lib/validations/project';
import { useProjectStore } from '@/stores/useProjectStore';

interface TechStepProps {
  onNext: () => void;
  onBack: () => void;
}

const categoryIcons = {
  frontend: Globe,
  backend: Server,
  database: Database,
  mobile: Smartphone,
  devops: Wrench,
  other: Code,
};

const categoryLabels = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Banco de Dados',
  mobile: 'Mobile',
  devops: 'DevOps/Infraestrutura',
  other: 'Outros',
};

const commonTechnologies = {
  frontend: [
    'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte',
    'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS',
    'Bootstrap', 'Sass', 'Less', 'Webpack', 'Vite'
  ],
  backend: [
    'Node.js', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go',
    'Express.js', 'FastAPI', 'Spring Boot', 'ASP.NET', 'Laravel',
    'Ruby on Rails', 'Django', 'Flask'
  ],
  database: [
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite',
    'Oracle', 'SQL Server', 'Cassandra', 'DynamoDB', 'Firebase',
    'Supabase', 'Prisma', 'TypeORM'
  ],
  mobile: [
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'Xamarin',
    'Ionic', 'Cordova', 'Unity'
  ],
  devops: [
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud',
    'Jenkins', 'GitHub Actions', 'GitLab CI', 'Terraform',
    'Ansible', 'Nginx', 'Apache'
  ],
  other: [
    'Git', 'GitHub', 'GitLab', 'Jira', 'Confluence', 'Slack',
    'Figma', 'Adobe XD', 'Postman', 'Swagger'
  ]
};

export function TechStep({ onNext, onBack }: TechStepProps) {
  const { project, setProject } = useProjectStore();
  const [activeTab, setActiveTab] = useState('frontend');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TechStackFormData>({
    resolver: zodResolver(techStackSchema),
    defaultValues: {
      technologies: project?.technologies || [],
      architecture: project?.architecture || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'technologies',
  });

  const watchedTechnologies = watch('technologies');

  const addTechnology = (category: string, name?: string) => {
    append({
      name: name || '',
      category: category as any,
      version: '',
      description: '',
    });
  };

  const addCommonTech = (category: string, techName: string) => {
    const exists = watchedTechnologies.some(tech => 
      tech.name.toLowerCase() === techName.toLowerCase() && tech.category === category
    );
    
    if (!exists) {
      append({
        name: techName,
        category: category as any,
        version: '',
        description: '',
      });
    }
  };

  const onSubmit = (data: TechStackFormData) => {
    setProject({
      ...project,
      technologies: data.technologies,
      architecture: data.architecture,
    });
    onNext();
  };

  const skipStep = () => {
    setProject({
      ...project,
      technologies: [],
      architecture: '',
    });
    onNext();
  };

  const getTechsByCategory = (category: string) => {
    return watchedTechnologies.filter(tech => tech.category === category);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Stack Tecnológico
        </h2>
        <p className="text-gray-600">
          Documente as tecnologias, frameworks e ferramentas utilizadas no projeto.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            {Object.entries(categoryLabels).map(([key, label]) => {
              const Icon = categoryIcons[key as keyof typeof categoryIcons];
              const count = getTechsByCategory(key).length;
              return (
                <TabsTrigger key={key} value={key} className="flex items-center space-x-1">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(categoryLabels).map(([category, label]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            const categoryTechs = getTechsByCategory(category);
            const commonTechs = commonTechnologies[category as keyof typeof commonTechnologies];

            return (
              <TabsContent key={category} value={category} className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Icon className="h-5 w-5 mr-2" />
                          {label}
                        </CardTitle>
                        <CardDescription>
                          {categoryTechs.length === 0 
                            ? `Nenhuma tecnologia de ${label.toLowerCase()} adicionada`
                            : `${categoryTechs.length} tecnologia${categoryTechs.length > 1 ? 's' : ''} adicionada${categoryTechs.length > 1 ? 's' : ''}`
                          }
                        </CardDescription>
                      </div>
                      <Button 
                        type="button" 
                        onClick={() => addTechnology(category)} 
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Common Technologies */}
                    {commonTechs.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Tecnologias Comuns:
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {commonTechs.map((tech) => {
                            const exists = watchedTechnologies.some(t => 
                              t.name.toLowerCase() === tech.toLowerCase() && t.category === category
                            );
                            return (
                              <Button
                                key={tech}
                                type="button"
                                variant={exists ? "default" : "outline"}
                                size="sm"
                                onClick={() => addCommonTech(category, tech)}
                                disabled={exists}
                                className="h-8 text-xs"
                              >
                                {exists && <span className="mr-1">✓</span>}
                                {tech}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Added Technologies */}
                    <div className="space-y-3">
                      {fields.map((field, index) => {
                        if (watchedTechnologies[index]?.category !== category) return null;
                        
                        return (
                          <Card key={field.id} className="p-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`technologies.${index}.name`}>Nome *</Label>
                                <Input
                                  id={`technologies.${index}.name`}
                                  placeholder="Ex: React, Node.js, PostgreSQL"
                                  {...register(`technologies.${index}.name`)}
                                  className={errors.technologies?.[index]?.name ? 'border-red-500' : ''}
                                />
                                {errors.technologies?.[index]?.name && (
                                  <p className="text-sm text-red-500 mt-1">
                                    {errors.technologies[index]?.name?.message}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-end space-x-2">
                                <div className="flex-1">
                                  <Label htmlFor={`technologies.${index}.version`}>Versão</Label>
                                  <Input
                                    id={`technologies.${index}.version`}
                                    placeholder="Ex: 18.2.0, ^14.0.0"
                                    {...register(`technologies.${index}.version`)}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => remove(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="mt-3">
                              <Label htmlFor={`technologies.${index}.description`}>Descrição/Uso</Label>
                              <Textarea
                                id={`technologies.${index}.description`}
                                placeholder="Como esta tecnologia é utilizada no projeto..."
                                rows={2}
                                {...register(`technologies.${index}.description`)}
                              />
                            </div>

                            <input
                              type="hidden"
                              {...register(`technologies.${index}.category`)}
                              value={category}
                            />
                          </Card>
                        );
                      })}
                    </div>

                    {categoryTechs.length === 0 && (
                      <div className="text-center py-6">
                        <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                          Nenhuma tecnologia de {label.toLowerCase()} adicionada ainda.
                        </p>
                        <Button 
                          type="button" 
                          onClick={() => addTechnology(category)} 
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Primeira Tecnologia
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Architecture Description */}
        <Card>
          <CardHeader>
            <CardTitle>Arquitetura do Sistema</CardTitle>
            <CardDescription>
              Descreva a arquitetura geral do sistema, padrões utilizados e decisões técnicas importantes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Ex: Arquitetura em microsserviços com API REST, banco de dados relacional PostgreSQL, cache Redis, deploy em containers Docker na AWS..."
              rows={4}
              {...register('architecture')}
              className={errors.architecture ? 'border-red-500' : ''}
            />
            {errors.architecture && (
              <p className="text-sm text-red-500 mt-1">
                {errors.architecture.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Technology Summary */}
        {watchedTechnologies.length > 0 && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">Resumo das Tecnologias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(categoryLabels).map(([category, label]) => {
                  const techs = getTechsByCategory(category);
                  if (techs.length === 0) return null;
                  
                  const Icon = categoryIcons[category as keyof typeof categoryIcons];
                  
                  return (
                    <div key={category}>
                      <div className="flex items-center mb-2">
                        <Icon className="h-4 w-4 mr-2 text-gray-600" />
                        <span className="font-medium text-sm text-gray-700">{label}:</span>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-6">
                        {techs.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="px-2 py-1">
                            {tech.name}
                            {tech.version && <span className="ml-1 text-xs opacity-75">v{tech.version}</span>}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onBack}>
            Voltar
          </Button>
          <div className="flex space-x-2">
            <Button type="button" variant="ghost" onClick={skipStep}>
              Pular Esta Etapa
            </Button>
            <Button type="submit">
              Próximo: Objetivos
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
                Dicas para documentar tecnologias:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Inclua versões específicas quando relevante</li>
                <li>• Documente o motivo da escolha de cada tecnologia</li>
                <li>• Considere dependências e compatibilidade</li>
                <li>• Mantenha a lista atualizada conforme o projeto evolui</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}