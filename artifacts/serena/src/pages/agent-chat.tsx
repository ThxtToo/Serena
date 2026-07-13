import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { Send, Box, Users, MessageSquareHeart, Loader2, Home, Car, Phone, Mail, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  "Necesito reservar una sala para mi familiar",
  "¿Cuál es el contacto de Seguros Caracas?",
  "¿Cuántos cofres de madera tienen disponibles?"
];

function PolicyCard({ policy }: { policy: any }) {
  if (policy.error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100 mt-2 text-sm">
        {policy.error}
      </div>
    );
  }
  return (
    <div className="bg-white border rounded-xl p-4 mt-2 shadow-sm space-y-3 w-[280px] sm:w-[320px]">
      <div className="flex justify-between items-start gap-2">
        <div>
          <h4 className="font-semibold text-primary leading-tight">{policy.titular}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">CI: {policy.cedula}</p>
        </div>
        <Badge variant={policy.estatus.toLowerCase() === 'solvente' ? 'default' : 'destructive'} 
          className={policy.estatus.toLowerCase() === 'solvente' ? 'bg-green-600 hover:bg-green-700 text-white border-transparent' : ''}>
          {policy.estatus}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Aseguradora</span>
          <span className="font-medium text-xs truncate block" title={policy.aseguradora}>{policy.aseguradora}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Plan</span>
          <span className="font-medium text-xs truncate block" title={policy.plan}>{policy.plan}</span>
        </div>
        <div className="col-span-2 pt-1 border-t mt-1">
          <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Límite Aprobado</span>
          <span className="font-mono text-sm font-semibold text-primary">${policy.limite_usd?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
        </div>
      </div>
      
      {policy.cobertura && policy.cobertura.length > 0 && (
        <div className="pt-1">
          <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Cobertura Incluida</p>
          <ul className="list-disc pl-4 text-xs space-y-0.5 text-slate-700">
            {policy.cobertura.map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      
      {(policy.telefono_aseguradora || policy.contacto_aseguradora) && (
        <div className="bg-amber-50/50 border border-amber-100 p-2.5 rounded-lg mt-2">
          <p className="text-[10px] font-semibold text-amber-800 mb-1.5 uppercase tracking-wider">Contacto Aseguradora</p>
          <div className="text-xs text-amber-900 flex flex-col gap-1.5 font-medium">
            {policy.telefono_aseguradora && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-amber-600"/> {policy.telefono_aseguradora}</span>}
            {policy.contacto_aseguradora && <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-amber-600"/> {policy.contacto_aseguradora}</span>}
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
  
  const color = isAvailable ? 'bg-green-100 text-green-700 border-green-200' : 
                isMaintenance ? 'bg-red-100 text-red-700 border-red-200' : 
                'bg-amber-100 text-amber-700 border-amber-200';
  
  const dotColor = isAvailable ? 'bg-green-500' : 
                   isMaintenance ? 'bg-red-500' : 
                   'bg-amber-500';
  
  return (
    <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></div>
      {status}
    </div>
  );
}

function InventoryCard({ inventory }: { inventory: any }) {
  if (inventory.error) {
    return <div className="bg-red-50 text-red-700 p-4 rounded-lg mt-2 text-sm">{inventory.error}</div>;
  }
  
  return (
    <div className="bg-white border rounded-xl p-4 mt-2 shadow-sm space-y-4 w-[280px] sm:w-[340px]">
      <div>
        <h4 className="font-semibold text-primary text-xs mb-2 flex items-center gap-1.5 uppercase tracking-wide">
          <Home className="w-3.5 h-3.5 text-brand-gold"/> Salas de Velación
        </h4>
        <div className="grid gap-1.5">
          {Object.entries(inventory.salas || {}).map(([name, status]: [string, any]) => (
            <div key={name} className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-md text-xs border border-slate-100">
              <span className="font-medium text-slate-700">{name}</span>
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
          <Car className="w-3.5 h-3.5 text-brand-gold"/> Vehículos
        </h4>
        <div className="grid gap-1.5">
          {Object.entries(inventory.vehiculos || {}).map(([name, status]: [string, any]) => (
            <div key={name} className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-md text-xs border border-slate-100">
              <span className="font-medium text-slate-700 truncate mr-2" title={name}>{name}</span>
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
          <Box className="w-3.5 h-3.5 text-brand-gold"/> Cofres (Stock)
        </h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(inventory.cofres || {}).map(([name, qty]: [string, any]) => (
            <div key={name} className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-md text-xs border border-slate-100">
              <span className="font-medium text-slate-700">{name}</span>
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
      <div className="bg-red-50 border border-red-100 rounded-lg p-3 mt-2 flex items-start gap-2 text-sm text-red-800 max-w-[320px]">
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
    <div className="bg-green-50 border border-green-100 rounded-lg p-3 mt-2 flex items-start gap-2 text-sm text-green-800 max-w-[320px]">
      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold">{actionName}</p>
        {result.message && <p>{result.message}</p>}
        {result.item && <p className="mt-1 font-medium bg-white px-2 py-1 rounded-md border border-green-100 inline-block">{result.item} → {result.status || result.nuevo_estado}</p>}
      </div>
    </div>
  );
}

export default function AgentChat() {
  const [turns, setTurns] = useState<MessageTurn[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
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
      <header className="flex-none flex items-center justify-between px-4 sm:px-6 py-4 border-b bg-white shadow-[0_1px_10px_rgba(0,0,0,0.02)] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif text-xl font-bold shadow-sm">
            S
          </div>
          <div>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-primary leading-tight">Serena</h1>
            <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">Asistente Funerario</p>
          </div>
        </div>
        <nav className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium">
          <Link href="/stock" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5" data-testid="link-nav-stock">
            <Box className="w-4 h-4"/> <span className="hidden sm:inline">Inventario</span>
          </Link>
          <Link href="/login" className="text-brand-gold hover:text-amber-600 transition-colors flex items-center gap-1.5" data-testid="link-nav-login">
            <Users className="w-4 h-4"/> <span className="hidden sm:inline">Panel de Personal</span>
          </Link>
        </nav>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {turns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 sm:py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                  <MessageSquareHeart className="w-6 h-6"/>
                </div>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary mb-3">Estamos aquí para acompañarle</h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-10 leading-relaxed px-4">
                Serena es su asistente virtual. Puede consultarle sobre pólizas, disponibilidad de salas, o cualquier servicio que necesite en estos momentos.
              </p>
              
              <div className="w-full max-w-xl flex flex-col gap-2 px-4">
                {SUGGESTIONS.map((sug, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(sug)}
                    className="bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-brand-gold/50 text-left px-5 py-3.5 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all text-sm font-medium text-slate-700 hover:text-primary"
                    data-testid={`btn-suggestion-${i}`}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            turns.map(turn => (
              <div key={turn.id} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] sm:max-w-[80%] flex flex-col gap-1.5 ${turn.role === 'user' ? 'items-end' : 'items-start'}`}>
                  
                  {(turn.content || (turn.role === 'assistant' && !turn.toolStates.length && turn.isStreaming)) && (
                    <div className={`px-5 py-3.5 rounded-2xl ${
                      turn.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-md' 
                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm'
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
                        <div className="flex items-center gap-2 text-xs font-medium text-brand-gold bg-amber-50/80 px-3.5 py-2 rounded-full w-fit mt-1 animate-pulse border border-amber-100 shadow-sm">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
      
      <div className="flex-none p-4 bg-white border-t sticky bottom-0 z-10 w-full shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        <div className="max-w-3xl mx-auto relative flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Escriba su consulta aquí..."
            className="w-full bg-slate-50 border-slate-200 border rounded-2xl pl-4 pr-12 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold focus:bg-white resize-none transition-all min-h-[52px] max-h-[120px]"
            rows={1}
            data-testid="input-chat"
          />
          <button 
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim() || (turns.length > 0 && turns[turns.length-1].isStreaming)}
            className="absolute right-2 bottom-2 aspect-square w-10 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
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
        className="fixed bottom-24 right-4 sm:right-6 z-50 bg-[#25D366] text-white p-3.5 sm:p-4 rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.3)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.5)] hover:-translate-y-1 transition-all duration-300"
        title="Hablar con un asesor — +58 414-200-5050"
        data-testid="link-whatsapp"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  );
}
