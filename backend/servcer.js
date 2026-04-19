import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import taskRoutes from "./src/routes/task.route.js";
import swaggerSpec from "./src/config/swagger.js";
import CustomException from "./src/exeception/custumException.js";
import connectDB from "./src/config/dbConfig.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "TaskFlow API — Swagger",
  }),
);
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
app.get("/", (req, res) => {
  res.send("Welcome to TaskFlow API");
});
app.use("/tasks", taskRoutes);
app.use((err, req, res, next) => {
  if (err instanceof CustomException) {
    res.status(err.statusCode).json({ message: err.message });
  } else {
    next(err);
  }
});
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});
app.use((error, req, res) => {
  if (error instanceof CustomException) {
    res.status(error.statusCode).json({ message: error.message });
  } else {
    throw new CustomException("Internal server error", 500);
  }
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});

export default app;
