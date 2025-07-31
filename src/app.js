import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import taskRouter from "./routes/task.routes.js"

const app = express();

app.use(express.json({limit: "16kb"}));
app.use(cookieParser());

app.use("/api/v1/users",userRouter);
app.use("/api/v1/tasks",taskRouter);

export {app};