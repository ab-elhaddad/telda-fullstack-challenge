import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { useModal } from "@/components/ui/modal";
import authService from "@/services/auth.service";
import { ProfileFormData, User } from "@/types/auth";
import { useProfileForm } from "@/hooks/useProfileForm";
import { usePasswordForm } from "@/hooks/usePasswordForm";
import { ProfileLoadingSkeleton } from "@/components/profile/ProfileLoadingSkeleton";
import { PersonalInformationCard } from "@/components/profile/PersonalInformationCard";
import { SecurityCard } from "@/components/profile/SecurityCard";
import { DangerZoneCard } from "@/components/profile/DangerZoneCard";
import { PasswordModal } from "@/components/profile/PasswordModal";

export function ProfilePage() {
  const { user: data } = useAuthStore();
  const { isOpen, openModal, closeModal } = useModal();
  // @ts-ignore
  const user = data.user as User;

  // Profile data query
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => authService.getCurrentUser(),
    initialData: user,
  });

  // Profile form management
  const { formData, errors, isUpdating, handleInputChange, handleSubmit } =
    useProfileForm(profileData || user);

  // Password form state for modal
  const [passwordFormData, setPasswordFormData] = useState<ProfileFormData>({
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const resetPasswordForm = () => {
    setPasswordFormData({
      name: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handlePasswordSuccess = () => {
    closeModal();
    resetPasswordForm();
  };

  // Password form management
  const {
    passwordErrors,
    isChangingPassword,
    handlePasswordSubmit,
    clearPasswordErrors,
  } = usePasswordForm(handlePasswordSuccess);

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (passwordErrors[name]) {
      clearPasswordErrors();
    }
  };

  const handlePasswordFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePasswordSubmit(passwordFormData);
  };

  const handleModalClose = () => {
    closeModal();
    resetPasswordForm();
    clearPasswordErrors();
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      <div className="space-y-8">
        {isLoadingProfile ? (
          <ProfileLoadingSkeleton />
        ) : (
          <>
            <PersonalInformationCard
              user={profileData || user}
              formData={formData}
              errors={errors}
              isUpdating={isUpdating}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
            />

            <SecurityCard onChangePassword={openModal} />

            <DangerZoneCard />
          </>
        )}

        <PasswordModal
          isOpen={isOpen}
          formData={passwordFormData}
          errors={passwordErrors}
          isChangingPassword={isChangingPassword}
          onClose={handleModalClose}
          onInputChange={handlePasswordInputChange}
          onSubmit={handlePasswordFormSubmit}
        />
      </div>
    </div>
  );
}
