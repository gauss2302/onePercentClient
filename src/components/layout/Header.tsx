"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Added for redirect
import { useState, useEffect, useRef } from "react";

import { cn, ROUTES } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";
import { api } from "@/lib/api/api-client";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Header() {
  const router = useRouter();

  // Zustand Store
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // UI State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Hydration Fix: Prevent server/client HTML mismatch
  const [isMounted, setIsMounted] = useState(false);

  // Click outside handler for dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);

    // Optional: Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      // 1. Call Backend to kill the HttpOnly Cookie
      await api.post("/auth/logout", {});
    } catch (error) {
      console.error("Logout API failed, cleaning client state anyway:", error);
    } finally {
      // 2. Clear Zustand & LocalStorage
      logout();

      // 3. Reset UI
      setIsMobileMenuOpen(false);
      setIsUserDropdownOpen(false);

      // 4. Redirect
      router.push(ROUTES.LOGIN || "/auth/login");
    }
  };

  // Prevent Hydration Mismatch: Render a simple generic state until client loads
  // Or simply don't render the user-specific parts until mounted.
  if (!isMounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          {/* Static Logo only during loading */}
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            1%
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href={ROUTES.HOME || "/"}
              className="flex items-center space-x-2 text-xl font-bold text-primary hover:text-primary/90 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                1%
              </div>
              <span className="hidden xs:block">OnePercent</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href={ROUTES.HOME || "/"}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>

            {/* FIXED LOGIC: Show these only if user IS logged in */}
            {user && (
              <>
                <Link
                  href={ROUTES.DASHBOARD || "/dashboard"}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href={ROUTES.SKILLS || "/skills"}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Skills
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 rounded-full bg-secondary p-1.5 hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {user.picture ? (
                    <Image
                      src={user.picture}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <svg
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isUserDropdownOpen && "rotate-180"
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Desktop Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-popover border border-border z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm border-b border-border bg-muted/50">
                        <p className="font-medium text-foreground truncate">
                          {user.name}
                        </p>
                        <p className="text-muted-foreground text-xs truncate">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        href={ROUTES.PROFILE || "/profile"}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Profile
                      </Link>

                      <Link
                        href={ROUTES.SETTINGS || "/settings"}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Settings
                      </Link>

                      <div className="border-t border-border my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href={ROUTES.LOGIN || "/auth/login"}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden animate-in slide-in-from-top-5 duration-200">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border bg-background shadow-inner">
              <Link
                href={ROUTES.HOME || "/"}
                className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>

              {user && (
                <>
                  <Link
                    href={ROUTES.DASHBOARD || "/dashboard"}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={ROUTES.SKILLS || "/skills"}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Skills
                  </Link>

                  <div className="my-2 border-t border-border"></div>

                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Account
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.name}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              )}

              {!user && (
                <Link
                  href={ROUTES.LOGIN || "/auth/login"}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-primary hover:bg-accent transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
