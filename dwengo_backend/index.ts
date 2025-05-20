import express, { Express } from "express";
import dotenv from "dotenv";
import errorHandler from "./middleware/errorMiddleware";
import swaggerUi from "swagger-ui-express";
import { httpLogger } from "./utils/logger";
import { logResponseBody } from "./middleware/logResponse";
import routes from "./routes";
import corsMiddleware from "./config/cors";
import { swaggerDocument } from "./config/swagger";
import path from "path";

dotenv.config();
const app: Express = express();

// Middleware
app.use(corsMiddleware);
app.use(httpLogger);
app.use(express.json());
// Vergroot de maximale JSON-body naar 70 MB zodat grote payloads (bijv. Base64-afbeeldingen) geaccepteerd worden
app.use(express.json({ limit: '70mb' }));

// Vergroot de maximale URL-encoded body naar 70 MB (voor form submissions e.d.) en sta rich data toe (geneste objecten)
app.use(express.urlencoded({ limit: '70mb', extended: true }));
app.options("*", (_, res): void => {
  res.sendStatus(200);
});

if (process.env.NODE_ENV !== "production") {
  app.use(logResponseBody());
}
// Routes
app.use("/api", routes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// Error Handler
app.use(errorHandler);

export default app;
