import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { formParser } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/registerUser").post(formParser,registerUser);

export default router;