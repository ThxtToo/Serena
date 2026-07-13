import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuth, UserRole } from '@/hooks/use-auth';

export function ProtectedRoute({ children, allowedRole }: { children: ReactNode; allowedRole?: UserRole }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-brand-gold rounded-full animate-spin" />
          <p className="font-serif text-primary text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation('/login');
    return null;
  }

  if (allowedRole && user.role !== allowedRole) {
    setLocation(user.role === 'personal' ? '/dashboard' : '/portal');
    return null;
  }

  return <>{children}</>;
}
