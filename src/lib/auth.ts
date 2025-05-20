
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if the current user has a specific role
 * @param role The role to check for ('admin', 'moderator', 'user')
 * @returns Promise that resolves to a boolean indicating if user has the role
 */
export const hasRole = async (role: 'admin' | 'moderator' | 'user'): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('has_role', { role });
    
    if (error) {
      console.error('Error checking role:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};

/**
 * Checks if the current user is an admin
 * @returns Promise that resolves to a boolean indicating if user is admin
 */
export const isAdmin = async (): Promise<boolean> => {
  return await hasRole('admin');
};

/**
 * Checks if the current user is authenticated
 * @returns Boolean indicating if the user is logged in
 */
export const isAuthenticated = (): boolean => {
  return !!supabase.auth.getUser();
};

/**
 * Get the current user's ID 
 * @returns The user ID if authenticated, null otherwise
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return data.user.id;
};
