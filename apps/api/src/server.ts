import cors from "cors";
import express from "express";
import { routes } from "./infrastructure/http/routes";

const port = Number(process.env.PORT) || 3000;
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "*",
  }),
);
app.use(express.json());

app.use("/tasks", routes.tasks);
app.use("/groups", routes.groups);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
