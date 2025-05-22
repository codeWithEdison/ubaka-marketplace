import { supabase } from '@/integrations/supabase/client';

/**
 * Check if the current user has a specific role
 * @param role The role to check for ('admin', 'moderator', 'user')
 * @returns Promise that resolves to a boolean indicating if user has the role
 */
export const hasRole = async (role: 'admin' | 'moderator' | 'user'): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_user_role', { input_role: role });

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
export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
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

/**
 * Create a profile for the current user if it doesn't exist
 * @returns Promise that resolves to the profile data
 */
export const createProfileIfNotExists = async () => {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (existingProfile) {
    return existingProfile;
  }

  // Create new profile
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        email: (await supabase.auth.getUser()).data.user?.email || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  return newProfile;
};
