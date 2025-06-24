import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import { MainLayout } from "@/components/layout/MainLayout";
import { AuthHeader } from "@/components/layout/AuthHeader";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import QueryProvider from "@/providers/QueryProvider";
import { ToastProvider } from "./components/ui/toast";
import { useAuthStore } from "./stores/auth.store";

// Lazy-loaded pages
const HomePage = lazy(() =>
  import("@/pages/HomePage").then((module) => ({ default: module.HomePage }))
);
const LoginPage = lazy(() =>
  import("@/pages/LoginPage").then((module) => ({ default: module.LoginPage }))
);
const RegisterPage = lazy(() =>
  import("@/pages/RegisterPage").then((module) => ({
    default: module.RegisterPage,
  }))
);
const MoviesPage = lazy(() =>
  import("@/pages/MoviesPage").then((module) => ({
    default: module.MoviesPage,
  }))
);
const MovieDetailsPage = lazy(() =>
  import("@/pages/MovieDetailsPage").then((module) => ({
    default: module.MovieDetailsPage,
  }))
);
const WatchlistPage = lazy(() =>
  import("@/pages/WatchlistPage").then((module) => ({
    default: module.WatchlistPage,
  }))
);
const ProfilePage = lazy(() =>
  import("@/pages/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  }))
);
// Our new page uses default export
const MovieSearchPage = lazy(() => import("@/pages/MovieSearchPage"));

// Not Found Page
const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <h1 className="text-4xl font-bold mb-4">404</h1>
    <p className="text-xl mb-8">Page Not Found</p>
    <button
      onClick={() => window.history.back()}
      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
    >
      Go Back
    </button>
  </div>
);

function App() {
  const { isAuthenticated } = useAuthStore();

  // Use the AuthHeader when authenticated, otherwise use the MainLayout
  const Layout = isAuthenticated
    ? ({ children }: { children: React.ReactNode }) => (
        <AuthHeader>{children}</AuthHeader>
      )
    : MainLayout;

  return (
    <QueryProvider>
      <ToastProvider>
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center">
              Loading...
            </div>
          }
        >
          <Layout>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/movies/:id" element={<MovieDetailsPage />} />
              <Route path="/search" element={<MovieSearchPage />} />

              {/* Protected routes */}
              <Route
                path="/watchlist"
                element={
                  <ProtectedRoute>
                    <WatchlistPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </Suspense>
      </ToastProvider>
    </QueryProvider>
  );
}

export default App;
