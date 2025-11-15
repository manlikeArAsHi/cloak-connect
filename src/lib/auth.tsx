import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signUp: (username: string, password: string) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (username: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: `${username}@cloak.app`,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        username,
      });

      await supabase.from('user_roles').insert({
        user_id: data.user.id,
        role: 'user',
      });

      navigate('/home');
    }
  };

  const signIn = async (username: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username}@cloak.app`,
      password,
    });

    if (error) throw error;

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_suspended')
      .eq('id', data.user.id)
      .single();

    if (profile?.is_suspended) {
      await supabase.auth.signOut();
      throw new Error('Your account has been suspended. Please submit an appeal.');
    }

    navigate('/home');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ session, user, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
