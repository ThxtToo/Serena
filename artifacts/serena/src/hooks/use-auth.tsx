import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useLocation } from 'wouter';

export type UserRole = "personal" | "usuario";

export interface User {
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const session = localStorage.getItem('serena_session');
    if (session) {
      try {
        setUser(JSON.parse(session));
      } catch (e) {
        // ignore
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    if (email === 'admin@serena.com' && pass === 'admin123') {
      const u: User = { email, role: 'personal' };
      localStorage.setItem('serena_session', JSON.stringify(u));
      setUser(u);
      setLocation('/dashboard');
      return true;
    }
    if (email === 'cliente@serena.com' && pass === 'cliente123') {
      const u: User = { email, role: 'usuario' };
      localStorage.setItem('serena_session', JSON.stringify(u));
      setUser(u);
      setLocation('/portal');
      return true;
    }
    throw new Error('Credenciales inválidas');
  };

  const logout = () => {
    localStorage.removeItem('serena_session');
    setUser(null);
    setLocation('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
