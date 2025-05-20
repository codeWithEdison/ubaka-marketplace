
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminStatus = () => {
  const { user, isAdmin, checkIsAdmin } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState<boolean>(isAdmin);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (user) {
        setIsChecking(true);
        try {
          const adminStatus = await checkIsAdmin();
          setIsAdminUser(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdminUser(false);
        } finally {
          setIsChecking(false);
        }
      } else {
        setIsAdminUser(false);
      }
    };

    verifyAdminStatus();
  }, [user, checkIsAdmin]);

  return { isAdmin: isAdminUser, isChecking };
};
