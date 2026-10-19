import { useState, type FormEvent, type KeyboardEvent } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileCheck2,
  HeartHandshake,
  Home,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Truck,
  Users,
} from 'lucide-react';
import './_group.css';

const steps = [
  {
    icon: Phone,
    title: 'Primer contacto',
    text: 'Comuníquese con nosotros por chat, teléfono o WhatsApp. Disponibles las 24 horas.',
  },
  {
    icon: ShieldCheck,
    title: 'Verificación de póliza',
    text: 'Verificamos su cobertura con la aseguradora. Necesitará la cédula del titular.',
  },
  {
    icon: Truck,
    title: 'Traslado y preparación',
    text: 'Coordinamos el traslado a nuestras instalaciones y la preparación del servicio (4–6 horas).',
  },
  {
    icon: Home,
    title: 'Velatorio',
    text: 'Asignamos sala de velación y cofre según su plan. El velatorio dura entre 12 y 24 horas.',
  },
  {
    icon: MapPin,
    title: 'Traslado final',
    text: 'Coordinamos el traslado al cementerio o crematorio y cerramos el expediente.',
  },
];

const questions = [
  {
    question: '¿Qué documentos necesito para iniciar el servicio?',
    answer:
      'Necesitará el Certificado de Defunción (EV-14) emitido por el médico tratante, la cédula de identidad del fallecido, la cédula del familiar responsable, y si tiene póliza, la cédula del titular para verificación. En casos de muerte violenta o accidental, también se requiere el acta del Cuerpo de Investigaciones (CICPC).',
  },
  {
    question: '¿Cómo verifico si tengo póliza de seguro funerario?',
    answer:
      'Escríbanos su número de cédula directamente en este chat y Serena consultará el sistema de forma inmediata. Si su póliza está registrada con nosotros, verá todos los detalles de cobertura en segundos.',
  },
  {
    question: '¿Qué cubre una póliza de seguro funerario?',
    answer:
      'Depende del plan contratado. En general cubren: sala de velación, carroza, cofre, y en planes superiores, embalsamamiento y arreglos florales. El límite en dólares varía entre $600 y $3,000 según la aseguradora y el plan.',
  },
  {
    question: '¿Qué pasa si la póliza está suspendida?',
    answer:
      'Si la póliza está suspendida por falta de pago, el servicio no está cubierto hasta que se regularice con la aseguradora. Le orientamos con los datos de contacto de la aseguradora para regularizarla. También puede optar por pago particular mientras se resuelve.',
  },
  {
    question: '¿Cuánto tiempo toma el proceso completo?',
    answer:
      'Desde el primer contacto hasta el traslado inicial toman aproximadamente 2-4 horas. La preparación del cuerpo lleva entre 4 y 6 horas. El velatorio dura entre 12 y 24 horas según el plan. El proceso completo suele concluirse en 36 a 48 horas.',
  },
  {
    question: '¿Cuáles son las formas de pago para servicios particulares?',
    answer:
      'Aceptamos transferencia bancaria (Banesco, BDV, Mercantil), pago móvil, dólares americanos en efectivo, y Zelle (coordinado con administración). El presupuesto se entrega antes de confirmar el servicio.',
  },
  {
    question: '¿Pueden trasladar al fallecido desde otro estado del país?',
    answer:
      'Sí. Coordinamos traslados desde cualquier estado de Venezuela. El costo adicional de traslado interprovincial depende de la distancia y se coordina directamente con nuestro equipo: +58 414-200-5050.',
  },
  {
    question: '¿Cuáles son los horarios de velación?',
    answer:
      'Nuestras instalaciones operan las 24 horas del día, los 7 días de la semana. La duración del velatorio (12h, 24h o más) depende del plan contratado o del acuerdo con administración.',
  },
  {
    question: '¿Ofrecen servicio de embalsamamiento?',
    answer:
      'Sí. El embalsamamiento está incluido en los planes Premium y de Protección Total. Para planes básicos o servicios particulares, puede contratarse por separado. Consulte disponibilidad con nuestro equipo.',
  },
  {
    question: '¿Cómo puedo hablar con una persona del equipo?',
    answer:
      'Puede llamar o escribir por WhatsApp al +58 414-200-5050, disponible las 24 horas. También puede usar este chat para consultas inmediatas sobre pólizas, disponibilidad y reservas.',
  },
];

