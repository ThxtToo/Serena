import { Switch, Route } from 'wouter';
import Login from '@/pages/login';
import Portal from '@/pages/portal';
import Dashboard from '@/pages/dashboard';
import AgentChat from '@/pages/agent-chat';
import StockPage from '@/pages/stock';
import NotFound from '@/pages/not-found';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { AuthProvider } from '@/hooks/use-auth';

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/" component={AgentChat} />
        <Route path="/stock">
          <ProtectedRoute allowedRole="personal">
            <StockPage />
          </ProtectedRoute>
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
