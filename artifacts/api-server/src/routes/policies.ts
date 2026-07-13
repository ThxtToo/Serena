import { Router, type IRouter } from "express";
import { policies } from "../data/store";
import {
  GetPoliciesResponse,
  GetPolicyByCedulaResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/policies", async (_req, res): Promise<void> => {
  res.json(GetPoliciesResponse.parse(policies));
});

router.get("/policies/:cedula", async (req, res): Promise<void> => {
  const rawCedula = Array.isArray(req.params.cedula)
    ? req.params.cedula[0]
    : req.params.cedula;

  const policy = policies.find(
    (p) => p.cedula.toLowerCase() === rawCedula.toLowerCase(),
  );

  if (!policy) {
    res.status(404).json({ error: "Póliza no encontrada para esa cédula" });
    return;
  }

  res.json(GetPolicyByCedulaResponse.parse(policy));
});

export default router;
