import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import authService from "@/services/auth.service";
import type { ProfileFormData, ProfileErrors } from "../types/auth";

export const usePasswordForm = (onSuccess: () => void) => {
  const { showToast } = useToast();
  const [passwordErrors, setPasswordErrors] = useState<ProfileErrors>({});

  // Change password mutation
  const { mutate: changePassword, isPending: isChangingPassword } = useMutation(
    {
      mutationFn: (data: {
        oldPassword: string;
        newPassword: string;
        confirmPassword: string;
      }) => authService.changePassword(data),
      onSuccess: () => {
        showToast("Password changed successfully", "success");
        onSuccess();
      },
      onError: (error: any) => {
        setPasswordErrors({ server: error?.response?.data?.message });
      },
    }
  );

  const validatePasswordForm = (formData: ProfileFormData) => {
    const newErrors: ProfileErrors = {};

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

  const handlePasswordSubmit = (formData: ProfileFormData) => {
    if (validatePasswordForm(formData)) {
      changePassword({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
    }
  };

  const clearPasswordErrors = () => {
    setPasswordErrors({});
  };

  return {
    passwordErrors,
    isChangingPassword,
    handlePasswordSubmit,
    clearPasswordErrors,
  };
};
