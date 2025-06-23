import { ReactNode, forwardRef } from "react";
import { cn } from "@/utils/cn";

interface CardProps {
  className?: string;
  children: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

interface CardHeaderProps {
  className?: string;
  children: ReactNode;
}

export const CardHeader = ({ className, children, ...props }: CardHeaderProps) => {
  return (
    <div
      className={cn("p-6 pb-2", className)}
      {...props}
    >
      {children}
    </div>
  );
};
CardHeader.displayName = "CardHeader";

interface CardTitleProps {
  className?: string;
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const CardTitle = ({ className, children, as = "h3", ...props }: CardTitleProps) => {
  const Component = as;
  return (
    <Component
      className={cn(
        "text-xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
CardTitle.displayName = "CardTitle";

interface CardDescriptionProps {
  className?: string;
  children: ReactNode;
}

export const CardDescription = ({ className, children, ...props }: CardDescriptionProps) => {
  return (
    <p
      className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
      {...props}
    >
      {children}
    </p>
  );
};
CardDescription.displayName = "CardDescription";

interface CardContentProps {
  className?: string;
  children: ReactNode;
}

export const CardContent = ({ className, children, ...props }: CardContentProps) => {
  return (
    <div className={cn("p-6 pt-2", className)} {...props}>
      {children}
    </div>
  );
};
CardContent.displayName = "CardContent";

interface CardFooterProps {
  className?: string;
  children: ReactNode;
}

export const CardFooter = ({ className, children, ...props }: CardFooterProps) => {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  );
};
CardFooter.displayName = "CardFooter";

interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: "auto" | "video" | "square" | "portrait";
}

export const CardImage = ({ 
  src, 
  alt, 
  className,
  aspectRatio = "auto",
  ...props 
}: CardImageProps) => {
  const aspectRatioClasses = {
    auto: "",
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[2/3]"
  };
  
  return (
    <div className={cn(
      "overflow-hidden rounded-t-lg",
      aspectRatioClasses[aspectRatio]
    )}>
      <img
        src={src}
        alt={alt}
        className={cn("h-full w-full object-cover", className)}
        loading="lazy"
        {...props}
      />
    </div>
  );
};
CardImage.displayName = "CardImage";
