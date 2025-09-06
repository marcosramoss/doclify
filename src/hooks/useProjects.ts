import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import type { Project, ProjectFormData } from '@/types';

export const useProjects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all projects for the current user
  const {
    data: projects = [],
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
        throw error;
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
    mutationFn: async ({ id, ...projectData }: Partial<Project> & { id: string }) => {
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
        .select(`
          *,
          team(*),
          technologies(*),
          audiences(*),
          objectives(*),
          requirements_functional(*),
          requirements_non_functional(*),
          stakeholders(*)
        `)
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