
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const AuthGuard = ({ children, requireAdmin = false }: AuthGuardProps) => {
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(false);

  // Check if user is an admin when requireAdmin is true
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (requireAdmin && user) {
        setCheckingAdmin(true);
        try {
          const { data } = await supabase
            .from('user_roles')
            .select()
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle();
          
          setIsAdmin(!!data);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } finally {
          setCheckingAdmin(false);
        }
      }
    };

    checkAdminStatus();
  }, [user, requireAdmin]);
  
  // Still checking authentication status
  if (isLoading || (requireAdmin && user && checkingAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <span className="mt-4 block text-muted-foreground">
            {isLoading ? "Verifying authentication..." : "Checking permissions..."}
          </span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to sign-in page
  if (!user) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  // If admin access required but user is not an admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If authenticated and passes role check, render children
  return <>{children}</>;
};

export default AuthGuard;
