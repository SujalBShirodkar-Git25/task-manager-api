import { Router } from "express";
import { loginUser, registerUser, logoutUser } from "../controllers/user.controller.js";
import { formParser } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/registerUser").post(formParser,registerUser);

router.route("/login").post(formParser,loginUser);

router.route("/logout").post(verifyJWT,logoutUser);

export default router;