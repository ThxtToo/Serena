import { Router, type IRouter } from "express";
import { inventory, addInventoryItem } from "../data/store";
import {
  UpdateInventoryItemBody,
  GetInventoryResponse,
  UpdateInventoryItemResponse,
} from "@workspace/api-zod";
const router: IRouter = Router();

router.get("/inventory", async (_req, res): Promise<void> => {
  res.json(GetInventoryResponse.parse(inventory));
});

router.put("/inventory", async (req, res): Promise<void> => {
  const parsed = UpdateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { categoria, item, valor } = parsed.data;

  if (categoria === "cofres") {
    const numVal = parseInt(valor, 10);
    if (isNaN(numVal)) {
      res.status(400).json({ error: "El valor para cofres debe ser un número" });
      return;
    }
    inventory.cofres[item] = numVal;
  } else {
    inventory[categoria][item] = valor;
  }

  res.json(UpdateInventoryItemResponse.parse(inventory));
});

router.post("/inventory/add", async (req, res): Promise<void> => {
  const { categoria, nombre, valorInicial } = req.body as {
    categoria?: string;
    nombre?: string;
    valorInicial?: string;
  };

  if (!["salas", "vehiculos", "cofres"].includes(categoria ?? "")) {
    res.status(400).json({ error: "categoria must be salas, vehiculos, or cofres" });
    return;
  }
  if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
    res.status(400).json({ error: "nombre is required" });
    return;
  }

  addInventoryItem(
    categoria as "salas" | "vehiculos" | "cofres",
    nombre.trim(),
    valorInicial ?? "Disponible",
  );
  res.json(GetInventoryResponse.parse(inventory));
});

export default router;
