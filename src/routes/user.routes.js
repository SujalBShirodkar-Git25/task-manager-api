import { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { formParser } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(formParser,registerUser);

router.route("/login").post(formParser,loginUser);

router.route("/logout").post(verifyJWT,logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

export default router;