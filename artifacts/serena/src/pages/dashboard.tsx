import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  LogOut, ClipboardList, ShieldCheck, Package, FileText, Bot, Database
} from 'lucide-react';

import IngestaCasos from './dashboard/ingesta-casos';
import VerificacionPolizas from './dashboard/verificacion-polizas';
import StockLogistica from './dashboard/stock-logistica';
import GeneradorOrdenes from './dashboard/generador-ordenes';
import AgenteSerena from './dashboard/agente-serena';
import RegistroEvaluacion from './dashboard/registro-evaluacion';

export default function Dashboard() {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('ingesta');

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-hidden bg-background md:h-screen md:flex-row">
      {/* Sidebar */}
      <aside className="z-20 flex max-h-[42dvh] w-full flex-col border-b border-sidebar-border bg-sidebar md:max-h-none md:w-64 md:flex-none md:border-b-0 md:border-r">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground">
          <div className="w-8 h-8 rounded bg-brand-gold flex items-center justify-center text-primary font-serif font-bold text-lg mr-3">
            S
          </div>
          <h1 className="font-serif text-xl tracking-tight">Serena</h1>
        </div>
        
        <div className="flex-1 space-y-1 overflow-y-auto px-3 py-3 md:py-6">
          <p className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
            Operaciones
          </p>
          
          <button 
            onClick={() => setActiveTab('ingesta')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
              activeTab === 'ingesta' 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Ingesta de Casos
          </button>
          
          <button 
            onClick={() => setActiveTab('polizas')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
              activeTab === 'polizas' 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Verificación de Pólizas
          </button>
          
          <button 
            onClick={() => setActiveTab('stock')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
              activeTab === 'stock' 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <Package className="w-4 h-4" />
            Stock y Logística
          </button>
          
          <button 
            onClick={() => setActiveTab('ordenes')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
              activeTab === 'ordenes' 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Generador de Órdenes
          </button>

          <button
            onClick={() => setActiveTab('registro')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
              activeTab === 'registro'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
            data-testid="tab-registro-evaluacion"
          >
            <Database className="w-4 h-4" />
            Registro y evaluación
          </button>

          <p className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mt-6 mb-2">
            Asistencia AI
          </p>
          
          <button 
            onClick={() => setActiveTab('agente')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
              activeTab === 'agente' 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground relative overflow-hidden' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            {activeTab === 'agente' && (
              <div className="absolute inset-0 bg-brand-gold/10 -z-10" />
            )}
            <Bot className={`w-4 h-4 ${activeTab === 'agente' ? 'text-brand-gold' : ''}`} />
            Agente Serena
          </button>
        </div>

        <div className="hidden border-t border-sidebar-border p-4 md:block">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
              {user?.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.email}</p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent" onClick={logout} data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-muted/20 md:h-screen">
        <header className="flex h-16 shrink-0 items-center border-b border-border bg-card px-4 md:px-8">
          <h2 className="text-xl font-serif text-primary tracking-tight">
            {activeTab === 'ingesta' && 'Ingesta de Casos'}
            {activeTab === 'polizas' && 'Verificación de Pólizas'}
            {activeTab === 'stock' && 'Stock y Logística'}
            {activeTab === 'ordenes' && 'Generador de Órdenes'}
            {activeTab === 'agente' && 'Agente Serena AI'}
            {activeTab === 'registro' && 'Registro y evaluación'}
          </h2>
        </header>
        
        <div className="relative flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto pb-12">
            {activeTab === 'ingesta' && <IngestaCasos />}
            {activeTab === 'polizas' && <VerificacionPolizas />}
            {activeTab === 'stock' && <StockLogistica />}
            {activeTab === 'ordenes' && <GeneradorOrdenes />}
            {activeTab === 'agente' && <AgenteSerena />}
            {activeTab === 'registro' && <RegistroEvaluacion />}
          </div>
        </div>
      </main>
    </div>
  );
}
