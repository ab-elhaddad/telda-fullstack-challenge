import React, { useRef, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/formError";
import { ProfileErrors, ProfileFormData } from "@/types/auth";

interface PasswordModalProps {
  isOpen: boolean;
  formData: ProfileFormData;
  errors: ProfileErrors;
  isChangingPassword: boolean;
  onClose: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  formData,
  errors,
  isChangingPassword,
  onClose,
  onInputChange,
  onSubmit,
}) => {
  const currentPasswordRef = useRef<HTMLInputElement>(null);

  // Focus on currentPassword field when modal opens
  useEffect(() => {
    if (isOpen && currentPasswordRef.current) {
      setTimeout(() => {
        currentPasswordRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password">
      <form onSubmit={onSubmit} className="py-4">
        {errors.server && (
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
              {errors.server}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="text-sm font-medium">
              Current Password
            </label>
            <input
              ref={currentPasswordRef}
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={onInputChange}
              aria-invalid={!!errors.currentPassword}
              aria-describedby={
                errors.currentPassword ? "currentPassword-error" : undefined
              }
              autoComplete="current-password"
              className={`w-full p-2 rounded-md border ${
                errors.currentPassword ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            <FormError message={errors.currentPassword} />
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
              onChange={onInputChange}
              aria-invalid={!!errors.newPassword}
              aria-describedby={
                errors.newPassword ? "newPassword-error" : undefined
              }
              autoComplete="new-password"
              className={`w-full p-2 rounded-md border ${
                errors.newPassword ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            <FormError message={errors.newPassword} />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={onInputChange}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword ? "confirmPassword-error" : undefined
              }
              autoComplete="new-password"
              className={`w-full p-2 rounded-md border ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            <FormError message={errors.confirmPassword} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
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
  );
};
