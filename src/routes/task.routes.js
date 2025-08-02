import Router from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTask, getAllTask, getTask, updateTask } from "../controllers/task.controller.js";
import { formParser } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT,formParser,createTask);

router.route("/get-tasks").get(verifyJWT,getAllTask);

router.route("/get-task/:id").get(verifyJWT,getTask);

router.route("/update/:id").patch(verifyJWT,formParser,updateTask);

export default router;