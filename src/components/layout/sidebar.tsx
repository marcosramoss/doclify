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
  onCollapse?: (collapsed: boolean) => void;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
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

export function Sidebar({ isOpen = true, onClose, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapse?.(newCollapsed);
  };

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
          'fixed left-0 top-0 z-50 h-screen bg-white border-r transition-all duration-300 md:fixed md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'w-16 md:w-18' : 'w-72 sm:w-64'
        )}
      >
        <div className='flex h-full flex-col'>
          {/* Header */}
          <div className='flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 border-b'>
            {!isCollapsed && (
              <Link
                href='/dashboard'
                className='flex items-center space-x-1 sm:space-x-2'
              >
                <FileText className='h-5 w-5 sm:h-6 sm:w-6 text-blue-600' />
                <span className='text-responsive-lg font-bold text-gray-900'>
                  Doclify
                </span>
              </Link>
            )}

            <Button
              variant='ghost'
              size='sm'
              onClick={handleCollapse}
              className='hidden md:flex p-1'
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
          <div className='p-3 sm:p-4'>
            <Button
              asChild
              className={cn(
                'w-full justify-start text-sm',
                isCollapsed ? 'px-2' : 'px-3'
              )}
              size='sm'
            >
              <Link href='/editor/new'>
                <Plus className='h-4 w-4 flex-shrink-0' />
                {!isCollapsed && (
                  <span className='ml-2 truncate text-responsive-sm'>
                    Novo Projeto
                  </span>
                )}
              </Link>
            </Button>
          </div>

          <Separator />

          {/* Main Navigation */}
          <nav className='flex-1 space-y-1 p-3 sm:p-4'>
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
                      'flex items-center rounded-lg px-2 sm:px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100',
                      isActive
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                        : 'text-gray-700 hover:text-gray-900',
                      isCollapsed && 'justify-center px-2'
                    )}
                    onClick={onClose}
                  >
                    <item.icon className='h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0' />
                    {!isCollapsed && (
                      <span className='ml-2 sm:ml-3 truncate text-responsive-sm'>
                        {item.name}
                      </span>
                    )}
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
                      'flex items-center rounded-lg px-2 sm:px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100',
                      isActive
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                        : 'text-gray-700 hover:text-gray-900',
                      isCollapsed && 'justify-center px-2'
                    )}
                    onClick={onClose}
                  >
                    <item.icon className='h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0' />
                    {!isCollapsed && (
                      <span className='ml-2 sm:ml-3 truncate text-responsive-sm'>
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className='p-3 sm:p-4 border-t'>
              <div className='text-responsive-xs text-gray-500'>
                <p className='truncate'>Doclify v1.0.0</p>
                <p className='truncate'>© 2024 Todos os direitos reservados</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
