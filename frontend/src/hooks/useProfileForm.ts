import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/components/ui/toast";
import authService from "@/services/auth.service";
import type { ProfileFormData, ProfileErrors, User } from "../types/auth";

export const useProfileForm = (user: User) => {
  const { setUser } = useAuthStore();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<ProfileErrors>({});

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

  const validateForm = () => {
    const newErrors: ProfileErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      updateProfile({
        name: formData.name,
      });
    }
  };

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
      }));
    }
  }, [user]);

  return {
    formData,
    errors,
    isUpdating,
    handleInputChange,
    handleSubmit,
  };
};
