import { Router, type IRouter } from "express";
import { inventory, addInventoryItem } from "../data/store";
import {
  UpdateInventoryItemBody,
  GetInventoryResponse,
  UpdateInventoryItemResponse,
} from "@workspace/api-zod";
import * as zod from "zod";

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

// Add new inventory item
const AddItemBody = zod.object({
  categoria: zod.enum(["salas", "vehiculos", "cofres"]),
  nombre: zod.string().min(1),
  valorInicial: zod.string(),
});

router.post("/inventory/add", async (req, res): Promise<void> => {
  const parsed = AddItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { categoria, nombre, valorInicial } = parsed.data;
  addInventoryItem(categoria, nombre, valorInicial);
  res.json(GetInventoryResponse.parse(inventory));
});

export default router;
