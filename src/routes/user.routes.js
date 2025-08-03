import { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAccessToken, resetPassword, getUser, updateUser, deleteUser } from "../controllers/user.controller.js";
import { formParser } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(formParser,registerUser);

router.route("/login").post(formParser,loginUser);

router.route("/logout").post(verifyJWT,logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/reset-password").post(verifyJWT,formParser,resetPassword);

router.route("/get-user").get(verifyJWT,getUser);

router.route("/update").patch(verifyJWT,formParser,updateUser);

router.route("/delete").delete(verifyJWT,deleteUser);

export default router;