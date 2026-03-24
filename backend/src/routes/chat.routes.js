import express from "express"
import { 
    checkToken,
    serializeUser,
    authorize,
 } from "../middlewares/protect.js";
import {
    getContacts,
    createContact,
    inboxController,
    saveController
} from "../controllers/chat.controller.js";

export const chatRouter=express.Router();

chatRouter.use(checkToken);
chatRouter.use(serializeUser);
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 */

// Contact routes
/**
 * @swagger
 * /chat/contacts:
 *   get:
 *     summary: Retrieve user contact list
 *     tags: [Chat routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of contacts
 */
chatRouter.get("/contacts",getContacts);

/**
 * @swagger
 * /chat/createContact/{id}:
 *   post:
 *     summary: Create a new contact connection
 *     tags: [Chat routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to add as a contact
 *     responses:
 *       201:
 *         description: Contact created successfully
 */
chatRouter.post("/createContact/:id",createContact);

//Message routes
/**
 * @swagger
 * /chat/messages/{id}:
 *   get:
 *     summary: Get message history with a specific contact
 *     tags: [Chat routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 */
chatRouter.get("/messages/:id",inboxController);

/**
 * @swagger
 * /chat/message/{id}:
 *   post:
 *     summary: Send a message to a contact
 *     tags: [Chat routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newMessage:
 *                 type: object
 *                 properties:
 *                   sender:
 *                     type: string
 *                   message:
 *                     type: string
 *     responses:
 *       200:
 *         description: Message sent
 */
chatRouter.post("/message/:id",saveController);