const quickQuestions = [
  {
    icon: ShieldCheck,
    title: 'Verificar una póliza',
    detail: 'Consulte la cobertura con la cédula del titular.',
    prompt: 'Quiero verificar una póliza. ¿Qué información necesitan?',
  },
  {
    icon: Home,
    title: 'Consultar disponibilidad',
    detail: 'Pregunte por salas y servicios disponibles.',
    prompt: '¿Qué salas de velación tienen disponibles?',
  },
  {
    icon: FileCheck2,
    title: 'Iniciar una reserva',
    detail: 'Conozca cómo comenzar con nuestro equipo.',
    prompt: 'Necesito iniciar una reserva para mi familiar.',
  },
];

const extraQuestions = [
  '¿Cuál es el contacto de Seguros Caracas?',
  '¿Cuántos cofres de madera tienen disponibles?',
];

type ChatMessage = { role: 'visitor' | 'serena'; text: string };

function localReply(message: string) {
  const text = message.toLocaleLowerCase();
  if (text.includes('póliza') || text.includes('poliza') || text.includes('cédula') || text.includes('cedula')) {
    return 'Para verificar una póliza, tenga a mano la cédula del titular. La consulta al sistema de pólizas no está conectada en esta maqueta; nuestro equipo puede orientarle por WhatsApp al +58 414-200-5050.';
  }
  if (text.includes('sala') || text.includes('disponib') || text.includes('cofre') || text.includes('inventario')) {
    return 'La disponibilidad de salas, servicios y cofres no se consulta desde esta maqueta. Escríbanos por WhatsApp al +58 414-200-5050 y nuestro equipo podrá orientarle.';
  }
  if (text.includes('reserva') || text.includes('iniciar')) {
    return 'Podemos orientarle para iniciar una reserva. Esta maqueta no confirma ni guarda solicitudes; para comenzar, contacte a nuestro equipo por WhatsApp al +58 414-200-5050.';
  }
  if (text.includes('seguros caracas') || text.includes('aseguradora')) {
    return 'Para consultar los datos de contacto de su aseguradora, comuníquese con el equipo Serena al +58 414-200-5050. Esta maqueta no consulta directorios de aseguradoras.';
  }
  return 'Gracias por escribirnos. Este chat de demostración no está conectado a un equipo de atención; puede contactarnos por WhatsApp al +58 414-200-5050, disponible las 24 horas.';
}

