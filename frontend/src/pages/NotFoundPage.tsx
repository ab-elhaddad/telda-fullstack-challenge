import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * NotFound page component for 404 errors
 * Provides a user-friendly error message and navigation options
 */
export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="container flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 rounded-full bg-gray-100 p-6 dark:bg-gray-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-500 dark:text-gray-400"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
      </div>

      <h1 className="mb-2 text-4xl font-bold tracking-tight sm:text-5xl">
        404
      </h1>

      <h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
        Page Not Found
      </h2>

      <p className="mb-8 max-w-md text-lg text-gray-600 dark:text-gray-300">
        Sorry, we couldn't find the page you're looking for. It might have been
        removed, renamed, or doesn't exist.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link to="/" className="inline-block">
          <Button size="lg">Go Home</Button>
        </Link>

        <Button variant="outline" size="lg" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    </div>
  );
}
