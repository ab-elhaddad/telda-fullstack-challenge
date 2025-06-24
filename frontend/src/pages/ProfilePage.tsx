import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal, useModal } from "@/components/ui/modal";
import { SkeletonCard } from "@/components/ui/skeleton";
import authService from "@/services/auth.service";
import FormError from "@/components/ui/formError";
import { useToast } from "@/components/ui/toast";

export function ProfilePage() {
  const { user: data, setUser } = useAuthStore();
  const { isOpen, openModal, closeModal } = useModal();
  const { showToast } = useToast();
  // @ts-ignore
  const user = data.user as User;

  // Refs for focus management
  const currentPasswordRef = useRef<HTMLInputElement>(null);

  // Add profile loading query
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => authService.getCurrentUser(),
    initialData: user,
  });

  const [formData, setFormData] = useState({
    name: user?.name || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Update form data when profile is loaded
  useEffect(() => {
    if (profileData) {
      setFormData((prev) => ({
        ...prev,
        name: profileData.name || "",
      }));
    }
  }, [profileData]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {}
  );

  // Update profile mutation
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (data: { name: string }) => authService.updateProfile(data),
    onSuccess: (data) => {
      if (data) {
        setUser(data);
        showToast("Profile updated successfully", "success");
      }
    },
    onError: (error: any) => {
      showToast(
        error?.response?.data?.message || "Failed to update profile",
        "error"
      );
    },
  });

  // Change password mutation
  const { mutate: changePassword, isPending: isChangingPassword } = useMutation(
    {
      mutationFn: (data: {
        oldPassword: string;
        newPassword: string;
        confirmPassword: string;
      }) => authService.changePassword(data),
      onSuccess: () => {
        ``;
        showToast("Password changed successfully", "success");
        closeModal();
        resetPasswordForm();
      },
      onError: (error: any) => {
        setPasswordErrors({ server: error?.response?.data?.message });
      },
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateProfileForm()) {
      updateProfile({
        name: formData.name,
      });
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validatePasswordForm()) {
      changePassword({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
    }
  };

  const resetPasswordForm = () => {
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
    setErrors({});
  };

  // Focus on currentPassword field when modal opens
  useEffect(() => {
    if (isOpen && currentPasswordRef.current) {
      // Short timeout to ensure modal is rendered before focusing
      setTimeout(() => {
        currentPasswordRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      <div className="space-y-8">
        {isLoadingProfile ? (
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
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form id="profile-form" onSubmit={handleProfileSubmit}>
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        defaultValue={user?.name}
                        value={formData.name}
                        onChange={handleInputChange}
                        aria-invalid={!!errors.name}
                        aria-describedby={
                          errors.name ? "name-error" : undefined
                        }
                        autoComplete="name"
                        className={`w-full p-2 rounded-md border ${
                          errors.name ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-primary`}
                      />
                      {errors.name && <FormError message={errors.name} />}
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="submit"
                  variant="outline"
                  form="profile-form"
                  isLoading={isUpdating}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
              <CardContent>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={user?.email}
                    autoComplete="email"
                    className={`w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Update your password to keep your account secure.
                </p>
                <Button variant="outline" onClick={openModal}>
                  Change Password
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <div className="mt-4">
                  <Button
                    variant="danger"
                    data-testid="delete-account-button"
                    onClick={() => {
                      // This would typically show a confirmation modal
                      // For now we'll just have a placeholder
                      showToast(
                        "Account deletion requires confirmation. Feature coming soon.",
                        "error"
                      );
                    }}
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Change Password Modal */}
        <Modal
          isOpen={isOpen}
          onClose={() => {
            closeModal();
            resetPasswordForm();
          }}
          title="Change Password"
        >
          <form onSubmit={handlePasswordSubmit} className="py-4">
            {passwordErrors.server && (
              <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700 border-l-4 border-red-600 dark:bg-red-900/30 dark:text-red-400 dark:border-red-500">
                <div className="flex items-center">
                  <svg
                    className="h-4 w-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {passwordErrors.server}
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="currentPassword"
                  className="text-sm font-medium"
                >
                  Current Password
                </label>
                <input
                  ref={currentPasswordRef}
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  aria-invalid={!!errors.currentPassword}
                  aria-describedby={
                    errors.currentPassword ? "currentPassword-error" : undefined
                  }
                  autoComplete="current-password"
                  className={`w-full p-2 rounded-md border ${
                    errors.currentPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                />

                <FormError message={passwordErrors.currentPassword} />
              </div>

              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  aria-invalid={!!errors.newPassword}
                  aria-describedby={
                    errors.newPassword ? "newPassword-error" : undefined
                  }
                  autoComplete="new-password"
                  className={`w-full p-2 rounded-md border ${
                    errors.newPassword ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                />
                <FormError message={passwordErrors.newPassword} />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={
                    errors.confirmPassword ? "confirmPassword-error" : undefined
                  }
                  autoComplete="new-password"
                  className={`w-full p-2 rounded-md border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                />
                <FormError message={passwordErrors.confirmPassword} />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  closeModal();
                  resetPasswordForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isChangingPassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
