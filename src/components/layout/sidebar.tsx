'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  HelpCircle,
  ChevronLeft,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Projetos',
    href: '/projects',
    icon: FolderOpen,
  },
  {
    name: 'Editor',
    href: '/editor',
    icon: FileText,
  },
];

const secondaryNavigation = [
  {
    name: 'Configurações',
    href: '/settings',
    icon: Settings,
  },
  {
    name: 'Ajuda',
    href: '/help',
    icon: HelpCircle,
  },
];

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 md:hidden'
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-white border-r transition-all duration-300 md:relative md:translate-x-0 md:h-auto md:min-h-screen',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'w-18' : 'w-64'
        )}
      >
        <div className='flex h-full flex-col'>
          {/* Header */}
          <div className='flex h-16 items-center justify-between px-4 border-b'>
            {!isCollapsed && (
              <Link href='/dashboard' className='flex items-center space-x-2'>
                <FileText className='h-6 w-6 text-blue-600' />
                <span className='text-xl font-bold text-gray-900'>Doclify</span>
              </Link>
            )}

            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsCollapsed(!isCollapsed)}
              className='hidden md:flex'
            >
              <ChevronLeft
                className={cn(
                  'h-4 w-4 transition-transform',
                  isCollapsed && 'rotate-180'
                )}
              />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className='p-4'>
            <Button
              asChild
              className={cn('w-full justify-start', isCollapsed && 'px-2')}
            >
              <Link href='/editor/new'>
                <Plus className='h-4 w-4' />
                {!isCollapsed && <span className='ml-2'>Novo Projeto</span>}
              </Link>
            </Button>
          </div>

          <Separator />

          {/* Main Navigation */}
          <nav className='flex-1 space-y-1 p-4'>
            <div className='space-y-1'>
              {navigation.map(item => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100',
                      isActive
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                        : 'text-gray-700 hover:text-gray-900',
                      isCollapsed && 'justify-center px-2'
                    )}
                    onClick={onClose}
                  >
                    <item.icon className='h-5 w-5 flex-shrink-0' />
                    {!isCollapsed && <span className='ml-3'>{item.name}</span>}
                  </Link>
                );
              })}
            </div>

            <Separator className='my-4' />

            {/* Secondary Navigation */}
            <div className='space-y-1'>
              {secondaryNavigation.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100',
                      isActive
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                        : 'text-gray-700 hover:text-gray-900',
                      isCollapsed && 'justify-center px-2'
                    )}
                    onClick={onClose}
                  >
                    <item.icon className='h-5 w-5 flex-shrink-0' />
                    {!isCollapsed && <span className='ml-3'>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className='p-4 border-t'>
              <div className='text-xs text-gray-500'>
                <p>Doclify v1.0.0</p>
                <p>© 2024 Todos os direitos reservados</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
