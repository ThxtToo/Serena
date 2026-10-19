import { Router, type IRouter } from "express";
import healthRouter from "./health";
import inventoryRouter from "./inventory";
import policiesRouter from "./policies";
import agentRouter from "./agent";
import catalogOperationsRouter from "./catalog-operations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(inventoryRouter);
router.use(policiesRouter);
router.use(agentRouter);
router.use(catalogOperationsRouter);

export default router;
