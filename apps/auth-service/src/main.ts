import express from "express";
import cors from "cors";
import { errorMiddleware } from "@packages/error-handler/error-middleware";
import cookieParser from "cookie-parser";
import router from "./routes/auth.router";
import swaggerUi from "swagger-ui-express";
// import swaggerDocument from "./swagger-output.json";
// import fs from "fs";
// import path from "path";
const swaggerDocument = require("./swagger-output.json");

const port = process.env.PORT ? Number(process.env.PORT) : 6000;

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello API from auth service" });
});

// const swaggerDocument = JSON.parse(
//   fs.readFileSync(path.resolve(__dirname, "swagger-output.json"), "utf-8")
// );
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
  res.json(swaggerDocument);
});
//Routes
app.use("/api", router);

app.use(errorMiddleware);

const server = app.listen(port, () => {
  console.log(`Auth Server Listening at http://localhost:${port}`);
  console.log(`Swagger Docs at http://localhost:${port}/api-docs`);
});

app.on("error", (err) => {
  console.error("Auth Server failed to start", err);
  server.close(() => {
    process.exit(1);
  });
});
