import { ShieldCheck, ShieldAlert } from 'lucide-react';

interface VerificationBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function VerificationBadge({ isVerified, size = 'md', showText = true }: VerificationBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (isVerified) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-green-100 text-green-800 ${sizeClasses[size]}`}>
        <ShieldCheck className={iconSizes[size]} />
        {showText && 'Verified Student'}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-amber-100 text-amber-800 ${sizeClasses[size]}`}>
      <ShieldAlert className={iconSizes[size]} />
      {showText && 'Unverified'}
    </span>
  );
}
