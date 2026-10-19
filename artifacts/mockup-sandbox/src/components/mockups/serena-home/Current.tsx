import { useState } from 'react';
import { Box, Home, Car, Phone, Users, Send, ShieldCheck, Truck, MapPin } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import './_group.css';

const SUGGESTIONS = [
  'Verificar mi póliza — cédula V-14555666',
  '¿Qué salas de velación tienen disponibles?',
  'Necesito reservar una sala para mi familiar',
  '¿Cuál es el contacto de Seguros Caracas?',
  '¿Cuántos cofres de madera tienen disponibles?',
];

export function Current() {
  const [inputValue, setInputValue] = useState('');
  const handleSend = (_text: string) => {
    // The original chat API is intentionally not connected in this isolated baseline.
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <header className="flex-none flex items-center justify-between px-4 sm:px-6 py-4 border-b border-primary/20 bg-card sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-primary leading-tight">Serena</h1>
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-[0.15em]">Sistema de Gestión Funeraria</p>
          </div>
        </div>
        <nav className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium">
          <a href="/stock" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5" data-testid="link-nav-stock">
            <Box className="w-4 h-4"/> <span className="hidden sm:inline">Inventario</span>
          </a>
          <a href="/login" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5" data-testid="link-nav-login">
            <Users className="w-4 h-4"/> <span className="hidden sm:inline">Panel de Personal</span>
          </a>
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col items-center py-10 sm:py-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
            <div className="w-16 h-px bg-border mb-8"></div>
            <h1 className="font-serif text-2xl text-primary font-semibold mb-6 tracking-wide">Serena</h1>
            <div className="w-16 h-px bg-border mb-8"></div>
            <h2 className="font-serif text-xl sm:text-2xl text-primary mb-3">¿En qué podemos asistirle?</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-10 leading-relaxed px-4">
              Consulte sobre pólizas de seguros, disponibilidad de servicios o comuníquese con nuestro equipo de atención.
            </p>

            <div className="w-full max-w-xl flex flex-col gap-2 px-4">
              {SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  className="bg-card border border-border hover:border-primary/40 hover:bg-primary/[0.03] text-left px-5 py-3.5 rounded shadow-sm hover:shadow transition-all text-sm text-foreground"
                  data-testid={`btn-suggestion-${i}`}
                >
                  {sug}
                </button>
              ))}
            </div>

            <div className="w-full max-w-4xl mx-auto mt-14 mb-6">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-6">Nuestro Proceso</h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative px-4">
                <div className="hidden sm:block absolute top-9 left-[10%] right-[10%] h-px bg-border" />

                <div className="flex flex-col items-center flex-1 relative z-10">
                  <Phone className="w-4 h-4 text-muted-foreground mb-2 bg-background" />
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-mono mb-3 shadow-[0_0_0_4px_hsl(var(--background))]">1</div>
                  <h4 className="font-medium text-sm text-foreground mb-1.5">Primer Contacto</h4>
                  <p className="text-xs text-muted-foreground max-w-[150px]">Comuníquese con nosotros por chat, teléfono o WhatsApp. Disponibles las 24 horas.</p>
                </div>

                <div className="flex flex-col items-center flex-1 relative z-10">
                  <ShieldCheck className="w-4 h-4 text-muted-foreground mb-2 bg-background" />
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-mono mb-3 shadow-[0_0_0_4px_hsl(var(--background))]">2</div>
                  <h4 className="font-medium text-sm text-foreground mb-1.5">Verificación de Póliza</h4>
                  <p className="text-xs text-muted-foreground max-w-[150px]">Verificamos su cobertura con la aseguradora. Necesitará la cédula del titular.</p>
                </div>

                <div className="flex flex-col items-center flex-1 relative z-10">
                  <Truck className="w-4 h-4 text-muted-foreground mb-2 bg-background" />
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-mono mb-3 shadow-[0_0_0_4px_hsl(var(--background))]">3</div>
                  <h4 className="font-medium text-sm text-foreground mb-1.5">Traslado y Preparación</h4>
                  <p className="text-xs text-muted-foreground max-w-[150px]">Coordinamos el traslado a nuestras instalaciones y la preparación del servicio (4-6 horas).</p>
                </div>

                <div className="flex flex-col items-center flex-1 relative z-10">
                  <Home className="w-4 h-4 text-muted-foreground mb-2 bg-background" />
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-mono mb-3 shadow-[0_0_0_4px_hsl(var(--background))]">4</div>
                  <h4 className="font-medium text-sm text-foreground mb-1.5">Velatorio</h4>
                  <p className="text-xs text-muted-foreground max-w-[150px]">Asignamos sala de velación y cofre según su plan. El velatorio dura entre 12 y 24 horas.</p>
                </div>

                <div className="flex flex-col items-center flex-1 relative z-10">
                  <MapPin className="w-4 h-4 text-muted-foreground mb-2 bg-background" />
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-mono mb-3 shadow-[0_0_0_4px_hsl(var(--background))]">5</div>
                  <h4 className="font-medium text-sm text-foreground mb-1.5">Traslado Final</h4>
                  <p className="text-xs text-muted-foreground max-w-[150px]">Coordinamos el traslado al cementerio o crematorio y cerramos el expediente.</p>
                </div>
              </div>
            </div>

            <div className="w-full max-w-2xl mx-auto mt-14 mb-6 px-4">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-6">Preguntas Frecuentes</h3>
              <Accordion type="multiple" className="w-full text-left">
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
            </div>
          </div>
          <div className="h-2" />
        </div>
      </main>

      <div className="flex-none p-4 bg-card border-t border-border sticky bottom-0 z-10 w-full shadow-sm">
        <div className="max-w-3xl mx-auto relative flex items-end gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(inputValue);
              }
            }}
            placeholder="Escriba su consulta aquí..."
            className="w-full bg-background border-border border rounded pl-4 pr-12 py-3.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all min-h-[52px] max-h-[120px] resize-none"
            rows={1}
            data-testid="input-chat"
          />
          <button
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim()}
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
        className="fixed bottom-[88px] right-5 z-50 bg-[#25D366] text-white p-3 rounded-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
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
