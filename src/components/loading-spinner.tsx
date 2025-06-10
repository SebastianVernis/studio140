import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps extends SVGProps<SVGSVGElement> {
  size?: number;
  borderColor?: string;
  borderTopColor?: string;
}

export function LoadingSpinner({
  size = 24,
  borderColor = 'border-border',
  borderTopColor = 'border-t-primary',
  className,
  ...props
}: LoadingSpinnerProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4" 
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('animate-spin', className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" className={cn(borderColor, borderTopColor)} />
    </svg>
  );
}
