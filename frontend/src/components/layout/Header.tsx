import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/utils/cn';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * Main application header with responsive navigation and user authentication controls
 */
export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
    };
    
    if (isMenuOpen || isUserMenuOpen) {
      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }
  }, [isMenuOpen, isUserMenuOpen]);
  
  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Toggle mobile menu
  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
    setIsUserMenuOpen(false);
  };
  
  // Toggle user menu
  const toggleUserMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsUserMenuOpen(prev => !prev);
    setIsMenuOpen(false);
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="m2 2 20 20" />
            <path d="M12 12v6" />
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          <span className="hidden sm:inline">MovieHub</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6">
          <NavLink to="/" isActive={location.pathname === '/'}>
            Home
          </NavLink>
          
          {isAuthenticated && (
            <NavLink to="/watchlist" isActive={location.pathname === '/watchlist'}>
              My Watchlist
            </NavLink>
          )}
        </nav>
        
        {/* Desktop Auth Actions */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          {isAuthenticated ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleUserMenu}
                className="flex items-center gap-2"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <span className="max-w-[100px] truncate font-medium">
                  {user?.name || 'User'}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    "transition-transform",
                    isUserMenuOpen ? "rotate-180" : ""
                  )}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Button>
              
              {isUserMenuOpen && (
                <UserMenu onLogout={handleLogout} />
              )}
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/register" className="hidden sm:inline-flex">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
          </Button>
          
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleUserMenu}
              aria-expanded={isUserMenuOpen}
              aria-label="User menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobile && isMenuOpen && (
        <div className="border-t md:hidden">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col gap-2">
              <MobileNavLink to="/" isActive={location.pathname === '/'}>
                Home
              </MobileNavLink>
              
              {isAuthenticated && (
                <MobileNavLink to="/watchlist" isActive={location.pathname === '/watchlist'}>
                  My Watchlist
                </MobileNavLink>
              )}
              
              {!isAuthenticated && (
                <>
                  <MobileNavLink to="/login" isActive={location.pathname === '/login'}>
                    Login
                  </MobileNavLink>
                  <MobileNavLink to="/register" isActive={location.pathname === '/register'}>
                    Sign Up
                  </MobileNavLink>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
      
      {/* Mobile User Menu */}
      {isMobile && isUserMenuOpen && isAuthenticated && (
        <div className="border-t md:hidden">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col gap-2">
              <div className="mb-2 py-2">
                <p className="font-medium">{user?.name || 'User'}</p>
                <p className="text-sm text-gray-500">{user?.email || ''}</p>
              </div>
              
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Profile
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  isActive?: boolean;
}

function NavLink({ to, children, isActive }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, children, isActive }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800",
        isActive ? "font-medium text-primary" : "text-foreground"
      )}
    >
      {children}
    </Link>
  );
}

interface UserMenuProps {
  onLogout: () => void;
}

function UserMenu({ onLogout }: UserMenuProps) {
  return (
    <div className="absolute right-0 top-full mt-2 w-48 rounded-md border bg-background shadow-md">
      <div className="p-2">
        <Link
          to="/profile"
          className="flex items-center rounded-md px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Profile
        </Link>
        <Link
          to="/watchlist"
          className="flex items-center rounded-md px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          My Watchlist
        </Link>
        <button
          onClick={onLogout}
          className="flex w-full items-center rounded-md px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
