import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Users, Calendar, Image, Newspaper, Mail, Shield, GraduationCap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

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
  const location = useLocation();

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-[100] shadow-sm">
      <nav className="container-custom flex items-center justify-between py-3">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity group">
            {/* Logo Container */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              {/* Decorative element */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
              </div>
            </div>
            
            {/* School Name */}
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                Saraswati School
              </h1>
              <p className="text-xs text-gray-600 font-medium">Gochtada</p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-1 lg:justify-center lg:flex-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === item.href
                  ? "text-white bg-gradient-to-r from-blue-600 to-green-500 shadow-md"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Desktop Admin Button */}
        <div className="hidden lg:flex lg:items-center lg:space-x-3">
          <Link to="/admin">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
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
          className={`fixed inset-y-0 right-0 z-[9999] w-full sm:max-w-sm bg-white px-6 py-6 shadow-2xl transform transition-transform duration-200 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="flex items-center space-x-3" onClick={() => setMobileMenuOpen(false)}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                  Saraswati School
                </span>
                <p className="text-xs text-gray-600">Gochtada</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  location.pathname === item.href
                    ? 'text-white bg-gradient-to-r from-blue-600 to-green-500 shadow-md'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
            
            {/* Mobile Admin Link */}
            <div className="border-t border-gray-200 mt-4 pt-4">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-blue-600 hover:bg-blue-50 transition-all duration-200"
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