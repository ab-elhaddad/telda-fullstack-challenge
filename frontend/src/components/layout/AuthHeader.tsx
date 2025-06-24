import { useState, useEffect, ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface AuthHeaderProps {
  children: ReactNode;
}

export function AuthHeader({ children }: AuthHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user: data, isAuthenticated } = useAuthStore();
  // @ts-ignore
  const user = data?.user as User;
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
    };

    if (isMenuOpen || isUserMenuOpen) {
      document.addEventListener("click", handleOutsideClick);
      return () => document.removeEventListener("click", handleOutsideClick);
    }
  }, [isMenuOpen, isUserMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Toggle mobile menu
  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
    setIsUserMenuOpen(false);
  };

  // Toggle user menu
  const toggleUserMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsUserMenuOpen((prev) => !prev);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 w-full bg-gradient-to-b from-black via-black/80 to-transparent shadow-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="text-2xl font-extrabold tracking-tight text-primary">
              M
            </span>
            <span className="hidden sm:inline text-white font-medium">
              MovieHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6">
            <NavLink to="/" isActive={location.pathname === "/"}>
              Home
            </NavLink>
            <NavLink
              to="/movies"
              isActive={location.pathname.startsWith("/movies")}
            >
              Movies
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/watchlist"
                  isActive={location.pathname === "/watchlist"}
                >
                  My Watchlist
                </NavLink>

                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={toggleUserMenu}
                    className="flex items-center gap-2 text-white bg-transparent hover:bg-gray-800/60"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    aria-label="User menu"
                  >
                    <span className="max-w-[100px] truncate font-medium">
                      {user?.username || "User"}
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

                  {isUserMenuOpen && <UserMenu onLogout={handleLogout} />}
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register" className="hidden sm:inline-flex">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              onClick={toggleMenu}
              className="-mr-2 p-2 text-white hover:bg-gray-800/60"
            >
              <span className="sr-only">Toggle menu</span>
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
                className={cn(isMenuOpen ? "hidden" : "block")}
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
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
                className={cn(isMenuOpen ? "block" : "hidden")}
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </Button>

            {isAuthenticated && (
              <Button
                variant="ghost"
                onClick={toggleUserMenu}
                className="flex items-center gap-2 text-white bg-transparent hover:bg-gray-800/60"
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
          <div className="absolute left-0 right-0 top-16 z-50 border-b border-gray-800 bg-black/95 p-4 shadow-lg">
            <nav className="flex flex-col space-y-1">
              <MobileNavLink to="/" isActive={location.pathname === "/"}>
                Home
              </MobileNavLink>
              <MobileNavLink
                to="/movies"
                isActive={location.pathname.startsWith("/movies")}
              >
                Movies
              </MobileNavLink>

              {isAuthenticated && (
                <MobileNavLink
                  to="/watchlist"
                  isActive={location.pathname === "/watchlist"}
                >
                  My Watchlist
                </MobileNavLink>
              )}

              {!isAuthenticated && (
                <>
                  <MobileNavLink
                    to="/login"
                    isActive={location.pathname === "/login"}
                  >
                    Login
                  </MobileNavLink>
                  <MobileNavLink
                    to="/register"
                    isActive={location.pathname === "/register"}
                  >
                    Sign Up
                  </MobileNavLink>
                </>
              )}
            </nav>
          </div>
        )}

        {/* Mobile User Menu */}
        {isMobile && isUserMenuOpen && isAuthenticated && (
          <div className="absolute left-0 right-0 top-16 z-50 border-b border-gray-800 bg-black/95 p-4 shadow-lg">
            <div className="flex flex-col gap-2">
              <div className="mb-2 py-2">
                <p className="font-medium">
                  {user?.name || user?.username || "User"}
                </p>
                <p className="text-sm text-gray-500">{user?.email || ""}</p>
              </div>

              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Profile
              </Link>

              <Button
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start bg-primary/90 hover:bg-primary text-white"
              >
                Sign out
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow container mx-auto py-8 px-6">{children}</main>
    </div>
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
        "text-sm font-medium transition-colors hover:text-white",
        isActive ? "text-white" : "text-gray-300"
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
        "block w-full px-4 py-2 text-sm font-medium hover:bg-gray-800/60",
        isActive ? "bg-gray-800/80 text-white" : "bg-transparent text-gray-300"
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
    <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-gray-800 bg-black shadow-lg">
      <div className="p-2">
        <Link
          to="/profile"
          className="flex items-center rounded-md px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          Profile
        </Link>
        <Link
          to="/watchlist"
          className="flex items-center rounded-md px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          My Watchlist
        </Link>
        <button
          onClick={onLogout}
          className="flex w-full items-center rounded-md px-4 py-2 text-left text-sm text-primary hover:bg-gray-800 hover:text-primary/80 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
