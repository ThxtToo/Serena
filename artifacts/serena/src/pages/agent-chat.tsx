import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { Send, Box, Users, Loader2, Home, Car, Phone, Mail, CheckCircle2, XCircle, ShieldCheck, Truck, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/hooks/use-auth';

type ToolState = {
  tool: string;
  args?: any;
  status: 'calling' | 'done' | 'error';
  result?: any;
  error?: string;
};

type MessageTurn = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolStates: ToolState[];
  isStreaming: boolean;
};

const SUGGESTIONS = [
  "Verificar mi póliza — cédula V-14555666",
  "¿Qué salas de velación tienen disponibles?",
  "Necesito reservar una sala para mi familiar"
];

function PolicyCard({ policy }: { policy: any }) {
  if (policy.error || policy.encontrado === false) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded border border-red-100 mt-2 text-sm shadow-sm">
        {policy.error ?? policy.mensaje ?? 'Póliza no encontrada.'}
      </div>
    );
  }
  const estatus: string = policy.estatus ?? '';
  const esSolvente = estatus.toLowerCase() === 'solvente';
  return (
    <div className="bg-card border border-border rounded p-4 mt-2 shadow-sm space-y-3 w-[280px] sm:w-[320px]">
      <div className="flex justify-between items-start gap-2">
        <div>
          <h4 className="font-semibold text-primary leading-tight">{policy.titular}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">CI: {policy.cedula}</p>
        </div>
        <Badge
          variant={esSolvente ? 'default' : 'destructive'}
          className={esSolvente ? 'bg-green-600 hover:bg-green-700 text-white border-transparent' : ''}
        >
          {estatus}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-2.5 rounded border border-slate-100">
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Aseguradora</span>
          <span className="font-medium text-xs truncate block text-foreground" title={policy.aseguradora}>{policy.aseguradora}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Plan</span>
          <span className="font-medium text-xs truncate block text-foreground" title={policy.plan}>{policy.plan}</span>
        </div>
        <div className="col-span-2 pt-1 border-t mt-1">
          <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Límite Aprobado</span>
          <span className="font-mono text-sm font-semibold text-primary">${policy.limite_usd?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
        </div>
      </div>
      
      {policy.cobertura && policy.cobertura.length > 0 && (
        <div className="pt-1">
          <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Cobertura Incluida</p>
          <ul className="list-disc pl-4 text-xs space-y-0.5 text-foreground">
            {policy.cobertura.map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      
      {(policy.telefono_aseguradora || policy.contacto_aseguradora) && (
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded mt-2">
          <p className="text-[10px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Contacto Aseguradora</p>
          <div className="text-xs text-slate-700 flex flex-col gap-1.5 font-medium">
            {policy.telefono_aseguradora && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400"/> {policy.telefono_aseguradora}</span>}
            {policy.contacto_aseguradora && <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400"/> {policy.contacto_aseguradora}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const isAvailable = s === 'disponible';
  const isMaintenance = s.includes('mantenimiento') || s.includes('limpieza');
  
  const color = isAvailable ? 'bg-green-50 text-green-700 border-green-200' : 
                isMaintenance ? 'bg-red-50 text-red-700 border-red-200' : 
                'bg-amber-50 text-amber-700 border-amber-200';
  
  const dotColor = isAvailable ? 'bg-green-500' : 
                   isMaintenance ? 'bg-red-500' : 
                   'bg-amber-500';
  
  return (
    <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded border ${color}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></div>
      {status}
    </div>
  );
}

function InventoryCard({ inventory }: { inventory: any }) {
  if (inventory.error) {
    return <div className="bg-red-50 text-red-700 p-4 rounded mt-2 text-sm shadow-sm border border-red-100">{inventory.error}</div>;
  }
  
  return (
    <div className="bg-card border border-border rounded p-4 mt-2 shadow-sm space-y-4 w-[280px] sm:w-[340px]">
      <div>
        <h4 className="font-semibold text-primary text-xs mb-2 flex items-center gap-1.5 uppercase tracking-wide">
          <Home className="w-3.5 h-3.5 text-primary/70"/> Salas de Velación
        </h4>
        <div className="grid gap-1.5">
          {Object.entries(inventory.salas || {}).map(([name, status]: [string, any]) => (
            <div key={name} className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded text-xs border border-slate-100">
              <span className="font-medium text-foreground">{name}</span>
              <StatusBadge status={status} />
            </div>
          ))}
          {(!inventory.salas || Object.keys(inventory.salas).length === 0) && (
            <p className="text-xs text-muted-foreground italic">No hay salas registradas</p>
          )}
        </div>
      </div>
      
      <div className="pt-1 border-t">
        <h4 className="font-semibold text-primary text-xs mb-2 flex items-center gap-1.5 uppercase tracking-wide mt-3">
          <Car className="w-3.5 h-3.5 text-primary/70"/> Vehículos
        </h4>
        <div className="grid gap-1.5">
          {Object.entries(inventory.vehiculos || {}).map(([name, status]: [string, any]) => (
            <div key={name} className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded text-xs border border-slate-100">
              <span className="font-medium text-foreground truncate mr-2" title={name}>{name}</span>
              <StatusBadge status={status} />
            </div>
          ))}
          {(!inventory.vehiculos || Object.keys(inventory.vehiculos).length === 0) && (
            <p className="text-xs text-muted-foreground italic">No hay vehículos registrados</p>
          )}
        </div>
      </div>
      
      <div className="pt-1 border-t">
        <h4 className="font-semibold text-primary text-xs mb-2 flex items-center gap-1.5 uppercase tracking-wide mt-3">
          <Box className="w-3.5 h-3.5 text-primary/70"/> Cofres (Stock)
        </h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(inventory.cofres || {}).map(([name, qty]: [string, any]) => (
            <div key={name} className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded text-xs border border-slate-100">
              <span className="font-medium text-foreground">{name}</span>
              <Badge variant="secondary" className="font-mono bg-white border border-slate-200 text-[10px] px-1.5 py-0">{qty}</Badge>
            </div>
          ))}
          {(!inventory.cofres || Object.keys(inventory.cofres).length === 0) && (
            <p className="text-xs text-muted-foreground italic">No hay cofres registrados</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ tool, result }: { tool: string, result: any }) {
  if (result.error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded p-3 mt-2 flex items-start gap-2 text-sm text-red-800 max-w-[320px] shadow-sm">
        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Error al procesar</p>
          <p>{result.error}</p>
        </div>
      </div>
    );
  }
  
  const actionName = tool === 'reservar_sala' ? 'Reserva confirmada' : 'Vehículo asignado';
  
  return (
    <div className="bg-green-50 border border-green-100 rounded p-3 mt-2 flex items-start gap-2 text-sm text-green-800 max-w-[320px] shadow-sm">
      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold">{actionName}</p>
        {result.message && <p>{result.message}</p>}
        {result.item && <p className="mt-1 font-medium bg-white px-2 py-1 rounded border border-green-100 inline-block">{result.item} → {result.status || result.nuevo_estado}</p>}
      </div>
    </div>
  );
}

export default function AgentChat() {
  const { user } = useAuth();
  const [turns, setTurns] = useState<MessageTurn[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (turns.length === 0) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, turns.map(t => t.content).join('')]);

  const handleSend = async (text: string) => {
    if (!text.trim() || turns[turns.length - 1]?.isStreaming) return;
    
    const userText = text.trim();
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    
    const newTurnUser: MessageTurn = { id: Date.now().toString(), role: 'user', content: userText, toolStates: [], isStreaming: false };
    const newTurnAsst: MessageTurn = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', toolStates: [], isStreaming: true };
    
    setTurns(prev => [...prev, newTurnUser, newTurnAsst]);

    const apiMessages = [...turns, newTurnUser].map(t => ({
      role: t.role,
      content: t.content
    }));

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });
      
      if (!response.body) throw new Error('No body');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr || dataStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(dataStr);
              setTurns(prev => {
                const newTurns = [...prev];
                const lastAsstIndex = newTurns.findIndex(t => t.id === newTurnAsst.id);
                if (lastAsstIndex === -1) return newTurns;
                
                const lastAsst = { ...newTurns[lastAsstIndex] };
                
                if (data.type === 'tool_call') {
                  lastAsst.toolStates = [...lastAsst.toolStates, {
                    tool: data.tool,
                    args: data.args,
                    status: 'calling'
                  }];
                } else if (data.type === 'tool_result') {
                  const tools = [...lastAsst.toolStates];
                  const toolIndex = tools.findLastIndex(t => t.tool === data.tool && t.status === 'calling');
                  if (toolIndex !== -1) {
                    tools[toolIndex] = { ...tools[toolIndex], status: 'done', result: data.result };
                  } else if (tools.length > 0) {
                    tools[tools.length - 1] = { ...tools[tools.length - 1], status: 'done', result: data.result };
                  }
                  lastAsst.toolStates = tools;
                } else if (data.type === 'content') {
                  lastAsst.content += data.content;
                } else if (data.type === 'done') {
                  lastAsst.isStreaming = false;
                } else if (data.type === 'error') {
                  lastAsst.isStreaming = false;
                  lastAsst.content += `\n[Error: ${data.message}]`;
                }
                
                newTurns[lastAsstIndex] = lastAsst;
                return newTurns;
              });
            } catch (e) {
              console.error('Error parsing SSE line', e, line);
            }
          }
        }
      }
      
      setTurns(prev => {
        const newTurns = [...prev];
        const lastAsstIndex = newTurns.findIndex(t => t.id === newTurnAsst.id);
        if (lastAsstIndex !== -1) {
          newTurns[lastAsstIndex] = { ...newTurns[lastAsstIndex], isStreaming: false };
        }
        return newTurns;
      });
      
    } catch (err) {
      console.error(err);
      setTurns(prev => {
        const newTurns = [...prev];
        const lastAsstIndex = newTurns.findIndex(t => t.id === newTurnAsst.id);
        if (lastAsstIndex !== -1) {
          const lastAsst = { ...newTurns[lastAsstIndex] };
          lastAsst.isStreaming = false;
          lastAsst.content += '\n[Error de conexión]';
          newTurns[lastAsstIndex] = lastAsst;
        }
        return newTurns;
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <header className="flex-none flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-border bg-card/95 backdrop-blur sticky top-0 z-10">
        <Link href="/" className="group flex items-center gap-3" aria-label="Serena, inicio">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/15 bg-primary/[0.04] font-serif text-lg font-semibold text-primary">S</span>
          <span>
            <span className="block font-serif text-xl sm:text-2xl font-bold text-primary leading-tight">Serena</span>
            <span className="hidden sm:block text-[10px] font-medium text-muted-foreground uppercase tracking-[0.14em]">Acompañamiento funerario</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
          {user?.role === 'personal' && (
            <>
              <Link href="/stock" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary" data-testid="link-nav-stock">
                <Box className="w-4 h-4"/> <span>Inventario</span>
              </Link>
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-primary-foreground transition-colors hover:bg-primary/90" data-testid="link-nav-dashboard">
                <Users className="w-4 h-4"/> <span className="hidden sm:inline">Panel de Personal</span><span className="sm:hidden">Panel</span>
              </Link>
            </>
          )}
          {user?.role === 'usuario' && (
            <Link href="/portal" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-primary transition-colors hover:bg-muted" data-testid="link-nav-portal">
              <Users className="w-4 h-4"/> <span>Mi portal</span>
            </Link>
          )}
          {!user && (
            <Link href="/login" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-primary transition-colors hover:bg-muted" data-testid="link-nav-login">
              <Users className="w-4 h-4"/> <span>Acceso de personal</span>
            </Link>
          )}
        </nav>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {turns.length === 0 ? (
            <div className="w-full space-y-5 py-5 sm:py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <section className="rounded-3xl border border-primary/10 bg-card px-5 py-8 text-center shadow-sm sm:px-10 sm:py-11">
                <Badge variant="secondary" className="mb-5 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em]">
                  <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Atención las 24 horas
                </Badge>
                <h1 className="mx-auto max-w-2xl font-serif text-3xl font-medium leading-tight text-primary sm:text-4xl">
                  Estamos para acompañarle.
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Reciba orientación clara y respetuosa para consultar una póliza, conocer nuestros servicios o hablar con el equipo Serena.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <a href="https://wa.me/584142005050" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90">
                    <Phone className="h-4 w-4" /> Hablar con un asesor
                  </a>
                  <a href="#ayuda" className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-primary transition hover:bg-muted">
                    Consultar por chat
                  </a>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">Atención continua · Respuesta de una persona disponible por WhatsApp</p>
              </section>

              <section className="rounded-3xl border border-border bg-background/70 p-5 sm:p-7" aria-labelledby="quick-help-title">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 id="quick-help-title" className="font-serif text-xl text-primary sm:text-2xl">¿En qué podemos asistirle?</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Elija una consulta para comenzar.</p>
                  </div>
                  <span className="text-xs text-muted-foreground">También puede escribir abajo</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {SUGGESTIONS.map((sug, i) => {
                    const Icon = i === 0 ? ShieldCheck : i === 1 ? Home : Phone;
                    const title = i === 0 ? 'Verificar una póliza' : i === 1 ? 'Consultar disponibilidad' : 'Iniciar una reserva';
                    const description = i === 0 ? 'Revise cobertura con la cédula del titular.' : i === 1 ? 'Consulte salas y servicios disponibles.' : 'Le orientamos con los próximos pasos.';
                    return (
                      <button
                        key={i}
                        onClick={() => handleSend(sug)}
                        className="group min-h-[112px] rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        data-testid={`btn-suggestion-${i}`}
                      >
                        <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/[0.06] text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="block text-sm font-semibold text-foreground">{title}</span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="grid gap-4 lg:grid-cols-2">
                <details className="group rounded-2xl border border-border bg-card px-5 shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium text-primary [&::-webkit-details-marker]:hidden">
                    <span>
                      <span className="block font-serif text-lg">Cómo funciona la atención</span>
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">Conozca las etapas del servicio</span>
                    </span>
                    <span className="text-xl text-muted-foreground transition group-open:rotate-180">⌄</span>
                  </summary>
                  <div className="grid gap-3 pb-5 sm:grid-cols-2">
                    {[
                      { icon: Phone, title: 'Primer contacto', text: 'Escríbanos por chat, teléfono o WhatsApp. Estamos disponibles las 24 horas.' },
                      { icon: ShieldCheck, title: 'Verificación de póliza', text: 'Revisamos la cobertura con la aseguradora; necesitaremos la cédula del titular.' },
                      { icon: Truck, title: 'Traslado y preparación', text: 'Coordinamos el traslado y la preparación del servicio.' },
                      { icon: Home, title: 'Velatorio', text: 'Asignamos sala y cofre según el plan o los acuerdos del servicio.' },
                      { icon: MapPin, title: 'Traslado final', text: 'Coordinamos el traslado al cementerio o crematorio y cerramos el expediente.' }
                    ].map(({ icon: Icon, title, text }, i) => (
                      <div key={title} className="flex gap-3 rounded-xl bg-muted/50 p-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{i + 1}</span>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
                        </div>
                        <Icon className="hidden h-4 w-4 shrink-0 text-primary/60 sm:block" />
                      </div>
                    ))}
                  </div>
                </details>

                <details className="group rounded-2xl border border-border bg-card px-5 shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium text-primary [&::-webkit-details-marker]:hidden">
                    <span>
                      <span className="block font-serif text-lg">Preguntas frecuentes</span>
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">Documentos, pólizas, pagos y horarios</span>
                    </span>
                    <span className="text-xl text-muted-foreground transition group-open:rotate-180">⌄</span>
                  </summary>
                  <Accordion type="multiple" className="w-full pb-2 text-left">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-sm font-medium text-foreground text-left">¿Qué documentos necesito para iniciar el servicio?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      Necesitará el Certificado de Defunción (EV-14) emitido por el médico tratante, la cédula de identidad del fallecido, la cédula del familiar responsable, y si tiene póliza, la cédula del titular para verificación. En casos de muerte violenta o accidental, también se requiere el acta del Cuerpo de Investigaciones (CICPC).
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-sm font-medium text-foreground text-left">¿Cómo verifico si tengo póliza de seguro funerario?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      Escríbanos su número de cédula directamente en este chat y Serena consultará el sistema de forma inmediata. Si su póliza está registrada con nosotros, verá todos los detalles de cobertura en segundos.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-sm font-medium text-foreground text-left">¿Qué cubre una póliza de seguro funerario?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      Depende del plan contratado. En general cubren: sala de velación, carroza, cofre, y en planes superiores, embalsamamiento y arreglos florales. El límite en dólares varía entre $600 y $3,000 según la aseguradora y el plan.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-sm font-medium text-foreground text-left">¿Qué pasa si la póliza está suspendida?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      Si la póliza está suspendida por falta de pago, el servicio no está cubierto hasta que se regularice con la aseguradora. Le orientamos con los datos de contacto de la aseguradora para regularizarla. También puede optar por pago particular mientras se resuelve.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5">
                    <AccordionTrigger className="text-sm font-medium text-foreground text-left">¿Cuánto tiempo toma el proceso completo?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      Desde el primer contacto hasta el traslado inicial toman aproximadamente 2-4 horas. La preparación del cuerpo lleva entre 4 y 6 horas. El velatorio dura entre 12 y 24 horas según el plan. El proceso completo suele concluirse en 36 a 48 horas.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-6">
                    <AccordionTrigger className="text-sm font-medium text-foreground text-left">¿Cuáles son las formas de pago para servicios particulares?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      Aceptamos transferencia bancaria (Banesco, BDV, Mercantil), pago móvil, dólares americanos en efectivo, y Zelle (coordinado con administración). El presupuesto se entrega antes de confirmar el servicio.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-7">
                    <AccordionTrigger className="text-sm font-medium text-foreground text-left">¿Pueden trasladar al fallecido desde otro estado del país?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      Sí. Coordinamos traslados desde cualquier estado de Venezuela. El costo adicional de traslado interprovincial depende de la distancia y se coordina directamente con nuestro equipo: +58 414-200-5050.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-8">
                    <AccordionTrigger className="text-sm font-medium text-foreground text-left">¿Cuáles son los horarios de velación?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      Nuestras instalaciones operan las 24 horas del día, los 7 días de la semana. La duración del velatorio (12h, 24h o más) depende del plan contratado o del acuerdo con administración.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-9">
                    <AccordionTrigger className="text-sm font-medium text-foreground text-left">¿Ofrecen servicio de embalsamamiento?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      Sí. El embalsamamiento está incluido en los planes Premium y de Protección Total. Para planes básicos o servicios particulares, puede contratarse por separado. Consulte disponibilidad con nuestro equipo.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-10">
                    <AccordionTrigger className="text-sm font-medium text-foreground text-left">¿Cómo puedo hablar con una persona del equipo?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      Puede llamar o escribir por WhatsApp al +58 414-200-5050, disponible las 24 horas. También puede usar este chat para consultas inmediatas sobre pólizas, disponibilidad y reservas.
                    </AccordionContent>
                  </AccordionItem>
                  </Accordion>
                </details>
              </div>
              <p className="pb-4 text-center text-xs text-muted-foreground">Serena · Atención respetuosa para usted y su familia</p>
            </div>
          ) : (
            turns.map(turn => (
              <div key={turn.id} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] sm:max-w-[80%] flex flex-col gap-1.5 ${turn.role === 'user' ? 'items-end' : 'items-start'}`}>
                  
                  {(turn.content || (turn.role === 'assistant' && !turn.toolStates.length && turn.isStreaming)) && (
                    <div className={`px-5 py-3.5 rounded-2xl ${
                      turn.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-sm' 
                        : 'bg-card border border-border text-foreground rounded-tl-sm shadow-sm'
                    }`}>
                      {turn.content ? (
                        <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                          {turn.content}
                        </div>
                      ) : turn.role === 'assistant' && !turn.toolStates.length && turn.isStreaming ? (
                        <div className="flex items-center gap-1 h-5 px-1">
                          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {turn.toolStates.map((tool, idx) => (
                    <div key={idx} className="w-full max-w-full">
                      {tool.status === 'calling' && (
                        <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/5 px-3.5 py-2 rounded-full w-fit mt-1 border border-primary/10 shadow-sm">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary/70" />
                          {tool.tool === 'buscar_poliza' ? 'Verificando póliza...' : 
                           tool.tool === 'consultar_inventario' ? 'Consultando inventario...' : 
                           tool.tool === 'reservar_sala' ? 'Procesando reserva...' : 
                           'Consultando sistema...'}
                        </div>
                      )}
                      {tool.status === 'done' && (
                        tool.tool === 'buscar_poliza' ? <PolicyCard policy={tool.result} /> :
                        tool.tool === 'consultar_inventario' ? <InventoryCard inventory={tool.result} /> :
                        ['reservar_sala', 'asignar_vehiculo'].includes(tool.tool) ? <ActionCard tool={tool.tool} result={tool.result} /> :
                        <div className="text-xs text-muted-foreground mt-1 bg-slate-50 p-2 rounded border">Operación completada.</div>
                      )}
                    </div>
                  ))}
                  
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </main>
      
      <div className="flex-none p-4 bg-card border-t border-border sticky bottom-0 z-10 w-full shadow-sm">
        <div className="max-w-3xl mx-auto relative flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Escriba su consulta aquí..."
            className="w-full bg-background border-border border rounded pl-4 pr-12 py-3.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all min-h-[52px] max-h-[120px] resize-none"
            rows={1}
            data-testid="input-chat"
          />
          <button 
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim() || (turns.length > 0 && turns[turns.length-1].isStreaming)}
            className="absolute right-2 bottom-2 aspect-square w-10 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            data-testid="btn-send-message"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>

      <a 
        href="https://wa.me/584142005050"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-[88px] right-5 z-50 hidden bg-[#25D366] text-white p-3 rounded-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 sm:flex"
        title="Hablar con un asesor — +58 414-200-5050"
        data-testid="link-whatsapp"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  );
}
