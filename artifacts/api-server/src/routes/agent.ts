import { Router, type IRouter } from "express";
import Groq from "groq-sdk";
import { policies, inventory } from "../data/store";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const TOOLS: Groq.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "buscar_poliza",
      description:
        "Busca la póliza funeraria de un titular por su cédula de identidad venezolana. Devuelve todos los datos: plan, límite en USD, estatus de pago, cobertura incluida (sala, vehículo, cofre) y datos de contacto de la aseguradora. Úsala automáticamente cuando el usuario mencione una cédula.",
      parameters: {
        type: "object",
        properties: {
          cedula: {
            type: "string",
            description: "Cédula venezolana con o sin prefijo (ej: V-14555666, V14555666, 14555666)",
          },
        },
        required: ["cedula"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "consultar_inventario",
      description:
        "Consulta el estado actual del inventario de la funeraria: salas de velación (con su disponibilidad), flota vehicular (carrozas y unidades) y cofres (tipos y cantidades en stock). Úsala cuando el usuario pregunte por disponibilidad de espacios, vehículos o ataúdes.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reservar_sala",
      description:
        "Reserva una sala de velación disponible en el sistema, marcándola como Reservada. Solo funciona si la sala está Disponible. Llama a consultar_inventario primero si no conoces qué salas hay o cuáles están libres.",
      parameters: {
        type: "object",
        properties: {
          sala: {
            type: "string",
            description: "Nombre exacto de la sala según el inventario (ej: 'Básica B', 'Sala VIP C', 'Sala Serena D')",
          },
        },
        required: ["sala"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "asignar_vehiculo",
      description:
        "Asigna un vehículo disponible de la flota para el traslado o servicio, marcándolo como Asignado. Solo si está Disponible. Consulta el inventario si no estás seguro de cuáles están libres.",
      parameters: {
        type: "object",
        properties: {
          vehiculo: {
            type: "string",
            description: "Nombre exacto del vehículo según el inventario (ej: 'EcoVan', 'Carroza Familiar', 'Ford de Gala')",
          },
        },
        required: ["vehiculo"],
      },
    },
  },
];

const SYSTEM_PROMPT = `Eres Serena, asistente virtual de Serena Gestión Funeraria (Caracas, Venezuela). Atiendes familias en duelo y personal interno.

TONO: Español venezolano formal y cálido. Con familias: empático, pausado. Con personal: directo. Sin frases vacías. Máximo 3 párrafos por respuesta.

HERRAMIENTAS:
- buscar_poliza: cuando el usuario mencione una cédula (V-XXXXXXX, C-XXXXXXX o solo números), úsala de inmediato. Solvente → muestra cobertura y teléfono aseguradora. Suspendida → indica que deben regularizar con la aseguradora antes del servicio.
- consultar_inventario: úsala antes de reservar para ver disponibilidad actual.
- reservar_sala: confirma el inventario primero. Informa sala reservada y próximo paso.
- asignar_vehiculo: confirma vehículo asignado; el equipo coordinará horarios.

PROCESO FUNERARIO (resumido):
Documentos: Certificado de Defunción EV-14, cédula del fallecido, cédula del familiar responsable, póliza si aplica.
Pasos: 1) Registro y verificación de póliza/pago → 2) Traslado a instalaciones (2-4h) → 3) Preparación (4-6h) → 4) Velatorio (12-24h) → 5) Traslado a cementerio/crematorio.
Pago sin póliza: transferencia (Banesco/BDV/Mercantil), pago móvil, USD efectivo, Zelle.

ASEGURADORAS: Seguros Caracas (0212)501-50-00 · Mercantil 0800-MERCANTIL · Mapfre (0212)201-73-00 · La Previsora (0212)564-11-11 · La Occidental (0261)200-66-00.

REGLAS: Nunca inventes datos ni precios. Para precios sin póliza o emergencias humanas: +58 414-200-5050 (24h/WhatsApp). Ante angustia emocional, responde con empatía antes que con información.`;

function executeTool(name: string, args: Record<string, string>): string {
  if (name === "buscar_poliza") {
    const raw = (args.cedula ?? "").trim();
    // Normalize: strip dashes/spaces, add V- prefix if missing
    const normalized = raw.replace(/[-\s]/g, "").toUpperCase();
    const policy = policies.find((p) => {
      const pNorm = p.cedula.replace(/[-\s]/g, "").toUpperCase();
      return pNorm === normalized || pNorm === "V" + normalized || pNorm === "C" + normalized;
    });
    if (!policy) {
      return JSON.stringify({
        encontrado: false,
        cedula: raw,
        mensaje: "No se encontró ninguna póliza registrada para esa cédula en nuestro sistema.",
      });
    }
    return JSON.stringify({ encontrado: true, ...policy });
  }

  if (name === "consultar_inventario") {
    const disponibles = {
      salas: Object.entries(inventory.salas)
        .filter(([, s]) => s === "Disponible")
        .map(([n]) => n),
      vehiculos: Object.entries(inventory.vehiculos)
        .filter(([, s]) => s === "Disponible")
        .map(([n]) => n),
    };
    return JSON.stringify({
      inventario_completo: {
        salas: inventory.salas,
        vehiculos: inventory.vehiculos,
        cofres: inventory.cofres,
      },
      disponibles,
    });
  }

  if (name === "reservar_sala") {
    const sala = (args.sala ?? "").trim();
    // Fuzzy match: try exact first, then case-insensitive
    const key =
      Object.keys(inventory.salas).find((k) => k === sala) ??
      Object.keys(inventory.salas).find((k) => k.toLowerCase() === sala.toLowerCase());

    if (!key) {
      const opciones = Object.keys(inventory.salas).join(", ");
      return JSON.stringify({
        exito: false,
        error: `La sala "${sala}" no existe. Salas registradas: ${opciones}.`,
      });
    }
    if (inventory.salas[key] !== "Disponible") {
      return JSON.stringify({
        exito: false,
        sala: key,
        estadoActual: inventory.salas[key],
        error: `La sala "${key}" no está disponible actualmente. Estado: ${inventory.salas[key]}.`,
      });
    }
    inventory.salas[key] = "Reservada";
    return JSON.stringify({
      exito: true,
      sala: key,
      nuevoEstado: "Reservada",
      mensaje: `Sala "${key}" reservada exitosamente. El equipo le contactará en los próximos minutos para coordinar los detalles.`,
    });
  }

  if (name === "asignar_vehiculo") {
    const vehiculo = (args.vehiculo ?? "").trim();
    const key =
      Object.keys(inventory.vehiculos).find((k) => k === vehiculo) ??
      Object.keys(inventory.vehiculos).find((k) => k.toLowerCase() === vehiculo.toLowerCase());

    if (!key) {
      const opciones = Object.keys(inventory.vehiculos).join(", ");
      return JSON.stringify({
        exito: false,
        error: `El vehículo "${vehiculo}" no existe. Flota disponible: ${opciones}.`,
      });
    }
    if (inventory.vehiculos[key] !== "Disponible") {
      return JSON.stringify({
        exito: false,
        vehiculo: key,
        estadoActual: inventory.vehiculos[key],
        error: `El vehículo "${key}" no está disponible. Estado: ${inventory.vehiculos[key]}.`,
      });
    }
    inventory.vehiculos[key] = "Asignado";
    return JSON.stringify({
      exito: true,
      vehiculo: key,
      nuevoEstado: "Asignado",
      mensaje: `Vehículo "${key}" asignado para el servicio. El equipo de traslado coordinará el horario directamente con la familia.`,
    });
  }

  return JSON.stringify({ error: `Herramienta no reconocida: ${name}` });
}

router.post("/agent/chat", async (req, res): Promise<void> => {
  const { messages } = req.body as {
    messages: Array<{ role: string; content: string }>;
  };

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  const apiKey = process.env["GROQ_API_KEY"];
  if (!apiKey) {
    res.status(500).json({ error: "GROQ_API_KEY not configured" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (data: object) => {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const groq = new Groq({ apiKey });

    const chatMessages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    let iterations = 0;
    const MAX_ITERATIONS = 6;

    while (iterations < MAX_ITERATIONS) {
      iterations++;

      // Primary: llama-3.1-8b-instant (500K tokens/day free).
      // Fallback: llama3-groq-8b-8192-tool-use-preview if rate-limited.
      let response: Awaited<ReturnType<typeof groq.chat.completions.create>>;
      try {
        response = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: chatMessages,
          tools: TOOLS,
          tool_choice: "auto",
          temperature: 0.55,
          max_tokens: 1000,
        });
      } catch (e: unknown) {
        const status = (e as { status?: number }).status;
        if (status === 429) {
          response = await groq.chat.completions.create({
            model: "llama3-groq-8b-8192-tool-use-preview",
            messages: chatMessages,
            tools: TOOLS,
            tool_choice: "auto",
            temperature: 0.55,
            max_tokens: 1000,
          });
        } else throw e;
      }

      const choice = response.choices[0];
      if (!choice) break;

      const assistantMsg = choice.message;
      chatMessages.push(assistantMsg as Groq.Chat.ChatCompletionMessageParam);

      if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
        for (const toolCall of assistantMsg.tool_calls) {
          const toolName = toolCall.function.name;
          let toolArgs: Record<string, string> = {};
          try {
            toolArgs = JSON.parse(toolCall.function.arguments) as Record<string, string>;
          } catch {
            // ignore
          }

          send({ type: "tool_call", tool: toolName, args: toolArgs });
          const result = executeTool(toolName, toolArgs);
          const parsed = JSON.parse(result) as object;
          send({ type: "tool_result", tool: toolName, result: parsed });

          chatMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: result,
          });
        }
        continue;
      }

      // Stream response word by word
      const content = assistantMsg.content ?? "";
      if (content) {
        const words = content.split(" ");
        for (let i = 0; i < words.length; i++) {
          send({ type: "content", content: i === 0 ? words[i] : " " + words[i] });
          await new Promise((r) => setTimeout(r, 18));
        }
      }
      break;
    }

    send({ type: "done" });
    res.end();
  } catch (err) {
    logger.error({ err }, "Agent chat error");
    const status = (err as { status?: number }).status;
    const msg =
      status === 429
        ? "El servicio de IA alcanzó su límite temporal de uso. Por favor espere unos minutos e intente nuevamente."
        : "Error al procesar la solicitud. Por favor intente nuevamente.";
    send({ type: "error", message: msg });
    res.end();
  }
});

export default router;
