import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Home, 
  Calendar, 
  ChevronsUpDown, 
  ChefHat,
  ShoppingBag,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();

  // Main navigation links for guests
  const guestNavLinks = [
    { href: "/#how-it-works", label: "How it works" },
    { href: "/#chefs", label: "Our Chefs" },
    { href: "/#menus", label: "Menus" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#contact", label: "Contact" },
  ];

  // Client specific links
  const clientNavLinks = [
    { href: "/", label: "Home" },
    { href: "/#chefs", label: "Browse Chefs" },
    { href: "/client/bookings", label: "My Bookings" },
  ];

  // Provider specific links
  const providerNavLinks = [
    { href: "/", label: "Home" },
    { href: "/provider/dashboard", label: "Dashboard" },
    { href: "/provider/services", label: "My Services" },
  ];

  // Get the correct nav links based on user role
  const navLinks = user 
    ? (user.role === "client" ? clientNavLinks : user.role === "provider" ? providerNavLinks : guestNavLinks)
    : guestNavLinks;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return "?";
    if (user.fullname) {
      return user.fullname.split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <a className="text-2xl font-bold text-primary">YumMatch</a>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-6 items-center">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a className="font-medium text-neutral-800 hover:text-primary transition-all">
                  {link.label}
                </a>
              </Link>
            ))}
            
            {!user ? (
              <>
                <Link href="/auth">
                  <a className="ml-4 py-2 px-4 bg-white text-primary border border-primary rounded-full hover:bg-primary hover:text-white transition-all">
                    Log in
                  </a>
                </Link>
                <Link href="/auth">
                  <a className="py-2 px-6 bg-primary text-white rounded-full hover:bg-opacity-90 transition-all font-medium">
                    Book a Chef
                  </a>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {/* Action button based on role */}
                {user.role === "client" && (
                  <Link href="/client/bookings">
                    <a className="py-2 px-4 bg-primary text-white rounded-full hover:bg-opacity-90 transition-all font-medium flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      My Bookings
                    </a>
                  </Link>
                )}
                
                {user.role === "provider" && (
                  <Link href="/provider/dashboard">
                    <a className="py-2 px-4 bg-primary text-white rounded-full hover:bg-opacity-90 transition-all font-medium flex items-center">
                      <ChefHat className="w-4 h-4 mr-2" />
                      Dashboard
                    </a>
                  </Link>
                )}
                
                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarImage src={user.profileImage || ""} alt={user.username} />
                        <AvatarFallback className="bg-primary text-white">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="flex flex-col">
                      <span className="font-bold">{user.fullname || user.username}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === "client" && (
                      <>
                        <DropdownMenuItem onClick={() => setLocation("/client/dashboard")}>
                          <Home className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation("/client/bookings")}>
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>My Bookings</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    {user.role === "provider" && (
                      <>
                        <DropdownMenuItem onClick={() => setLocation("/provider/dashboard")}>
                          <Home className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation("/provider/services")}>
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          <span>My Services</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80">
              <div className="flex flex-col space-y-4 mt-8">
                {user && (
                  <div className="flex items-center space-x-3 mb-6 pb-6 border-b">
                    <Avatar>
                      <AvatarImage src={user.profileImage || ""} alt={user.username} />
                      <AvatarFallback className="bg-primary text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.fullname || user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                )}
                
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <a 
                      className="font-medium text-neutral-800 hover:text-primary transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </a>
                  </Link>
                ))}
                
                {/* Additional role-specific links */}
                {user && user.role === "client" && (
                  <>
                    <Link href="/profile">
                      <a 
                        className="font-medium text-neutral-800 hover:text-primary transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        My Profile
                      </a>
                    </Link>
                    <Link href="/settings">
                      <a 
                        className="font-medium text-neutral-800 hover:text-primary transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        Settings
                      </a>
                    </Link>
                  </>
                )}
                
                {user && user.role === "provider" && (
                  <>
                    <Link href="/profile">
                      <a 
                        className="font-medium text-neutral-800 hover:text-primary transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        My Profile
                      </a>
                    </Link>
                    <Link href="/settings">
                      <a 
                        className="font-medium text-neutral-800 hover:text-primary transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        Settings
                      </a>
                    </Link>
                  </>
                )}
                
                <div className="flex flex-col space-y-2 pt-2">
                  {!user ? (
                    <>
                      <Link href="/auth">
                        <a 
                          className="py-2 px-4 text-center bg-white text-primary border border-primary rounded-full hover:bg-primary hover:text-white transition-all"
                          onClick={() => setIsOpen(false)}
                        >
                          Log in
                        </a>
                      </Link>
                      <Link href="/auth">
                        <a 
                          className="py-2 px-4 text-center bg-primary text-white rounded-full hover:bg-opacity-90 transition-all font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          Book a Chef
                        </a>
                      </Link>
                    </>
                  ) : (
                    <Button 
                      variant="destructive" 
                      className="mt-6"
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {logoutMutation.isPending ? "Logging out..." : "Logout"}
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
