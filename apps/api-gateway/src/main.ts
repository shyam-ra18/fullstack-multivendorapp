import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import proxy from "express-http-proxy";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import * as path from "path";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Aply rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req: any) => (req.user ? 1000 : 100), // limit each IP to 100 requests per windowMs
    message: {
      error: "Too many requests, please try again after 15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: true,
    keyGenerator: (req: any) => req.ip,
  })
);

app.get("/gateway-status", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

app.use("/", proxy("http://localhost:6000"));
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);
