import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import type {
  Project,
  ProjectFormData,
  TeamMember,
  Technology,
  Objective,
  FunctionalRequirement,
  NonFunctionalRequirement,
  Audience,
  PaymentInfo,
  Stakeholder,
  TeamFormData,
  TechnologyFormData,
  ObjectiveFormData,
} from '@/types';

export const useProjects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all projects for the current user
  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        // Return mock data for testing
        return [
          {
            id: 'mock-project-1',
            title: 'Projeto de Teste 1',
            description: 'Este é um projeto de teste para verificar a exibição',
            status: 'in_progress',
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'mock-project-2',
            title: 'Projeto de Teste 2',
            description: 'Outro projeto de teste',
            status: 'draft',
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ] as Project[];
      }

      return data as Project[];
    },
    enabled: !!user,
  });

  // Create a new project
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: ProjectFormData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
    },
  });

  // Update a project
  const updateProjectMutation = useMutation({
    mutationFn: async ({
      id,
      ...projectData
    }: Partial<Project> & { id: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
    },
  });

  // Delete a project
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return projectId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
    },
  });

  return {
    projects,
    isLoading,
    error,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  };
};

// Hook to create a project (returns the mutation object)
export const useCreateProject = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectData: ProjectFormData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
    },
  });
};

// Hook to fetch a single project
export const useProject = (projectId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      return data as Project;
    },
    enabled: !!user && !!projectId,
  });
};

// Hook to create team members
export const useCreateTeamMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      members,
    }: {
      projectId: string;
      members: TeamFormData['members'];
    }) => {
      const { data, error } = await supabase
        .from('team')
        .insert(
          members.map(member => ({
            project_id: projectId,
            name: member.name,
            role: member.role,
            email: member.email,
          }))
        )
        .select();

      if (error) {
        throw error;
      }

      return data as TeamMember[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
};

// Hook to create technologies
export const useCreateTechnologies = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      technologies,
    }: {
      projectId: string;
      technologies: TechnologyFormData['technologies'];
    }) => {
      const { data, error } = await supabase
        .from('technologies')
        .insert(
          technologies.map(tech => ({
            project_id: projectId,
            name: tech.name,
            category: tech.category,
            version: tech.version,
            description: tech.description,
          }))
        )
        .select();

      if (error) {
        throw error;
      }

      return data as Technology[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
    },
  });
};

// Hook to create objectives
export const useCreateObjectives = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      objectives,
    }: {
      projectId: string;
      objectives: ObjectiveFormData['objectives'];
    }) => {
      const { data, error } = await supabase
        .from('objectives')
        .insert(
          objectives.map(obj => ({
            project_id: projectId,
            title: obj.title,
            description: obj.description,
            priority: obj.priority,
          }))
        )
        .select();

      if (error) {
        throw error;
      }

      return data as Objective[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
};

// Hook to fetch team members by project ID
export const useTeamMembers = (projectId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['team', projectId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('team')
        .select('*')
        .eq('project_id', projectId);

      if (error) {
        throw error;
      }

      return data as TeamMember[];
    },
    enabled: !!user && !!projectId,
  });
};

// Hook to fetch technologies by project ID
export const useTechnologies = (projectId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['technologies', projectId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('technologies')
        .select('*')
        .eq('project_id', projectId);

      if (error) {
        throw error;
      }

      return data as Technology[];
    },
    enabled: !!user && !!projectId,
  });
};

// Hook to fetch objectives by project ID
export const useObjectives = (projectId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['objectives', projectId],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching objectives:', error);
        return [];
      }

      return data as Objective[];
    },
    enabled: !!user && !!projectId,
  });
};

// Create functional requirements
export const useCreateFunctionalRequirements = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      requirements,
    }: {
      projectId: string;
      requirements: Omit<
        FunctionalRequirement,
        'id' | 'project_id' | 'created_at'
      >[];
    }) => {
      if (!user) throw new Error('User not authenticated');

      const requirementsWithProjectId = requirements.map(req => ({
        ...req,
        project_id: projectId,
      }));

      const { data, error } = await supabase
        .from('requirements_functional')
        .insert(requirementsWithProjectId)
        .select();

      if (error) {
        console.error('Error creating functional requirements:', error);
        throw error;
      }

      return data as FunctionalRequirement[];
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: ['functional-requirements', projectId],
      });
    },
  });
};

// Create non-functional requirements
export const useCreateNonFunctionalRequirements = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      requirements,
    }: {
      projectId: string;
      requirements: Omit<
        NonFunctionalRequirement,
        'id' | 'project_id' | 'created_at'
      >[];
    }) => {
      if (!user) throw new Error('User not authenticated');

      const requirementsWithProjectId = requirements.map(req => ({
        ...req,
        project_id: projectId,
      }));

      const { data, error } = await supabase
        .from('requirements_non_functional')
        .insert(requirementsWithProjectId)
        .select();

      if (error) {
        console.error('Error creating non-functional requirements:', error);
        throw error;
      }

      return data as NonFunctionalRequirement[];
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: ['non-functional-requirements', projectId],
      });
    },
  });
};

// Fetch functional requirements
export const useFunctionalRequirements = (projectId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['functional-requirements', projectId],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('requirements_functional')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching functional requirements:', error);
        return [];
      }

      return data as FunctionalRequirement[];
    },
    enabled: !!user && !!projectId,
  });
};

// Fetch non-functional requirements
export const useNonFunctionalRequirements = (projectId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['non-functional-requirements', projectId],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('requirements_non_functional')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching non-functional requirements:', error);
        return [];
      }

      return data as NonFunctionalRequirement[];
    },
    enabled: !!user && !!projectId,
  });
};

// Fetch audiences
export const useAudiences = (projectId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['audiences', projectId],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('audiences')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching audiences:', error);
        return [];
      }

      return data as Audience[];
    },
    enabled: !!user && !!projectId,
  });
};

// Fetch payment info
export const usePaymentInfo = (projectId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['payment', projectId],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('payment')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error) {
        console.error('Error fetching payment info:', error);
        return null;
      }

      return data as PaymentInfo;
    },
    enabled: !!user && !!projectId,
  });
};

// Fetch stakeholders
export const useStakeholders = (projectId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['stakeholders', projectId],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('stakeholders')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching stakeholders:', error);
        return [];
      }

      return data as Stakeholder[];
    },
    enabled: !!user && !!projectId,
  });
};
