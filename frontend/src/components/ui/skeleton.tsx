import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200 dark:bg-slate-800',
        className
      )}
      style={{ 
        width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : '100%',
        height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : '20px'
      }}
    />
  );
}

export function SkeletonText({ className, lines = 1 }: { className?: string, lines?: number }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full last:w-4/5" />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };
  
  return <Skeleton className={cn("rounded-full", sizeMap[size])} />;
}

export function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-md border p-4 space-y-3", className)} {...props}>
      <Skeleton className="h-8 w-1/3" />
      <SkeletonText lines={3} />
      <div className="pt-2">
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

export function SkeletonInput() {
  return <Skeleton className="h-10" />;
}

export function SkeletonFormField() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <SkeletonInput />
    </div>
  );
}

export function SkeletonButtonGroup() {
  return (
    <div className="flex gap-2 justify-end">
      <Skeleton className="h-9 w-20" />
      <Skeleton className="h-9 w-20" />
    </div>
  );
}
