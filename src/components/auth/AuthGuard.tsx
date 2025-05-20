
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const AuthGuard = ({ children, requireAdmin = false }: AuthGuardProps) => {
  const location = useLocation();
  const { user, isLoading, isAdmin, checkIsAdmin } = useAuth();
  const [adminChecked, setAdminChecked] = useState<boolean>(!requireAdmin);
  const [hasAdminPermission, setHasAdminPermission] = useState<boolean>(isAdmin);
  const [loading, setLoading] = useState<boolean>(isLoading || requireAdmin);

  // Check if user is an admin when requireAdmin is true
  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (requireAdmin && user) {
        setLoading(true);
        try {
          const isUserAdmin = await checkIsAdmin();
          setHasAdminPermission(isUserAdmin);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setHasAdminPermission(false);
        } finally {
          setAdminChecked(true);
          setLoading(false);
        }
      }
    };

    if (!adminChecked) {
      verifyAdminStatus();
    }
  }, [user, requireAdmin, adminChecked, checkIsAdmin]);
  
  // Still checking authentication status or admin status
  if (isLoading || (requireAdmin && user && !adminChecked)) {
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
  if (requireAdmin && !hasAdminPermission) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If authenticated and passes role check, render children
  return <>{children}</>;
};

export default AuthGuard;
