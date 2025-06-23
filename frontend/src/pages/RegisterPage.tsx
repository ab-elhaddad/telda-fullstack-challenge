import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { RegisterForm } from "@/components/forms/RegisterForm";

export function RegisterPage() {

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Create Your Account</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Join us and start tracking your favorite movies
              </p>
            </div>

            <RegisterForm />

            <div className="mt-6 text-center text-sm">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                  Log in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
