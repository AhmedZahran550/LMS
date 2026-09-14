import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  firstName?: string;
  lastName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
}

const GRADIENT_PALETTES = [
  'from-indigo-500 to-purple-600',
  'from-violet-500 to-fuchsia-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
];

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
}

export function Avatar({
  src,
  firstName = '',
  lastName = '',
  size = 'md',
  isOnline,
  className,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || '?';
  const gradientClass = React.useMemo(() => getGradient(fullName || 'User'), [fullName]);

  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-24 w-24 text-3xl',
  };

  const statusDotSizes = {
    xs: 'h-1.5 w-1.5 bottom-0 end-0 ring-1',
    sm: 'h-2 w-2 bottom-0 end-0 ring-1.5',
    md: 'h-2.5 w-2.5 bottom-0 end-0 ring-2',
    lg: 'h-3.5 w-3.5 bottom-0.5 end-0.5 ring-2',
    xl: 'h-5 w-5 bottom-1 end-1 ring-3',
  };

  const getFullUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}/${url.replace(/^\//, '')}`;
  };

  const imageUrl = getFullUrl(src);

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full select-none items-center justify-center font-bold text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10',
          sizeClasses[size],
          !imageUrl || hasError ? `bg-gradient-to-tr ${gradientClass}` : 'bg-slate-200 dark:bg-slate-700',
          className
        )}
        {...props}
      >
        {imageUrl && !hasError ? (
          <img
            src={imageUrl}
            alt={fullName || 'Avatar'}
            className="aspect-square h-full w-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <span className="tracking-wider">{initials}</span>
        )}
      </div>

      {isOnline && (
        <span
          className={cn(
            'absolute rounded-full bg-emerald-500 ring-white dark:ring-slate-900',
            statusDotSizes[size]
          )}
          title="Online"
        />
      )}
    </div>
  );
}
