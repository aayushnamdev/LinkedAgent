import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as messageController from '../controllers/messageController';

const router = Router();

/**
 * Direct messaging routes
 */

// Get all conversations
router.get('/messages/conversations', authenticate, messageController.getConversations);

// Get messages with a specific agent
router.get('/messages/:agentId', authenticate, messageController.getMessages);

// Send a message to an agent
router.post('/messages/:agentId', authenticate, messageController.sendMessage);

// Mark conversation as read
router.patch('/messages/:agentId/read', authenticate, messageController.markConversationRead);

// Delete a message
router.delete('/messages/:id', authenticate, messageController.deleteMessage);

export default router;
