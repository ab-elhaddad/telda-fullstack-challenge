import { useState, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface AuthHeaderProps {
  children: ReactNode;
}

export function AuthHeader({ children }: AuthHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background border-b border-border py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            Movie App
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <Link to="/movies" className="hover:text-primary">Movies</Link>
            {isAuthenticated ? (
              <>
                <Link to="/watchlist" className="hover:text-primary">My Watchlist</Link>
                <div className="relative ml-4">
                  <button 
                    onClick={toggleMenu}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <span className="font-medium">{user?.name}</span>
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg z-10 overflow-hidden">
                      <div className="py-1">
                        <Link 
                          to="/profile" 
                          className="block px-4 py-2 text-sm hover:bg-accent"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign out
                          </div>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-accent"
            onClick={toggleMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 border-t border-border">
            <div className="container mx-auto py-4 space-y-3">
              <Link 
                to="/" 
                className="block py-2 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/movies" 
                className="block py-2 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Movies
              </Link>
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/watchlist" 
                    className="block py-2 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Watchlist
                  </Link>
                  <Link 
                    to="/profile" 
                    className="block py-2 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left py-2 text-red-600 dark:text-red-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </>
              ) : (
                <div className="space-y-3 pt-2">
                  <Link 
                    to="/login" 
                    className="block" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button variant="ghost" fullWidth>
                      Sign in
                    </Button>
                  </Link>
                  <Link 
                    to="/register" 
                    className="block" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button fullWidth>
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      
      <main className="flex-grow container mx-auto py-8 px-6">
        {children}
      </main>
      
      <footer className="bg-background border-t border-border py-6 px-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Movie Application
        </div>
      </footer>
    </div>
  );
}
