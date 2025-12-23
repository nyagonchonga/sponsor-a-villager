import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { Menu, User, LogOut, Settings, Heart } from "lucide-react";

export default function Navigation() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
    setIsMenuOpen(false);
  };

  const getDisplayName = () => {
    if (user?.firstName || user?.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Villagers', href: '/#villagers' },
    { label: 'Impact', href: '/impact' },
    { label: 'About', href: '/#about' },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="flex-shrink-0"
              data-testid="logo-button"
            >
              <h1 className="text-2xl font-bold text-kenya-red font-serif">
                Sponsor a Villager
              </h1>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="text-gray-700 hover:text-kenya-red px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  data-testid={`nav-link-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                {user.role === 'sponsor' && (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/sponsor-portal')}
                    data-testid="button-sponsor-portal"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Sponsor Portal
                  </Button>
                )}

                {user.role === 'villager' && (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/villager-portal')}
                    data-testid="button-villager-portal"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Villager Portal
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="user-menu-trigger">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profileImageUrl || undefined} alt={getDisplayName()} />
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium" data-testid="user-display-name">{getDisplayName()}</p>
                        <p className="text-xs text-muted-foreground" data-testid="user-email">
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize" data-testid="user-role">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => navigate('/')}
                      data-testid="menu-item-dashboard"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => window.location.href = "/api/logout"}
                      data-testid="menu-item-logout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  data-testid="button-login"
                >
                  <User className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button
                  className="bg-kenya-red text-white hover:bg-red-700"
                  onClick={() => handleNavClick('#villagers')}
                  data-testid="button-sponsor-now"
                >
                  Sponsor Now
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="mobile-menu-trigger">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Navigation Links */}
                  {navItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className="text-left text-gray-700 hover:text-kenya-red px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      data-testid={`mobile-nav-link-${item.label.toLowerCase()}`}
                    >
                      {item.label}
                    </button>
                  ))}

                  <div className="border-t pt-4">
                    {isAuthenticated && user ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 px-3 py-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profileImageUrl || undefined} alt={getDisplayName()} />
                            <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm" data-testid="mobile-user-name">{getDisplayName()}</p>
                            <p className="text-xs text-gray-500 capitalize" data-testid="mobile-user-role">{user.role}</p>
                          </div>
                        </div>

                        {user.role === 'sponsor' && (
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                              navigate('/sponsor-portal');
                              setIsMenuOpen(false);
                            }}
                            data-testid="mobile-button-sponsor-portal"
                          >
                            <Heart className="mr-2 h-4 w-4" />
                            Sponsor Portal
                          </Button>
                        )}

                        {user.role === 'villager' && (
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                              navigate('/villager-portal');
                              setIsMenuOpen(false);
                            }}
                            data-testid="mobile-button-villager-portal"
                          >
                            <User className="mr-2 h-4 w-4" />
                            Villager Portal
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => window.location.href = "/api/logout"}
                          data-testid="mobile-button-logout"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate('/auth')}
                          data-testid="mobile-button-login"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Login
                        </Button>
                        <Button
                          className="w-full bg-kenya-red text-white hover:bg-red-700"
                          onClick={() => {
                            handleNavClick('#villagers');
                            setIsMenuOpen(false);
                          }}
                          data-testid="mobile-button-sponsor-now"
                        >
                          Sponsor Now
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
