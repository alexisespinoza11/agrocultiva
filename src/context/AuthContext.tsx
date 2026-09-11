import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  continueAsGuest: () => void;
  requireLogin: () => void;
  setDemoSession: (email: string, fullName: string, role: UserRole, phone?: string) => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const buildProfile = (currentUser: User | null): UserProfile | null => {
    if (!currentUser) return null;
    const meta = currentUser.user_metadata || {};
    return {
      id: currentUser.id,
      email: currentUser.email || '',
      fullName: meta.full_name || meta.name || currentUser.email?.split('@')[0] || 'Productor Agrícola',
      role: (meta.role as UserRole) || 'Agricultor Productor',
      phone: meta.phone || '',
    };
  };

  useEffect(() => {
    // 1. Obtener sesión activa inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setProfile(buildProfile(session?.user ?? null));
      setLoading(false);
    }).catch(err => {
      console.warn('Error fetching Supabase session:', err);
      setLoading(false);
    });

    // 2. Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setProfile(buildProfile(session?.user ?? null));
      if (session?.user) {
        setIsGuest(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const continueAsGuest = () => {
    setIsGuest(true);
  };

  const requireLogin = () => {
    setIsGuest(false);
  };

  const setDemoSession = (email: string, fullName: string, role: UserRole, phone = '') => {
    const demoUser: any = {
      id: 'demo-user-' + Date.now(),
      email,
      user_metadata: {
        full_name: fullName,
        role,
        phone,
      },
    };
    setUser(demoUser);
    setProfile({
      id: demoUser.id,
      email,
      fullName,
      role,
      phone,
    });
    setIsGuest(false);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signOut = async () => {
    try {
      setIsGuest(false);
      setUser(null);
      setSession(null);
      setProfile(null);
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isGuest,
        continueAsGuest,
        requireLogin,
        setDemoSession,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

