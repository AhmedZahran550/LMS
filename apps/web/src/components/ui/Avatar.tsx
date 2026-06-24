import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({
  src,
  firstName = '',
  lastName = '',
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  const initials = `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || '?';

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-24 w-24 text-3xl',
  };

  const getFullUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Replace /api suffix if present on the base URL to map to NestJS root
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}/${url.replace(/^\//, '')}`;
  };

  const imageUrl = getFullUrl(src);

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full select-none items-center justify-center font-semibold text-slate-100 bg-gradient-to-br from-indigo-500 to-purple-600',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {imageUrl && !hasError ? (
        <img
          src={imageUrl}
          alt={`${firstName} ${lastName}`}
          className="aspect-square h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
