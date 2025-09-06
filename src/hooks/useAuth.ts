import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';

interface AuthError {
  message: string;
  status?: number;
}

export const useAuth = () => {
  const { user, isLoading, isInitialized, setUser, setLoading, setInitialized, signOut } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        setInitialized(true);

        if (event === 'SIGNED_OUT') {
          router.push('/auth/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, setInitialized, router]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: unknown) {
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: unknown) {
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: unknown) {
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: unknown) {
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isInitialized,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    signOut: signOutUser,
  };
};