'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Menu, User, LogOut, Settings, Bell } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/utils/format';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ onMenuClick, showMenuButton = true }: HeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      toast.success('Logout realizado com sucesso!');
      router.push('/');
    } catch (err) {
      toast.error('Erro ao fazer logout');
    } finally {
      setIsSigningOut(false);
    }
  };

  const userInitials = user?.user_metadata?.full_name
    ? getInitials(user.user_metadata.full_name)
    : user?.email
      ? getInitials(user.email)
      : 'U';

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60'>
      <div className='flex h-16 items-center justify-between px-4'>
        <div className='flex items-center space-x-4'>
          {showMenuButton && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onMenuClick}
              className='md:hidden'
            >
              <Menu className='h-5 w-5' />
            </Button>
          )}

          <Link href='/dashboard' className='flex items-center space-x-2'>
            <FileText className='h-6 w-6 text-blue-600' />
            <span className='text-xl font-bold text-gray-900'>Doclify</span>
          </Link>
        </div>

        <div className='flex items-center space-x-4'>
          {/* Notifications */}
          <Button variant='ghost' size='sm' className='relative'>
            <Bell className='h-5 w-5' />
            <span className='absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full' />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url}
                    alt={user?.user_metadata?.full_name || user?.email || ''}
                  />
                  <AvatarFallback className='bg-blue-100 text-blue-600'>
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='end' forceMount>
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    {user?.user_metadata?.full_name || 'Usuário'}
                  </p>
                  <p className='text-xs leading-none text-muted-foreground'>
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href='/profile' className='cursor-pointer'>
                  <User className='mr-2 h-4 w-4' />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href='/settings' className='cursor-pointer'>
                  <Settings className='mr-2 h-4 w-4' />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='cursor-pointer text-red-600 focus:text-red-600'
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                <LogOut className='mr-2 h-4 w-4' />
                <span>{isSigningOut ? 'Saindo...' : 'Sair'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
