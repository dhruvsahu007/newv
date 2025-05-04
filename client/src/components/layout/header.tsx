import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CodeIcon from "@/components/ui/code-icon";
import SearchInput from "@/components/search-input";

const Header = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-[#111827] border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <a className="flex items-center">
                <CodeIcon />
                <span className="ml-2 text-xl font-bold text-white">CodeCast</span>
              </a>
            </Link>

            <nav className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/">
                  <a
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location === "/"
                        ? "text-white bg-[#1f2937]"
                        : "text-gray-300 hover:bg-[#1f2937] hover:text-white"
                    }`}
                  >
                    Explore
                  </a>
                </Link>

                {user && (
                  <>
                    <Link href="/watch-later">
                      <a
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          location === "/watch-later"
                            ? "text-white bg-[#1f2937]"
                            : "text-gray-300 hover:bg-[#1f2937] hover:text-white"
                        }`}
                      >
                        My Library
                      </a>
                    </Link>

                    {(user.role === "creator" || user.role === "admin") && (
                      <Link href="/creator/dashboard">
                        <a
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            location.startsWith("/creator")
                              ? "text-white bg-[#1f2937]"
                              : "text-gray-300 hover:bg-[#1f2937] hover:text-white"
                          }`}
                        >
                          Dashboard
                        </a>
                      </Link>
                    )}

                    {user.role === "admin" && (
                      <Link href="/admin/dashboard">
                        <a
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            location.startsWith("/admin")
                              ? "text-white bg-[#1f2937]"
                              : "text-gray-300 hover:bg-[#1f2937] hover:text-white"
                          }`}
                        >
                          Admin
                        </a>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </nav>
          </div>

          <div className="hidden md:block flex-1 max-w-md mx-6">
            <SearchInput />
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="ml-3 relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-8 w-8 rounded-full" 
                      aria-label="User menu"
                    >
                      <Avatar className="h-8 w-8 bg-primary-700">
                        <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-4 py-3">
                      <p className="text-sm leading-5">Signed in as</p>
                      <p className="text-sm font-medium leading-5 truncate">
                        {user.username}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    {(user.role === "creator" || user.role === "admin") && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/creator/upload">
                            <a className="w-full">Upload Video</a>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/creator/dashboard">
                            <a className="w-full">Dashboard</a>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/account">
                        <a className="w-full">Account Settings</a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center">
                <Link href="/login">
                  <a className="text-gray-300 hover:text-white text-sm font-medium mr-4">
                    Sign in
                  </a>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}

            <button
              onClick={toggleMobileMenu}
              className="ml-4 md:hidden text-gray-400 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-3 space-y-1 bg-[#1f2937]">
            <Link href="/">
              <a
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location === "/"
                    ? "text-white bg-gray-800"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
                onClick={closeMobileMenu}
              >
                Explore
              </a>
            </Link>

            {user && (
              <>
                <Link href="/watch-later">
                  <a
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location === "/watch-later"
                        ? "text-white bg-gray-800"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                    onClick={closeMobileMenu}
                  >
                    My Library
                  </a>
                </Link>

                {(user.role === "creator" || user.role === "admin") && (
                  <>
                    <Link href="/creator/dashboard">
                      <a
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                          location.startsWith("/creator")
                            ? "text-white bg-gray-800"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                        onClick={closeMobileMenu}
                      >
                        Dashboard
                      </a>
                    </Link>
                    <Link href="/creator/upload">
                      <a
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                          location === "/creator/upload"
                            ? "text-white bg-gray-800"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                        onClick={closeMobileMenu}
                      >
                        Upload Video
                      </a>
                    </Link>
                  </>
                )}

                {user.role === "admin" && (
                  <Link href="/admin/dashboard">
                    <a
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        location.startsWith("/admin")
                          ? "text-white bg-gray-800"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                      onClick={closeMobileMenu}
                    >
                      Admin
                    </a>
                  </Link>
                )}

                <div className="border-t border-gray-700 pt-2 mt-2">
                  <p className="px-3 py-2 text-sm text-gray-400">
                    Signed in as {user.username}
                  </p>
                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}

            {!user && (
              <div className="mt-3 flex flex-col space-y-2">
                <Link href="/login">
                  <a
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gray-800 hover:bg-gray-700"
                    onClick={closeMobileMenu}
                  >
                    Sign in
                  </a>
                </Link>
                <Link href="/register">
                  <a
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                    onClick={closeMobileMenu}
                  >
                    Sign up
                  </a>
                </Link>
              </div>
            )}
          </div>

          <div className="px-4 py-3 bg-[#1f2937]">
            <SearchInput />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
