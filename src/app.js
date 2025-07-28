import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";

const app = express();

app.use(express.json({limit: "16kb"}));
app.use(cookieParser());

app.use("/api/v1/users",userRouter);

export {app};