'use client';

import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Step {
  id: string;
  title: string;
  description?: string;
  isCompleted?: boolean;
  isActive?: boolean;
  isDisabled?: boolean;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function StepNavigation({
  steps,
  currentStep,
  onStepClick,
  className,
}: StepNavigationProps) {
  return (
    <nav className={cn('space-y-1', className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isDisabled = step.isDisabled || index > currentStep + 1;

        return (
          <div key={step.id} className='relative'>
            <Button
              variant='ghost'
              className={cn(
                'w-full justify-start h-auto p-3 sm:p-4 text-left transition-all',
                isActive && 'bg-blue-50 text-blue-700 border-blue-200 border',
                isCompleted && !isActive && 'text-green-700',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => !isDisabled && onStepClick?.(index)}
              disabled={isDisabled}
            >
              <div className='flex items-center space-x-2 sm:space-x-3 w-full'>
                {/* Step Number/Check */}
                <div
                  className={cn(
                    'flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 text-xs sm:text-sm font-medium transition-colors',
                    isActive && 'bg-blue-600 text-white border-blue-600',
                    isCompleted &&
                      !isActive &&
                      'bg-green-600 text-white border-green-600',
                    !isActive && !isCompleted && 'border-gray-300 text-gray-500'
                  )}
                >
                  {isCompleted && !isActive ? (
                    <Check className='h-4 w-4' />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Step Content */}
                <div className='flex-1 min-w-0'>
                  <p
                    className={cn(
                      'font-medium text-xs sm:text-sm',
                      isActive && 'text-blue-700',
                      isCompleted && !isActive && 'text-green-700',
                      !isActive && !isCompleted && 'text-gray-900'
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p
                      className={cn(
                        'text-xs mt-1 hidden sm:block',
                        isActive && 'text-blue-600',
                        isCompleted && !isActive && 'text-green-600',
                        !isActive && !isCompleted && 'text-gray-500'
                      )}
                    >
                      {step.description}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                {!isDisabled && (
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive && 'text-blue-600',
                      isCompleted && !isActive && 'text-green-600',
                      !isActive && !isCompleted && 'text-gray-400'
                    )}
                  />
                )}
              </div>
            </Button>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className='absolute left-8 top-16 w-0.5 h-4 bg-gray-200' />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// Horizontal version for mobile/compact layouts
export function StepNavigationHorizontal({
  steps,
  currentStep,
  onStepClick,
  className,
}: StepNavigationProps) {
  return (
    <nav
      className={cn(
        'flex items-center space-x-2 overflow-x-auto pb-2',
        className
      )}
    >
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isDisabled = step.isDisabled || index > currentStep + 1;

        return (
          <div
            key={step.id}
            className='flex items-center space-x-2 flex-shrink-0'
          >
            <Button
              variant='ghost'
              size='sm'
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-full transition-all',
                isActive && 'bg-blue-100 text-blue-700',
                isCompleted && !isActive && 'text-green-700',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => !isDisabled && onStepClick?.(index)}
              disabled={isDisabled}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors',
                  isActive && 'bg-blue-600 text-white',
                  isCompleted && !isActive && 'bg-green-600 text-white',
                  !isActive && !isCompleted && 'bg-gray-200 text-gray-600'
                )}
              >
                {isCompleted && !isActive ? (
                  <Check className='h-3 w-3' />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className='text-sm font-medium whitespace-nowrap'>
                {step.title}
              </span>
            </Button>

            {/* Connector */}
            {index < steps.length - 1 && (
              <ChevronRight className='h-4 w-4 text-gray-400 flex-shrink-0' />
            )}
          </div>
        );
      })}
    </nav>
  );
}
