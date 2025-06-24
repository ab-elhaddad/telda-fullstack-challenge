import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import useAuth from "@/hooks/useAuth";
import { RegistrationData } from "@/types/auth";
import { useFormError } from "@/hooks/useFormError";
import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/formError";
import { useEffect } from "react";

// Define form schema with password confirmation
const registerSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(30, { message: "Username cannot exceed 30 characters" })
      .regex(/^[a-zA-Z0-9_-]+$/, {
        message:
          "Username can only contain letters, numbers, underscores, and hyphens",
      }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Must be a valid email address" }),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(1, { message: "Confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register, isLoading, error } = useAuth();
  const { apiError, setApiError, handleSubmit } =
    useFormError<RegisterFormValues>();

  useEffect(() => {
    if (error) {
      setApiError(error);
    }
  }, [error]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // Create registration data object to match backend expectations
      const registrationData: RegistrationData = {
        name: data.name,
        email: data.email,
        username: data.username,
        password: data.password,
        confirmPassword: data.confirmPassword,
      };

      await register(registrationData);
    } catch (err) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div>
      {apiError && (
        <div className="mb-6">
          <FormError message={apiError} variant="block" />
        </div>
      )}

      <form onSubmit={handleSubmit(form, onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Full Name
          </label>
          <input
            {...form.register("name")}
            id="name"
            type="text"
            autoComplete="name"
            className={`w-full p-2.5 rounded-md border ${form.formState.errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
            placeholder="John Doe"
            aria-invalid={!!form.formState.errors.name}
            aria-describedby={
              form.formState.errors.name ? "name-error" : undefined
            }
          />
          {form.formState.errors.name && (
            <FormError
              message={form.formState.errors.name.message}
              id="name-error"
            />
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Username
          </label>
          <input
            {...form.register("username")}
            id="username"
            type="text"
            autoComplete="username"
            className={`w-full p-2.5 rounded-md border ${form.formState.errors.username ? "border-red-500" : "border-gray-300 dark:border-gray-600"} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
            placeholder="johndoe123"
            aria-invalid={!!form.formState.errors.username}
            aria-describedby={
              form.formState.errors.username ? "username-error" : undefined
            }
          />
          {form.formState.errors.username && (
            <FormError
              message={form.formState.errors.username.message}
              id="username-error"
            />
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email Address
          </label>
          <input
            {...form.register("email")}
            id="email"
            type="email"
            autoComplete="email"
            className={`w-full p-2.5 rounded-md border ${form.formState.errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
            placeholder="your@email.com"
            aria-invalid={!!form.formState.errors.email}
            aria-describedby={
              form.formState.errors.email ? "email-error" : undefined
            }
          />
          {form.formState.errors.email && (
            <FormError
              message={form.formState.errors.email.message}
              id="email-error"
            />
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <input
            {...form.register("password")}
            id="password"
            type="password"
            autoComplete="new-password"
            className={`w-full p-2.5 rounded-md border ${form.formState.errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
            placeholder="••••••••"
            aria-invalid={!!form.formState.errors.password}
            aria-describedby={
              form.formState.errors.password ? "password-error" : undefined
            }
          />
          {form.formState.errors.password && (
            <FormError
              message={form.formState.errors.password.message}
              id="password-error"
            />
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirm Password
          </label>
          <input
            {...form.register("confirmPassword")}
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={`w-full p-2.5 rounded-md border ${form.formState.errors.confirmPassword ? "border-red-500" : "border-gray-300 dark:border-gray-600"} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
            placeholder="••••••••"
            aria-invalid={!!form.formState.errors.confirmPassword}
            aria-describedby={
              form.formState.errors.confirmPassword
                ? "confirmPassword-error"
                : undefined
            }
          />
          {form.formState.errors.confirmPassword && (
            <FormError
              message={form.formState.errors.confirmPassword.message}
              id="confirmPassword-error"
            />
          )}
        </div>

        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </div>
      </form>
    </div>
  );
}