export function Clean() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isReplying, setIsReplying] = useState(false);

  const handleSend = (value: string) => {
    const message = value.trim();
    if (!message || isReplying) return;
    setInputValue('');
    setMessages((current) => [...current, { role: 'visitor', text: message }]);
    setIsReplying(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, { role: 'serena', text: localReply(message) }]);
      setIsReplying(false);
    }, 450);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSend(inputValue);
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend(inputValue);
    }
  };

  return (
    <div className="serena-clean min-h-[100dvh] bg-[#f3f5f6] text-[#202c3b]">
      <style>{`
        .serena-clean {
          --serena-ink: #1f2d3d;
          --serena-muted: #667382;
          --serena-line: #dbe1e6;
          --serena-paper: #fbfcfc;
          --serena-blue: #30475e;
          font-family: var(--app-font-sans, 'DM Sans', sans-serif);
        }
        .serena-clean .serena-display { font-family: var(--app-font-serif, 'Playfair Display', serif); }
        .serena-clean .serena-reveal { animation: serena-rise .65s cubic-bezier(.2,.75,.3,1) both; }
        .serena-clean .serena-reveal-delay { animation: serena-rise .7s .12s cubic-bezier(.2,.75,.3,1) both; }
        .serena-clean details[open] .serena-chevron { transform: rotate(180deg); }
        .serena-clean summary::-webkit-details-marker { display: none; }
        @keyframes serena-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { .serena-clean .serena-reveal, .serena-clean .serena-reveal-delay { animation: none; } }
      `}</style>

      <header className="sticky top-0 z-30 border-b border-[#dbe1e6]/90 bg-[#f8f9f9]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-3.5 sm:px-8">
          <a href="#inicio" className="group flex items-center gap-3" aria-label="Serena, inicio">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#cbd3db] bg-[#e9eef1] font-serif text-lg text-[#30475e]">S</span>
            <span>
              <span className="serena-display block text-[22px] leading-6 text-[#26384b]">Serena</span>
              <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[.19em] text-[#77838f]">Acompañamiento funerario</span>
            </span>
          </a>
          <nav className="flex items-center gap-2 sm:gap-7" aria-label="Navegación principal">
            <a href="#proceso" className="hidden text-[13px] font-medium text-[#657280] transition-colors hover:text-[#26384b] sm:inline">Nuestro proceso</a>
            <a href="#preguntas" className="hidden text-[13px] font-medium text-[#657280] transition-colors hover:text-[#26384b] sm:inline">Preguntas frecuentes</a>
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-[#cbd3db] px-3.5 py-2 text-[12px] font-semibold text-[#30475e] transition-colors hover:bg-[#e9eef1] sm:px-4 sm:text-[13px]"
              data-testid="link-nav-login"
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Acceso de personal</span>
              <span className="sm:hidden">Personal</span>
            </a>
          </nav>
        </div>
      </header>

      <main id="inicio" className="mx-auto max-w-[1240px] px-5 pb-20 sm:px-8">
        <section className="serena-reveal relative grid gap-9 overflow-hidden border-b border-[#dbe1e6] py-12 sm:py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:gap-14 lg:py-[76px]">
          <div className="pointer-events-none absolute -right-12 -top-10 hidden h-[360px] w-[360px] rounded-full border border-[#dce2e7] sm:block lg:right-[34%] lg:top-[-130px]">
            <div className="absolute inset-7 rounded-full border border-[#e3e7eb]" />
            <div className="absolute inset-[62px] rounded-full border border-[#e6eaed]" />
          </div>
          <div className="relative z-10 max-w-[650px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d9e0e5] bg-[#f8f9f9] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[#59697a]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#687f75]" />
              A su lado, las 24 horas
            </div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[.2em] text-[#7b8792]">Orientación clara, con respeto</p>
            <h1 className="serena-display max-w-[620px] text-[42px] font-medium leading-[1.08] tracking-[-.035em] text-[#26384b] sm:text-[58px] lg:text-[66px]">
              Estamos aquí para acompañarle.
            </h1>
            <p className="mt-5 max-w-[530px] text-[15px] leading-7 text-[#64717f] sm:text-[17px] sm:leading-8">
              Cuando más importa, cada paso debe ser claro. Consulte su póliza, conozca nuestros servicios o hable con el equipo Serena.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#chat" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#30475e] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#26394d]">
                Consultar por chat <ArrowRight className="h-4 w-4" />
              </a>
              <a href="https://wa.me/584142005050" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#ccd5dd] bg-[#f9fafa] px-5 text-sm font-semibold text-[#30475e] transition-colors hover:bg-[#e9eef1]" data-testid="link-whatsapp-hero">
                <MessageCircle className="h-4 w-4" /> Hablar por WhatsApp
              </a>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-[#75818c]">
              <Clock3 className="h-3.5 w-3.5" />
              Atención continua · +58 414-200-5050
            </div>
          </div>

          <aside className="serena-reveal-delay relative z-10 mx-auto w-full max-w-[430px] lg:ml-auto" aria-label="Ayuda inmediata">
            <div className="rounded-lg border border-[#d8dfe5] bg-[#fbfcfc] p-5 shadow-[0_18px_50px_rgba(38,56,75,.08)] sm:p-7">
              <div className="flex items-start justify-between gap-4 border-b border-[#e3e8ec] pb-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#818c96]">Serena · Atención</p>
                  <h2 className="serena-display mt-2 text-[25px] leading-tight text-[#26384b]">¿En qué podemos asistirle?</h2>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9eef1] text-[#40566c]">
                  <HeartHandshake className="h-5 w-5" strokeWidth={1.7} />
                </span>
              </div>
              <div className="space-y-0">
                {quickQuestions.map(({ icon: Icon, title, detail, prompt }, index) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="group flex w-full items-center gap-3 border-b border-[#e8ecef] py-4 text-left last:border-b-0"
                    data-testid={`btn-quick-${index}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#edf1f3] text-[#536a80] transition-colors group-hover:bg-[#30475e] group-hover:text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-[#2c3b4c]">{title}</span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-[#78848e]">{detail}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-[#9ba5ad] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#30475e]" />
                  </button>
                ))}
              </div>
              <a href="#chat" className="mt-3 flex items-center justify-between rounded-md bg-[#f0f3f5] px-3.5 py-3 text-xs text-[#526273] transition-colors hover:bg-[#e8edf0]">
                <span>¿Tiene otra consulta? Escríbanos</span><ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </aside>
        </section>

        <section id="proceso" className="scroll-mt-24 py-14 sm:py-[72px]" aria-labelledby="process-heading">
          <div className="flex flex-col gap-3 border-b border-[#dbe1e6] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#788591]">Qué puede esperar</p>
              <h2 id="process-heading" className="serena-display mt-2 text-[32px] font-medium leading-tight text-[#26384b] sm:text-[38px]">Un proceso, paso a paso.</h2>
            </div>
            <p className="max-w-[390px] text-sm leading-6 text-[#687582]">Le explicamos cada etapa y coordinamos el servicio junto a su familia.</p>
          </div>
          <div className="relative mt-9 grid gap-7 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
            <div className="absolute left-[20px] top-5 hidden h-px w-[calc(100%-40px)] bg-[#d5dde3] lg:block" />
            {steps.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="relative flex gap-4 lg:block">
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d4dce3] bg-[#f3f5f6] text-[#465d73] lg:mb-5">
                  <Icon className="h-[17px] w-[17px]" strokeWidth={1.7} />
                </div>
                <div className="pt-1 lg:pt-0">
                  <span className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#88939c]">0{index + 1}</span>
                  <h3 className="mt-1.5 text-[15px] font-semibold text-[#304256]">{title}</h3>
                  <p className="mt-2 max-w-[230px] text-[12px] leading-[1.7] text-[#6d7985]">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="chat" className="scroll-mt-24 border-y border-[#dbe1e6] bg-[#e9eef1] px-4 py-10 sm:px-8 sm:py-12" aria-labelledby="chat-heading">
          <div className="mx-auto grid max-w-[1060px] gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-start lg:gap-12">
            <div className="pt-1">
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#788591]">Estamos para escucharle</p>
              <h2 id="chat-heading" className="serena-display mt-2 text-[32px] font-medium leading-tight text-[#26384b] sm:text-[38px]">Comience con una pregunta.</h2>
              <p className="mt-3 max-w-[390px] text-sm leading-6 text-[#667482]">Puede consultar una póliza, la disponibilidad de servicios o cómo iniciar una reserva.</p>
              <div className="mt-6 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#7c8892]">Otras consultas frecuentes</p>
                {extraQuestions.map((question) => (
                  <button key={question} onClick={() => handleSend(question)} className="group flex w-full items-center justify-between gap-3 border-b border-[#d4dce2] py-2.5 text-left text-[12px] font-medium text-[#4d6073] hover:text-[#26384b]">
                    <span>{question}</span><ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#84919b] transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
              <a href="https://wa.me/584142005050" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-[#30475e] underline decoration-[#aab7c1] underline-offset-4 hover:decoration-[#30475e]">
                <Phone className="h-3.5 w-3.5" /> WhatsApp +58 414-200-5050
              </a>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#d5dde3] bg-[#fbfcfc] shadow-[0_12px_34px_rgba(38,56,75,.07)]">
              <div className="flex items-center justify-between border-b border-[#e4e9ec] px-4 py-3.5 sm:px-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8edf0] text-[#42596e]"><MessageCircle className="h-4 w-4" /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-[#304256]">Chat Serena</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#798691]"><span className="h-1.5 w-1.5 rounded-full bg-[#6c8479]" /> Atención las 24 horas</p>
                  </div>
                </div>
                <span className="rounded-full border border-[#dce3e8] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.1em] text-[#788590]">Maqueta</span>
              </div>
              <div className="flex min-h-[180px] max-h-[340px] flex-col gap-3 overflow-y-auto px-4 py-4 sm:px-5" aria-live="polite">
                {messages.length === 0 ? (
                  <div className="max-w-[300px] rounded-r-xl rounded-bl-xl bg-[#eef2f4] px-4 py-3 text-[12px] leading-5 text-[#536272]">
                    Bienvenido. Elija una consulta o escriba su pregunta para comenzar.
                  </div>
                ) : messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`max-w-[88%] rounded-xl px-4 py-3 text-[12px] leading-[1.65] ${message.role === 'visitor' ? 'ml-auto rounded-br-sm bg-[#30475e] text-white' : 'mr-auto rounded-bl-sm bg-[#eef2f4] text-[#536272]'}`}>
                    {message.text}
                  </div>
                ))}
                {isReplying && <div className="mr-auto flex items-center gap-1.5 rounded-r-xl rounded-bl-xl bg-[#eef2f4] px-4 py-3" aria-label="Preparando respuesta"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7b8995]" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7b8995] [animation-delay:120ms]" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7b8995] [animation-delay:240ms]" /></div>}
              </div>
              <form onSubmit={onSubmit} className="border-t border-[#e4e9ec] p-3 sm:p-4">
                <div className="flex items-end gap-2 rounded-md border border-[#d8e0e5] bg-white p-1.5 pl-3 transition-colors focus-within:border-[#8293a2]">
                  <textarea
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={onInputKeyDown}
                    placeholder="Escriba su consulta aquí..."
                    rows={1}
                    maxLength={500}
                    className="max-h-[100px] min-h-[38px] flex-1 resize-y bg-transparent py-2 text-[13px] leading-5 text-[#29394a] outline-none placeholder:text-[#9aa4ac]"
                    aria-label="Escriba su consulta"
                    data-testid="input-chat"
                  />
                  <button type="submit" disabled={!inputValue.trim() || isReplying} className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#30475e] text-white transition-colors hover:bg-[#26394d] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Enviar mensaje" data-testid="btn-send-message">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 px-1 text-[10px] leading-4 text-[#87929b]">Demostración local: no consulta pólizas, disponibilidad ni registra reservas.</p>
              </form>
            </div>
          </div>
        </section>

        <section id="preguntas" className="scroll-mt-24 py-14 sm:py-[72px]" aria-labelledby="faq-heading">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#788591]">Información útil</p>
              <h2 id="faq-heading" className="serena-display mt-2 text-[32px] font-medium leading-tight text-[#26384b] sm:text-[38px]">Preguntas frecuentes.</h2>
            </div>
            <p className="max-w-[350px] text-sm leading-6 text-[#687582]">Respuestas directas sobre documentos, cobertura, tiempos y atención.</p>
          </div>
          <div className="grid gap-x-10 lg:grid-cols-2">
            {[questions.slice(0, 5), questions.slice(5)].map((column, columnIndex) => (
              <div key={columnIndex}>
                {column.map((item, index) => (
                  <details key={item.question} className="group border-b border-[#dbe1e6]">
                    <summary className="flex cursor-pointer list-none items-center gap-4 py-[17px] text-left">
                      <span className="w-6 shrink-0 font-mono text-[10px] text-[#8a959e]">{String(columnIndex * 5 + index + 1).padStart(2, '0')}</span>
                      <span className="flex-1 text-[13px] font-semibold leading-5 text-[#35475a] sm:text-[14px]">{item.question}</span>
                      <ChevronDown className="serena-chevron h-4 w-4 shrink-0 text-[#778590] transition-transform duration-200" />
                    </summary>
                    <div className="pb-5 pl-10 pr-4 text-[12px] leading-[1.8] text-[#697682] sm:text-[13px]">{item.answer}</div>
                  </details>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-2 flex flex-col gap-5 rounded-lg border border-[#d9e0e5] bg-[#e9eef1] px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-8">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dce4e9] text-[#40566c]"><CircleHelp className="h-5 w-5" /></span>
            <div>
              <h2 className="serena-display text-[22px] leading-tight text-[#26384b]">No tiene que resolverlo a solas.</h2>
              <p className="mt-1.5 max-w-[500px] text-[12px] leading-5 text-[#667482]">Nuestro equipo está disponible las 24 horas para orientarle por teléfono o WhatsApp.</p>
            </div>
          </div>
          <a href="https://wa.me/584142005050" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-[#30475e] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#26394d]">
            Contactar al equipo <ArrowUpRight className="h-4 w-4" />
          </a>
        </section>
      </main>

      <footer className="border-t border-[#dbe1e6] bg-[#edf0f2]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 py-6 text-[11px] text-[#77838e] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2">
            <span className="serena-display text-[18px] text-[#30475e]">Serena</span>
            <span className="h-3 w-px bg-[#cbd3da]" />
            <span>Acompañamiento funerario</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="https://wa.me/584142005050" target="_blank" rel="noopener noreferrer" className="hover:text-[#30475e]">WhatsApp +58 414-200-5050</a>
            <a href="/login" className="inline-flex items-center gap-1.5 hover:text-[#30475e]" data-testid="link-footer-login"><Users className="h-3.5 w-3.5" /> Acceso de personal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
