import { Router, type IRouter } from "express";
import Groq from "groq-sdk";
import { policies, inventory } from "../data/store";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Tools available to the agent
const TOOLS: Groq.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "buscar_poliza",
      description:
        "Busca la póliza de un asegurado por su número de cédula venezolana. Retorna todos los datos de la póliza incluyendo cobertura, límite en USD, estatus y datos de contacto de la aseguradora.",
      parameters: {
        type: "object",
        properties: {
          cedula: {
            type: "string",
            description: "Número de cédula venezolana (ej: V-14555666 o V14555666)",
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
        "Consulta el inventario completo de la funeraria: salas de velación disponibles, flota vehicular y cofres disponibles con cantidades.",
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
        "Reserva una sala de velación específica marcándola como Reservada en el sistema. Solo se puede reservar salas que estén Disponibles.",
      parameters: {
        type: "object",
        properties: {
          sala: {
            type: "string",
            description: "Nombre exacto de la sala a reservar (ej: 'Básica B', 'Sala VIP C')",
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
        "Asigna un vehículo de la flota funeraria para un servicio, marcándolo como Asignado.",
      parameters: {
        type: "object",
        properties: {
          vehiculo: {
            type: "string",
            description: "Nombre exacto del vehículo a asignar (ej: 'EcoVan', 'Carroza Familiar')",
          },
        },
        required: ["vehiculo"],
      },
    },
  },
];

const SYSTEM_PROMPT = `Eres Serena, la asistente virtual de una funeraria venezolana llamada Serena Gestión Funeraria. Atiendes tanto a familias en momentos de duelo como al personal interno.

Tu misión es asistir de manera cálida, respetuosa y eficiente. Cuando una familia necesita ayuda, primero validas su situación con empatía, luego ofreces información concreta y útil.

CAPACIDADES:
- Verificar pólizas de seguros funerarios (buscar_poliza) — cuando alguien menciona una cédula, búscala automáticamente
- Consultar disponibilidad de salas, vehículos y cofres (consultar_inventario)
- Reservar salas de velación (reservar_sala)
- Asignar vehículos para traslados (asignar_vehiculo)

REGLAS:
- Habla siempre en español venezolano, con tono profesional pero cálido
- Cuando veas una cédula en el mensaje (formato V-XXXXXXXX o C-XXXXXXXX), úsala directamente con buscar_poliza
- Si una póliza está suspendida, comunícalo con tacto e indica el contacto de la aseguradora para regularizarla
- Cuando muestres datos de póliza, incluye siempre el teléfono de la aseguradora
- Para reservas, confirma disponibilidad primero consultando el inventario
- Número de emergencias humanas: +58 414-200-5050 (disponible 24/7)
- Nunca inventes datos ni pólizas que no existan en el sistema

Aseguradoras venezolanas presentes en nuestro sistema: Seguros Caracas, Mercantil Seguros, Mapfre Venezuela, La Previsora, La Occidental.`;

// Execute tool calls
function executeTool(name: string, args: Record<string, string>): string {
  if (name === "buscar_poliza") {
    const cedula = (args.cedula ?? "").replace(/\s/g, "").toUpperCase();
    const policy = policies.find(
      (p) =>
        p.cedula.replace(/\s/g, "").toUpperCase() === cedula ||
        p.cedula.replace(/[-\s]/g, "").toUpperCase() === cedula.replace(/[-\s]/g, ""),
    );
    if (!policy) {
      return JSON.stringify({ error: "Póliza no encontrada para la cédula proporcionada." });
    }
    return JSON.stringify(policy);
  }

  if (name === "consultar_inventario") {
    return JSON.stringify({
      salas: inventory.salas,
      vehiculos: inventory.vehiculos,
      cofres: inventory.cofres,
    });
  }

  if (name === "reservar_sala") {
    const sala = args.sala ?? "";
    const estado = inventory.salas[sala];
    if (!estado) {
      return JSON.stringify({ error: `La sala "${sala}" no existe en el inventario.` });
    }
    if (estado !== "Disponible") {
      return JSON.stringify({
        error: `La sala "${sala}" no está disponible. Estado actual: ${estado}.`,
      });
    }
    inventory.salas[sala] = "Reservada";
    return JSON.stringify({ success: true, sala, nuevoEstado: "Reservada", mensaje: `Sala "${sala}" reservada exitosamente.` });
  }

  if (name === "asignar_vehiculo") {
    const vehiculo = args.vehiculo ?? "";
    const estado = inventory.vehiculos[vehiculo];
    if (!estado) {
      return JSON.stringify({ error: `El vehículo "${vehiculo}" no existe en la flota.` });
    }
    if (estado !== "Disponible") {
      return JSON.stringify({
        error: `El vehículo "${vehiculo}" no está disponible. Estado actual: ${estado}.`,
      });
    }
    inventory.vehiculos[vehiculo] = "Asignado";
    return JSON.stringify({ success: true, vehiculo, nuevoEstado: "Asignado", mensaje: `Vehículo "${vehiculo}" asignado exitosamente.` });
  }

  return JSON.stringify({ error: `Herramienta desconocida: ${name}` });
}

router.post("/agent/chat", async (req, res): Promise<void> => {
  const { messages } = req.body as {
    messages: Array<{ role: string; content: string }>;
    sessionId?: string;
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

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (data: object) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
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

    // Agentic loop: keep calling until no more tool calls
    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (iterations < MAX_ITERATIONS) {
      iterations++;

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: chatMessages,
        tools: TOOLS,
        tool_choice: "auto",
        temperature: 0.6,
        max_tokens: 1024,
      });

      const choice = response.choices[0];
      if (!choice) break;

      const assistantMsg = choice.message;
      chatMessages.push(assistantMsg as Groq.Chat.ChatCompletionMessageParam);

      // If there are tool calls, execute them
      if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
        for (const toolCall of assistantMsg.tool_calls) {
          const toolName = toolCall.function.name;
          let toolArgs: Record<string, string> = {};
          try {
            toolArgs = JSON.parse(toolCall.function.arguments) as Record<string, string>;
          } catch {
            // ignore parse errors
          }

          // Notify frontend of tool use
          send({ type: "tool_call", tool: toolName, args: toolArgs });

          const result = executeTool(toolName, toolArgs);

          send({ type: "tool_result", tool: toolName, result: JSON.parse(result) as object });

          chatMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: result,
          });
        }
        // Continue loop to get final response
        continue;
      }

      // No tool calls — stream the text response
      const content = assistantMsg.content ?? "";
      if (content) {
        // Simulate word-by-word streaming for better UX
        const words = content.split(" ");
        for (let i = 0; i < words.length; i++) {
          const chunk = i === 0 ? words[i] : " " + words[i];
          send({ type: "content", content: chunk });
          // Small delay for streaming effect
          await new Promise((r) => setTimeout(r, 20));
        }
      }
      break;
    }

    send({ type: "done" });
    res.end();
  } catch (err) {
    logger.error({ err }, "Agent chat error");
    send({ type: "error", message: "Error al procesar la solicitud. Intente nuevamente." });
    res.end();
  }
});

export default router;
