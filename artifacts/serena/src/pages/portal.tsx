import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LogOut, Search, PhoneCall, MessageCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useGetPolicyByCedula, getGetPolicyByCedulaQueryKey } from '@workspace/api-client-react';

const STAGES = [
  "Registro del Caso",
  "Traslado en Progreso",
  "Preparación y Cuidado",
  "Capilla Asignada",
  "Servicio Completado"
];

export default function Portal() {
  const { logout, user } = useAuth();
  const [cedula, setCedula] = useState('');
  const [searchCedula, setSearchCedula] = useState('');

  const { data: policy, isLoading, isError, error } = useGetPolicyByCedula(searchCedula, {
    query: {
      enabled: !!searchCedula,
      queryKey: getGetPolicyByCedulaQueryKey(searchCedula)
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cedula.trim()) {
      setSearchCedula(cedula.trim());
    }
  };

  const currentStage = 1; // "Traslado en Progreso" (0-indexed)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground border-b border-primary/20 sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-primary font-serif font-bold text-lg">
              S
            </div>
            <h1 className="font-serif text-xl tracking-tight">Serena Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-80 hidden md:block">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="hover:bg-primary-foreground/10 text-primary-foreground" data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Estatus del Servicio */}
        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-primary border-b pb-2">Estatus del Servicio</h2>
          <Card className="border-border/50 shadow-sm bg-card overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="relative">
                <div className="absolute left-[15px] md:left-auto md:top-[15px] md:right-0 md:w-full h-full md:h-0.5 bg-border z-0" />
                <div className="absolute left-[15px] md:left-0 md:top-[15px] h-1/2 md:h-0.5 md:w-2/5 bg-brand-gold z-0 transition-all duration-500" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 md:gap-0">
                  {STAGES.map((stage, index) => {
                    const isCompleted = index < currentStage;
                    const isActive = index === currentStage;
                    const isPending = index > currentStage;

                    return (
                      <div key={stage} className="flex md:flex-col items-center gap-4 md:gap-3 group">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-300
                          ${isCompleted ? 'bg-brand-gold border-brand-gold text-primary' : 
                            isActive ? 'bg-background border-brand-gold text-brand-gold ring-4 ring-brand-gold/20' : 
                            'bg-background border-border text-muted-foreground'}`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-sm font-medium">{index + 1}</span>}
                        </div>
                        <div className="md:text-center">
                          <p className={`text-sm md:text-xs font-medium uppercase tracking-wider ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                            {stage}
                          </p>
                          {isActive && (
                            <p className="text-xs text-brand-gold mt-1">Fase actual</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Consulta de Póliza */}
          <section className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-serif text-primary border-b pb-2">Consulta de Póliza</h2>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardDescription>
                  Verifique la cobertura ingresando el número de cédula del titular.
                </CardDescription>
                <form onSubmit={handleSearch} className="flex gap-3 pt-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Ej: V-14555666" 
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      className="pl-9"
                      data-testid="input-policy-search"
                    />
                  </div>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" data-testid="button-policy-search">Consultar</Button>
                </form>
              </CardHeader>
              
              {isLoading && (
                <CardContent>
                  <div className="flex justify-center p-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-brand-gold rounded-full animate-spin" />
                  </div>
                </CardContent>
              )}

              {isError && (
                <CardContent>
                  <div className="p-4 bg-destructive/5 text-destructive border border-destructive/20 rounded-md text-sm">
                    No se encontró ninguna póliza para la cédula proporcionada o hubo un error.
                  </div>
                </CardContent>
              )}

              {policy && (
                <CardContent className="pt-0">
                  <div className="border border-border/60 rounded-lg p-5 bg-muted/20 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Titular</p>
                        <h3 className="text-lg font-serif font-medium text-primary">{policy.titular}</h3>
                        <p className="text-sm text-muted-foreground">{policy.cedula}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        policy.estatus.toLowerCase() === 'solvente' 
                          ? 'bg-green-500/10 text-green-700 border-green-500/20' 
                          : 'bg-destructive/10 text-destructive border-destructive/20'
                      }`}>
                        {policy.estatus.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50 my-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Aseguradora</p>
                        <p className="font-medium text-sm mt-1 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-brand-gold" />
                          {policy.aseguradora}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Plan</p>
                        <p className="font-medium text-sm mt-1">{policy.plan}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Límite</p>
                        <p className="font-medium text-sm mt-1 text-primary">${policy.limite_usd.toLocaleString()}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Cobertura</p>
                      <ul className="space-y-2">
                        {policy.cobertura.map((item, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </section>

          {/* Contacto de Emergencia */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-primary border-b pb-2">Contacto</h2>
            <Card className="border-brand-gold/30 shadow-md bg-brand-gold/5 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-gold/10 rounded-full blur-xl pointer-events-none" />
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-brand-gold" />
                  Atención Inmediata
                </CardTitle>
                <CardDescription>
                  Nuestro equipo está a su disposición en todo momento.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="text-center p-4 bg-background rounded-lg border border-brand-gold/20 shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Línea Principal</p>
                  <p className="text-xl font-serif text-primary">+58 212-555-0000</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-green-500/10 text-green-700 text-xs rounded border border-green-500/20">
                    Disponible 24/7
                  </span>
                </div>
                
                <Button className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Contactar por WhatsApp
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
