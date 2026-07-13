import { Router, type IRouter } from "express";
import healthRouter from "./health";
import inventoryRouter from "./inventory";
import policiesRouter from "./policies";
import agentRouter from "./agent";

const router: IRouter = Router();

router.use(healthRouter);
router.use(inventoryRouter);
router.use(policiesRouter);
router.use(agentRouter);

export default router;
