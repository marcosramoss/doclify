'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from './header';
import { Sidebar } from './sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AppLayout({ children, title, description }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isInitialized, isLoading } = useAuth();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  if (!isInitialized || isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4' />
          <p className='text-responsive-sm text-gray-600'>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCollapse={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}
      >
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} showMenuButton />

        {/* Page Content */}
        <main className='flex-1'>
          {/* Page Header */}
          {(title || description) && (
            <div className='bg-white border-b'>
              <div className='px-4 py-6'>
                {title && (
                  <h1 className='text-responsive-2xl font-bold text-gray-900 mb-2'>
                    {title}
                  </h1>
                )}
                {description && (
                  <p className='text-responsive-sm text-gray-600 prose-mobile'>
                    {description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Page Body */}
          <div className='px-4 py-6'>{children}</div>
        </main>
      </div>
    </div>
  );
}
