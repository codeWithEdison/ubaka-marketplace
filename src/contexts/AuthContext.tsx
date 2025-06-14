import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { hasRole, createProfileIfNotExists } from '@/lib/auth';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: any | null;  // Will be typed properly once we have a profile type
  isLoading: boolean;
  isAdmin: boolean;
  checkIsAdmin: () => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string, meta?: { first_name?: string; last_name?: string }) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<any>) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile if user is authenticated
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            checkAdminStatus();
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
        
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
        checkAdminStatus();
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProfile(data);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    }
  };

  const checkAdminStatus = async () => {
    const adminStatus = await hasRole('admin');
    setIsAdmin(adminStatus);
    return adminStatus;
  };

  const checkIsAdmin = async () => {
    return await checkAdminStatus();
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    
    if (response.error) {
      toast({
        title: "Sign in failed",
        description: response.error.message,
        variant: "destructive",
      });
      return { error: response.error, data: null };
    }
    
    // Create profile if it doesn't exist
    await createProfileIfNotExists();
    
    toast({
      title: "Sign in successful",
      description: "Welcome back!",
    });
    
    return { error: null, data: response.data.session };
  };

  const signUp = async (email: string, password: string, meta?: { first_name?: string; last_name?: string }) => {
    setIsLoading(true);
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: meta,
      }
    });
    setIsLoading(false);
    
    if (response.error) {
      toast({
        title: "Sign up failed",
        description: response.error.message,
        variant: "destructive",
      });
      return { error: response.error, data: null };
    }
    
    toast({
      title: "Sign up successful",
      description: "Welcome to Ubaka!",
    });
    
    return { error: null, data: response.data.session };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth/sign-in');
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  const updateProfile = async (updates: Partial<any>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;

      setProfile({
        ...profile,
        ...updates,
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Profile update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    isAdmin,
    checkIsAdmin,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
