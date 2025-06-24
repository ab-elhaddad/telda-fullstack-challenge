import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/formError";
import { ProfileErrors, ProfileFormData, User } from "@/types/auth";

interface PersonalInformationCardProps {
  user: User;
  formData: ProfileFormData;
  errors: ProfileErrors;
  isUpdating: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PersonalInformationCard: React.FC<
  PersonalInformationCardProps
> = ({ user, formData, errors, isUpdating, onInputChange, onSubmit }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="profile-form" onSubmit={onSubmit}>
          <div className="grid gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={onInputChange}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
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
            readOnly
            autoComplete="email"
            className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </CardContent>
    </Card>
  );
};
