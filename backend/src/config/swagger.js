import path from "path";
import { fileURLToPath } from "url";
import swaggerJSDoc from "swagger-jsdoc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "TaskFlow API",
      version: "1.0.0",
      description:
        "Documentation OpenAPI de l’API TaskFlow : gestion des tâches (CRUD + marquer comme terminé).",
    },
    servers: [
      { url: "/", description: "Même origine que le serveur (ex. http://localhost:3000)" },
    ],
    tags: [{ name: "Tasks", description: "Opérations sur les tâches" }],
    components: {
      schemas: {
        Task: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Identifiant MongoDB" },
            title: { type: "string", example: "Préparer la démo" },
            description: { type: "string", example: "Slides + script" },
            completed: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        TaskCreateBody: {
          type: "object",
          required: ["title", "description"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
          },
        },
        TaskUpdateBody: {
          type: "object",
          required: ["title", "description"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
          },
        },
        ErrorMessage: {
          type: "object",
          properties: {
            message: { type: "string", example: "Task not found" },
          },
        },
        MessageOnlyResponse: {
          type: "object",
          required: ["message"],
          properties: {
            message: { type: "string", example: "Task deleted successfully" },
          },
        },
        TaskPayloadResponse: {
          type: "object",
          required: ["message", "task"],
          properties: {
            message: { type: "string" },
            task: { $ref: "#/components/schemas/Task" },
          },
        },
        TasksListResponse: {
          type: "object",
          required: ["message", "tasks"],
          properties: {
            message: { type: "string" },
            tasks: {
              type: "array",
              items: { $ref: "#/components/schemas/Task" },
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "../routes/task.route.js")],
};

export default swaggerJSDoc(options);
