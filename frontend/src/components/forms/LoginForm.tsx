import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LoginCredentials } from "@/types/auth";

// Define form schema
const loginSchema = z.object({
  identifier: z.string().min(1, { message: "Email or username is required" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Utility function to transform form values to LoginCredentials
export const toLoginCredentials = (
  formValues: LoginFormValues
): LoginCredentials => {
  return {
    identifier: formValues.identifier, // Email or Username
    password: formValues.password,
  } as LoginCredentials;
};

type LoginFormProps = {
  onSubmit: (data: LoginFormValues) => void;
  isLoading: boolean;
  error?: string | null;
};

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const handleSubmit = (data: LoginFormValues) => {
    onSubmit(data);
  };

  return (
    <div>
      {error && (
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
            {error}
          </div>
        </div>
      )}

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="identifier"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email or Username
          </label>
          <input
            {...form.register("identifier")}
            id="identifier"
            type="text"
            autoComplete="identifier"
            className={`w-full p-2.5 rounded-md border ${
              form.formState.errors.identifier
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
            placeholder="your@email.com"
          />
          {form.formState.errors.identifier && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.identifier.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            {...form.register("password")}
            id="password"
            type="password"
            autoComplete="current-password"
            className={`w-full p-2.5 rounded-md border ${
              form.formState.errors.password
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
            placeholder="••••••••"
          />
          {form.formState.errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="pt-2">
          <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
            Sign in
          </Button>
        </div>

        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary-600 hover:underline">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
