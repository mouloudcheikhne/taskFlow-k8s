import { Router } from "express";
import taskController from "../controller/task.controller.js";

const router = Router();

/**
 * @openapi
 * /tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Créer une tâche
 *     description: Le corps doit contenir un titre et une description (champs obligatoires).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskCreateBody'
 *           example:
 *             title: "Réviser OpenAPI"
 *             description: "Relire la doc des routes /tasks"
 *     responses:
 *       201:
 *         description: Tâche créée et renvoyée dans `task`.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskPayloadResponse'
 *       400:
 *         description: Titre ou description manquant.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *   get:
 *     tags: [Tasks]
 *     summary: Lister toutes les tâches
 *     description: Retourne la liste complète des documents `Task` en base.
 *     responses:
 *       200:
 *         description: Liste récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TasksListResponse'
 */
router.post("/", taskController.createTask);

router.get("/", taskController.getTasks);

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Récupérer une tâche par identifiant
 *     description: |
 *       `id` doit être un identifiant MongoDB valide (`_id` au format hexadécimal, 24 caractères).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *         description: Identifiant MongoDB de la tâche
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Tâche trouvée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskPayloadResponse'
 *       404:
 *         description: Aucune tâche pour cet identifiant.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *   put:
 *     tags: [Tasks]
 *     summary: Mettre à jour une tâche
 *     description: Remplace le titre et la description. Les deux champs sont requis dans le corps.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *         description: Identifiant MongoDB de la tâche
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdateBody'
 *     responses:
 *       200:
 *         description: Tâche mise à jour ; le document renvoyé est dans `task`.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskPayloadResponse'
 *       400:
 *         description: Identifiant absent ou titre / description manquants.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *       404:
 *         description: Tâche introuvable.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *       500:
 *         description: Erreur serveur (ex. identifiant invalide côté MongoDB).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *   delete:
 *     tags: [Tasks]
 *     summary: Supprimer une tâche
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *         description: Identifiant MongoDB de la tâche
 *     responses:
 *       200:
 *         description: Suppression confirmée (corps = message texte uniquement).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageOnlyResponse'
 *       404:
 *         description: Tâche introuvable.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
router.get("/:id", taskController.getTaskById);

router.put("/:id", taskController.updateTask);

router.delete("/:id", taskController.deleteTask);

/**
 * @openapi
 * /tasks/{id}/complete:
 *   post:
 *     tags: [Tasks]
 *     summary: Marquer une tâche comme terminée
 *     description: Met le champ `completed` à `true` et renvoie le document mis à jour.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *         description: Identifiant MongoDB de la tâche
 *     responses:
 *       200:
 *         description: Tâche marquée comme complétée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskPayloadResponse'
 *       404:
 *         description: Tâche introuvable.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
router.post("/:id/complete", taskController.completeTask);

export default router;
