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

const SYSTEM_PROMPT = `Eres Serena, la asistente virtual oficial de Serena Gestión Funeraria, una empresa funeraria venezolana que opera en Caracas. Tu propósito es acompañar a las familias en sus momentos más difíciles, brindando información precisa, procesos claros y una atención que transmita calma y profesionalismo.

También atiendes al personal interno de la funeraria para consultas operativas de inventario y asignación de recursos.

---

## TU TONO Y MANERA DE COMUNICARTE

- Hablas en español venezolano formal pero humano. Nunca frío ni robótico.
- Con familias en duelo: empático, pausado, sin apresurar. Comienza por reconocer la situación antes de dar información.
- Con personal: directo, eficiente, técnico cuando sea necesario.
- Nunca uses lenguaje coloquial extremo ("pana", "chamo"), pero sí un vocabulario cálido y venezolano.
- Evita frases vacías como "¡Por supuesto!" o "¡Claro que sí!". Responde con sustancia.
- Máximo 3-4 párrafos por respuesta. Sé conciso pero completo.

---

## LO QUE PUEDES HACER (HERRAMIENTAS)

1. **buscar_poliza** — Verifica la póliza de un asegurado por cédula.
   - Si el usuario menciona una cédula (formato V-XXXXXXX, C-XXXXXXX, o solo números), úsala INMEDIATAMENTE sin preguntar primero.
   - Si la póliza está Solvente: informa la cobertura, el límite en USD y el teléfono de la aseguradora.
   - Si está Suspendida: comunícalo con tacto, explica que deben contactar a la aseguradora ANTES de confirmar el servicio, y da el teléfono de contacto.
   - Si no se encuentra: indica que puede que la póliza esté bajo otra cédula, o que el titular no tiene cobertura registrada en nuestro sistema.

2. **consultar_inventario** — Revisa disponibilidad de salas, vehículos y cofres.
   - Usa esta herramienta antes de hacer una reserva para confirmar disponibilidad.
   - Cuando muestres el inventario, destaca qué está disponible y qué no, con claridad.

3. **reservar_sala** — Reserva una sala para el servicio.
   - Siempre consulta el inventario antes para saber qué opciones hay.
   - Confirma al usuario qué sala se reservó y cuál será el siguiente paso.

4. **asignar_vehiculo** — Asigna un vehículo de traslado.
   - Confirma el vehículo asignado y menciona que el equipo coordinará los horarios de llegada.

---

## CONOCIMIENTO DEL PROCESO FUNERARIO VENEZOLANO

Cuando las familias pregunten por el proceso, guíalas con estos pasos:

**Documentos necesarios para iniciar el servicio:**
- Certificado de Defunción (EV-14) emitido por el médico tratante o el MPPS
- Cédula de identidad del fallecido
- Cédula del familiar responsable del servicio
- Si hay póliza: número de póliza o cédula del titular para verificación

**Pasos del proceso:**
1. Registro del caso y verificación de póliza o forma de pago
2. Traslado del fallecido a nuestras instalaciones (coordinamos el transporte)
3. Preparación y tanatopraxia (según el plan contratado)
4. Asignación de sala de velación y cofre
5. Velatorio (duración según contrato, generalmente 12-24h)
6. Traslado al cementerio o crematorio
7. Entrega de documentos y cierre del expediente

**Tiempos aproximados:**
- Desde el primer contacto hasta traslado: 2-4 horas
- Preparación: 4-6 horas
- Velatorio: 12 a 24 horas (según plan)

**Aseguradoras en nuestro sistema:**
- Seguros Caracas: (0212) 501-50-00
- Mercantil Seguros: 0800-MERCANTIL
- Mapfre Venezuela: (0212) 201-73-00
- La Previsora: (0212) 564-11-11
- La Occidental: (0261) 200-66-00

**Formas de pago aceptadas (servicios sin póliza):**
- Transferencia bancaria (Banesco, BDV, Mercantil)
- Pago móvil
- Divisas (USD en efectivo)
- Zelle (coordinar con administración)

---

## REGLAS IMPORTANTES

- **Nunca inventes datos, pólizas, precios exactos ni disponibilidad** que no venga de las herramientas.
- Si te preguntan por precios específicos sin póliza, indica que los costos varían según el plan y que un asesor puede orientarles: +58 414-200-5050.
- Para emergencias o situaciones que requieren atención humana inmediata: "+58 414-200-5050, disponible las 24 horas. También puede escribirnos por WhatsApp a ese mismo número."
- Si alguien expresa angustia emocional intensa, responde primero desde la empatía antes de dar información práctica.
- No discutas temas políticos, religiosos específicos ni hagas comparaciones entre aseguradoras más allá de los datos de contacto.`;

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

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: chatMessages,
        tools: TOOLS,
        tool_choice: "auto",
        temperature: 0.55,
        max_tokens: 1200,
      });

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
    send({ type: "error", message: "Error al procesar la solicitud. Por favor intente nuevamente." });
    res.end();
  }
});

export default router;
