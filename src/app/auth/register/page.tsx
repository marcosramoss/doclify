'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, FileText, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { signUp, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { error } = await signUp(data.email, data.password, data.name);

      if (error) {
        toast.error('Erro ao criar conta', {
          description: error.message,
        });
        return;
      }

      toast.success('Conta criada com sucesso!', {
        description: 'Verifique seu email para confirmar a conta.',
      });
      router.push('/auth/login?message=check-email');
    } catch (error) {
      toast.error('Erro inesperado', {
        description: 'Tente novamente em alguns instantes.',
      });
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Logo */}
        <div className='flex items-center justify-center mb-8'>
          <div className='flex items-center space-x-2'>
            <FileText className='h-8 w-8 text-blue-600' />
            <span className='text-2xl font-bold text-gray-900'>Doclify</span>
          </div>
        </div>

        <Card>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl font-bold text-center'>
              Criar Conta
            </CardTitle>
            <CardDescription className='text-center'>
              Crie sua conta gratuita no Doclify
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Nome completo</Label>
                <Input
                  id='name'
                  type='text'
                  placeholder='Seu nome completo'
                  {...register('name')}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className='text-sm text-red-500'>{errors.name.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='seu@email.com'
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className='text-sm text-red-500'>{errors.email.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Senha</Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Mínimo 6 caracteres'
                    {...register('password')}
                    className={
                      errors.password ? 'border-red-500 pr-10' : 'pr-10'
                    }
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className='text-sm text-red-500'>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>Confirmar senha</Label>
                <div className='relative'>
                  <Input
                    id='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='Confirme sua senha'
                    {...register('confirmPassword')}
                    className={
                      errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'
                    }
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className='text-sm text-red-500'>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Criando conta...
                  </>
                ) : (
                  'Criar conta gratuita'
                )}
              </Button>
            </form>

            <div className='mt-6'>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-300' />
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-2 bg-white text-gray-500'>
                    Já tem uma conta?
                  </span>
                </div>
              </div>

              <div className='mt-4'>
                <Link href='/auth/login'>
                  <Button variant='outline' className='w-full'>
                    Fazer login
                  </Button>
                </Link>
              </div>
            </div>

            <div className='mt-6 text-xs text-center text-gray-500'>
              Ao criar uma conta, você concorda com nossos{' '}
              <Link href='/terms' className='text-blue-600 hover:text-blue-500'>
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link
                href='/privacy'
                className='text-blue-600 hover:text-blue-500'
              >
                Política de Privacidade
              </Link>
              .
            </div>
          </CardContent>
        </Card>

        <div className='mt-8 text-center'>
          <Link href='/' className='text-sm text-gray-600 hover:text-gray-500'>
            ← Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}
