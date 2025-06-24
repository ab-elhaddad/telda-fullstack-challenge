import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import ErrorBoundary from "@/components/error/ErrorBoundary";

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main layout component that wraps all pages with consistent header, footer,
 * and error handling
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#141414]">
      {/* Header is wrapped in ErrorBoundary to ensure navigation remains accessible */}
      <ErrorBoundary>
        <Header />
      </ErrorBoundary>

      {/* Main content */}
      <main className="flex-grow bg-gradient-to-b from-black/40 via-[#141414] to-[#141414]">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black py-8">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="mb-4 font-bold text-gray-200">MovieHub</h3>
              <p className="text-sm text-gray-400">
                Your go-to platform for discovering, tracking, and enjoying movies.
              </p>
            </div>
            
            <div>
              <h3 className="mb-4 font-bold text-gray-200">Links</h3>
              <ul className="flex flex-col gap-2 text-sm">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/watchlist" className="text-gray-400 hover:text-primary transition-colors">
                    My Watchlist
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="mb-4 font-bold text-gray-200">Legal</h3>
              <ul className="flex flex-col gap-2 text-sm">
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} MovieHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
