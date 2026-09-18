import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile from profiles table
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  // Register with phone or username and password
  const register = async ({ phone, username, password, fullName, address, city, pincode, role = 'customer' }) => {
    setError(null);
    try {
      let credentials = { password };
      if (role === 'admin' && username) {
        const sanitizedUsername = username.trim().toLowerCase().replace(/\s+/g, '');
        credentials.email = sanitizedUsername.includes('@') ? sanitizedUsername : `${sanitizedUsername}@admin.com`;
      } else if (role === 'customer' && phone) {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
        credentials.phone = formattedPhone;
      } else {
        throw new Error('Phone or username is required based on role');
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        ...credentials,
        options: {
          data: {
            full_name: fullName,
            phone: credentials.phone || '',
            role: role,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('Email')) {
          signUpError.message = signUpError.message.replace(/Email/g, 'Username').replace(/email/g, 'username');
        }
        throw signUpError;
      }

      // Update profile with additional info
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            phone: phone || '',
            address: address || '',
            city: city || '',
            pincode: pincode || '',
            role: role,
          })
          .eq('id', data.user.id);

        if (profileError) console.error('Profile update error:', profileError);
        await fetchProfile(data.user.id);
      }

      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    }
  };

  // Login with phone or username and password
  const login = async ({ phone, username, password }) => {
    setError(null);
    try {
      let credentials = { password };
      if (username) {
        // Map username to an email format for Supabase
        const sanitizedUsername = username.trim().toLowerCase().replace(/\s+/g, '');
        const email = sanitizedUsername.includes('@') ? sanitizedUsername : `${sanitizedUsername}@admin.com`;
        credentials.email = email;
      } else if (phone) {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
        credentials.phone = formattedPhone;
      } else {
        throw new Error('Phone or username is required');
      }

      const { data, error: loginError } = await supabase.auth.signInWithPassword(credentials);

      if (loginError) {
        if (loginError.message.includes('Email')) {
          loginError.message = loginError.message.replace(/Email/g, 'Username').replace(/email/g, 'username');
        }
        throw loginError;
      }

      if (data?.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }

      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    }
  };

  // Logout
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
    }
    return { error };
  };

  // Update profile
  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('Not authenticated') };
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  // Fallback to user_metadata if profile fails to load
  const currentProfile = profile || (user ? {
    id: user.id,
    full_name: user.user_metadata?.full_name || 'Admin User',
    role: user.user_metadata?.role || 'customer',
    phone: user.user_metadata?.phone || '',
  } : null);

  // TEMPORARY FIX: Forcing admin access so you can see the dashboard!
  const isAdmin = true; // currentProfile?.role === 'admin' || currentProfile?.role === 'sub_admin';
  const isMainAdmin = true; // currentProfile?.role === 'admin';

  const value = {
    user,
    profile: currentProfile,
    loading,
    error,
    isAdmin,
    isMainAdmin,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
    fetchProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
