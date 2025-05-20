
import { useEffect, useState } from "react";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { Loader2, ShieldAlert } from "lucide-react";

interface AdminOnlySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AdminOnlySection = ({ 
  children, 
  fallback = <AdminAccessDenied /> 
}: AdminOnlySectionProps) => {
  const { isAdmin, isChecking } = useAdminStatus();
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    // Add a small delay before showing content to prevent flashing
    let timeout: NodeJS.Timeout;
    if (isAdmin && !isChecking) {
      timeout = setTimeout(() => setShow(true), 100);
    } else {
      setShow(false);
    }
    
    return () => clearTimeout(timeout);
  }, [isAdmin, isChecking]);

  if (isChecking) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Checking permissions...</span>
      </div>
    );
  }

  return show ? <>{children}</> : <>{fallback}</>;
};

const AdminAccessDenied = () => (
  <div className="p-4 border border-amber-200 bg-amber-50 text-amber-800 rounded-md flex items-center">
    <ShieldAlert className="mr-2 h-5 w-5" />
    <span>This section requires admin privileges.</span>
  </div>
);

export default AdminOnlySection;
