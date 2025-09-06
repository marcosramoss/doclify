import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Project } from '@/types';

interface ProjectState {
  // Current project being edited
  currentProject: Project | null;
  currentStep: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentProject: (project: Project | null) => void;
  setCurrentStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetProject: () => void;
  nextStep: () => void;
  previousStep: () => void;
}

export const useProjectStore = create<ProjectState>()(devtools(
  (set, get) => ({
    currentProject: null,
    currentStep: 0,
    isLoading: false,
    error: null,
    
    setCurrentProject: (project) => set({ currentProject: project }),
    setCurrentStep: (step) => set({ currentStep: step }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    
    resetProject: () => set({
      currentProject: null,
      currentStep: 0,
      isLoading: false,
      error: null,
    }),
    
    nextStep: () => {
      const { currentStep } = get();
      if (currentStep < 8) { // Total of 9 steps (0-8)
        set({ currentStep: currentStep + 1 });
      }
    },
    
    previousStep: () => {
      const { currentStep } = get();
      if (currentStep > 0) {
        set({ currentStep: currentStep - 1 });
      }
    },
  }),
  {
    name: 'project-store',
  }
));