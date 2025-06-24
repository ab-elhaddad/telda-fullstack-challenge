import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/skeleton";

export const ProfileLoadingSkeleton: React.FC = () => {
  return (
    <>
      {/* Personal Information Skeleton */}
      <Card data-testid="skeleton-card">
        <CardHeader>
          <SkeletonCard
            className="h-7 w-40"
            aria-label="Loading title"
            data-testid="skeleton-title"
          />
          <SkeletonCard
            className="h-4 w-full max-w-[250px]"
            aria-label="Loading subtitle"
            data-testid="skeleton-subtitle"
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SkeletonCard
              className="h-10 w-full"
              aria-label="Loading input field"
              data-testid="skeleton-input"
            />
            <SkeletonCard
              className="h-10 w-full"
              aria-label="Loading input field"
              data-testid="skeleton-input"
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end space-x-2">
          <SkeletonCard
            className="h-9 w-24"
            aria-label="Loading button"
            data-testid="skeleton-button"
          />
        </CardFooter>
      </Card>

      {/* Security Settings Skeleton */}
      <Card data-testid="skeleton-card">
        <CardHeader>
          <SkeletonCard
            className="h-7 w-40"
            aria-label="Loading title"
            data-testid="skeleton-title"
          />
        </CardHeader>
        <CardContent>
          <SkeletonCard
            className="h-4 w-full max-w-[350px]"
            aria-label="Loading text"
            data-testid="skeleton-text"
          />
          <div className="mt-4">
            <SkeletonCard
              className="h-9 w-32"
              aria-label="Loading button"
              data-testid="skeleton-button"
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Preferences Skeleton */}
      <Card data-testid="skeleton-card">
        <CardHeader>
          <SkeletonCard
            className="h-7 w-40"
            aria-label="Loading title"
            data-testid="skeleton-title"
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <SkeletonCard
                  className="h-5 w-40"
                  aria-label="Loading title"
                  data-testid="skeleton-title"
                />
                <SkeletonCard
                  className="h-4 w-60"
                  aria-label="Loading description"
                  data-testid="skeleton-text"
                />
              </div>
              <SkeletonCard
                className="h-6 w-11"
                aria-label="Loading toggle"
                data-testid="skeleton-toggle"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <SkeletonCard
                  className="h-5 w-40"
                  aria-label="Loading title"
                  data-testid="skeleton-title"
                />
                <SkeletonCard
                  className="h-4 w-60"
                  aria-label="Loading description"
                  data-testid="skeleton-text"
                />
              </div>
              <SkeletonCard
                className="h-6 w-11"
                aria-label="Loading toggle"
                data-testid="skeleton-toggle"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone Skeleton */}
      <Card
        data-testid="skeleton-card"
        className="border-red-200 dark:border-red-900"
      >
        <CardHeader>
          <SkeletonCard
            className="h-7 w-40"
            aria-label="Loading title"
            data-testid="skeleton-danger-title"
          />
        </CardHeader>
        <CardContent>
          <SkeletonCard
            className="h-4 w-full max-w-[350px]"
            aria-label="Loading text"
            data-testid="skeleton-text"
          />
          <div className="mt-4">
            <SkeletonCard
              className="h-9 w-32"
              aria-label="Loading danger button"
              data-testid="skeleton-danger-button"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};
