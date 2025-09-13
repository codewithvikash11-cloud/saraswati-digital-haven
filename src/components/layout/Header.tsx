import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Users, Calendar, Image, Newspaper, Mail, Shield, GraduationCap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/", icon: GraduationCap },
  { name: "Staff", href: "/staff", icon: Users },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Gallery", href: "/gallery", icon: Image },
  { name: "News", href: "/news", icon: Newspaper },
  { name: "Contact", href: "/contact", icon: Mail },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className={cn(
      "bg-background/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-[100] transition-all duration-300",
      isScrolled ? "shadow-lg bg-background/98" : "shadow-sm"
    )}>
      <nav className="container-custom flex items-center justify-between py-3">
        {/* Logo Section - Always visible */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-all duration-200 group min-w-0">
            {/* Logo Container */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                <img 
                  src="/logo.svg" 
                  alt="Saraswati School Logo" 
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </div>
            
            {/* School Name - Responsive text */}
            <div className="block min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gradient truncate">
                Saraswati School
              </h1>
              <p className="text-xs text-muted-foreground font-medium hidden sm:block">Gochtada</p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-1 lg:justify-center lg:flex-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group",
                  isActive
                    ? "text-white bg-hero-gradient shadow-md"
                    : "text-foreground hover:text-primary hover:bg-accent/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
                {!isActive && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop Admin Button and Theme Toggle */}
        <div className="hidden lg:flex lg:items-center lg:space-x-3">
          <ThemeToggle />
          <Link to="/admin">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button and Theme Toggle */}
        <div className="flex lg:hidden items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent p-2 transition-all duration-200"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu - Enhanced with animations */}
      <div className={cn(
        "lg:hidden fixed inset-0 z-[9998] transition-all duration-300",
        mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
      )}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
          
        {/* Mobile Menu Panel */}
        <div
          className={cn(
            "fixed inset-y-0 right-0 z-[9999] w-full max-w-xs bg-background shadow-xl flex flex-col transition-transform duration-300 ease-in-out",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <img 
                    src="/logo.svg" 
                    alt="Saraswati School Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-lg font-bold text-gradient">
                  Saraswati School
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-accent p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="flex flex-col space-y-1">
              {navigation.map((item, index) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 transform",
                      isActive
                        ? "text-white bg-hero-gradient shadow-md"
                        : "text-foreground hover:text-primary hover:bg-accent/50 hover:translate-x-1"
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: mobileMenuOpen ? 'slideInRight 0.3s ease-out forwards' : 'none'
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
            
          <div className="p-4 border-t border-border/50 flex items-center justify-center">
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}