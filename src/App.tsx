import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Staff from "./pages/Staff";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import News from "./pages/News";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStaff from "./pages/AdminStaff";
import AdminEvents from "./pages/AdminEvents";
import AdminGallery from "./pages/AdminGallery";
import AdminNews from "./pages/AdminNews";
import AdminAchievements from "./pages/AdminAchievements";
import AdminInquiries from "./pages/AdminInquiries";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/events" element={<Events />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/news" element={<News />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/staff" 
              element={
                <ProtectedRoute>
                  <AdminStaff />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events" 
              element={
                <ProtectedRoute>
                  <AdminEvents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/gallery" 
              element={
                <ProtectedRoute>
                  <AdminGallery />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/news" 
              element={
                <ProtectedRoute>
                  <AdminNews />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/achievements" 
              element={
                <ProtectedRoute>
                  <AdminAchievements />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/inquiries" 
              element={
                <ProtectedRoute>
                  <AdminInquiries />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
