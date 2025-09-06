import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import type {
  Project,
  ProjectFormData,
  TeamMember,
  Technology,
  Objective,
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
        .select(
          `
          *,
          team(*)
        `
        )
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
