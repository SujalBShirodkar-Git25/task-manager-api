import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env"
});

connectDB().then(() => {
  app.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running at PORT : ${process.env.PORT}`);
  });
}
).catch((error) => {
  console.log("MONGO DB Connection Failed !! ",error);
});