import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAdmin, loading, refreshSession } = useAuth();

  useEffect(() => {
    // Refresh session when component mounts to ensure we have the latest auth state
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    // Show toast if not admin
    if (!loading && user && !isAdmin) {
      toast.error('You do not have admin privileges');
    }
  }, [loading, user, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-subtle-gradient flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
