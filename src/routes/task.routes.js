import Router from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTask } from "../controllers/task.controller.js";
import { formParser } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT,formParser,createTask);

export default router;