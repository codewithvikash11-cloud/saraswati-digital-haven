import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, Users, Calendar, Image, Newspaper, Mail, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navigation = [
  { name: "Home", href: "/", icon: BookOpen },
  { name: "Staff", href: "/staff", icon: Users },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Gallery", href: "/gallery", icon: Image },
  { name: "News", href: "/news", icon: Newspaper },
  { name: "Contact", href: "/contact", icon: Mail },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-background/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-[100]">
      <nav className="container-custom flex items-center justify-between py-4">
        <div className="flex lg:flex-1">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-hero-gradient rounded-lg flex items-center justify-center shadow-soft">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Saraswati School</h1>
              <p className="text-xs text-muted-foreground">Excellence in Education</p>
            </div>
          </Link>
        </div>

        <div className="flex lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="hidden lg:flex lg:gap-x-8 lg:justify-center lg:flex-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === item.href
                  ? "text-primary bg-primary/10 shadow-soft"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link to="/admin">
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white">
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </Link>
        </div>
      </nav>

      {/* Mobile menu (always mounted to avoid render timing issues) */}
      <div className="lg:hidden">
        <div
          className={`fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
            mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        <div
          className={`fixed inset-y-0 right-0 z-[9999] w-full sm:max-w-sm bg-background px-6 py-6 shadow-large transform transition-transform duration-200 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3" onClick={() => setMobileMenuOpen(false)}>
              <div className="w-8 h-8 bg-hero-gradient rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gradient">Saraswati School</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-6 flow-root">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    location.pathname === item.href
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground hover:bg-primary/5'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-primary hover:bg-primary/5 border-t border-border/50 mt-4 pt-6"
              >
                <Shield className="h-5 w-5" />
                <span>Admin Panel</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}