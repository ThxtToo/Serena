import { Switch, Route, Redirect } from 'wouter';
import Login from '@/pages/login';
import Portal from '@/pages/portal';
import Dashboard from '@/pages/dashboard';
import NotFound from '@/pages/not-found';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { AuthProvider, useAuth } from '@/hooks/use-auth';

function RootRedirect() {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Redirect to="/login" />;
  return <Redirect to={user.role === 'personal' ? '/dashboard' : '/portal'} />;
}

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/">
          <RootRedirect />
        </Route>
        
        <Route path="/login" component={Login} />
        
        <Route path="/portal">
          <ProtectedRoute allowedRole="usuario">
            <Portal />
          </ProtectedRoute>
        </Route>
        
        <Route path="/dashboard">
          <ProtectedRoute allowedRole="personal">
            <Dashboard />
          </ProtectedRoute>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </AuthProvider>
  );
}
