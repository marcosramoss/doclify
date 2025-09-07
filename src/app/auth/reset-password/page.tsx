'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { FileText, Loader2, ArrowLeft } from 'lucide-react';

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
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/lib/validations/auth';

export default function ResetPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const { error } = await resetPassword(data.email);

      if (error) {
        toast.error('Erro ao enviar email', {
          description: error.message,
        });
        return;
      }

      setIsSubmitted(true);
      toast.success('Email enviado!', {
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
    } catch (error) {
      toast.error('Erro inesperado', {
        description: 'Tente novamente em alguns instantes.',
      });
    }
  };

  if (isSubmitted) {
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
            <CardHeader className='space-y-1 text-center'>
              <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
                <svg
                  className='h-6 w-6 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <CardTitle className='text-2xl font-bold'>
                Email Enviado!
              </CardTitle>
              <CardDescription>
                Enviamos um link para redefinir sua senha para{' '}
                <span className='font-medium text-gray-900'>
                  {getValues('email')}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='rounded-lg bg-blue-50 p-4'>
                <p className='text-responsive-sm text-blue-800'>
                  <strong>Próximos passos:</strong>
                </p>
                <ol className='mt-2 list-decimal list-inside text-responsive-sm text-blue-700 space-y-1'>
                  <li>Verifique sua caixa de entrada</li>
                  <li>Clique no link do email</li>
                  <li>Defina uma nova senha</li>
                  <li>Faça login com a nova senha</li>
                </ol>
              </div>

              <div className='text-center text-responsive-sm text-gray-600'>
                Não recebeu o email? Verifique sua pasta de spam ou{' '}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className='text-blue-600 hover:text-blue-500 font-medium'
                >
                  tente novamente
                </button>
                .
              </div>

              <div className='pt-4'>
                <Link href='/auth/login'>
                  <Button variant='outline' className='w-full'>
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    Voltar para o login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              Redefinir Senha
            </CardTitle>
            <CardDescription className='text-center'>
              Digite seu email para receber um link de redefinição de senha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
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

              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Enviando...
                  </>
                ) : (
                  'Enviar link de redefinição'
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
                    Lembrou da senha?
                  </span>
                </div>
              </div>

              <div className='mt-4'>
                <Link href='/auth/login'>
                  <Button variant='outline' className='w-full'>
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    Voltar para o login
                  </Button>
                </Link>
              </div>
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
