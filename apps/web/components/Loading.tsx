import { Loader2 } from 'lucide-react';

interface LoadingProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ size = 'md', text }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return (
        <div className="flex items-center justify-center gap-2">
            <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
            {text && <span className="text-sm text-gray-400">{text}</span>}
        </div>
    );
};

// Skeleton loading component
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`animate-pulse bg-white/[0.05] rounded ${className}`} />
    );
};
