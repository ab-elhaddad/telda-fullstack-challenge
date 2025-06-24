import { Card, CardContent } from "@/components/ui/card";
import { LoginForm, LoginFormValues, toLoginCredentials } from "@/components/forms/LoginForm";
import useAuth from "@/hooks/useAuth";

export function LoginPage() {
  const { login, isLoading, error } = useAuth();

  const handleSubmit = (data: LoginFormValues) => {
    // Transform form values to match LoginCredentials type
    const credentials = toLoginCredentials(data);
    login(credentials);
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 px-8 pb-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">Welcome back</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Sign in to your account
            </p>
          </div>
          
          <LoginForm 
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}
