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
        {/* Logo Section - Always visible */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity group">
            {/* Logo Container */}
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <GraduationCap className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
              </div>
              {/* Decorative element */}
              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-600 rounded-full"></div>
              </div>
            </div>
            
            {/* School Name - Show on mobile too */}
            <div className="block">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                Saraswati School
              </h1>
              <p className="text-xs text-gray-600 font-medium hidden sm:block">Gochtada</p>
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
            className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu - Fixed positioning and better touch targets */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu Panel */}
          <div
            className="fixed inset-y-0 right-0 z-[9999] w-full max-w-xs bg-white shadow-2xl transform transition-transform duration-300 ease-in-out"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link 
                to="/" 
                className="flex items-center space-x-3" 
                onClick={() => setMobileMenuOpen(false)}
              >
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
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Mobile Navigation - Scrollable */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-1 px-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-4 rounded-xl text-base font-medium transition-all duration-200 touch-manipulation ${
                      location.pathname === item.href
                        ? 'text-white bg-gradient-to-r from-blue-600 to-green-500 shadow-md'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{item.name}</span>
                  </Link>
                ))}
                
                {/* Mobile Admin Link */}
                <div className="border-t border-gray-200 mt-6 pt-4">
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-4 rounded-xl text-base font-medium text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 touch-manipulation"
                  >
                    <Shield className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">Admin Panel</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}