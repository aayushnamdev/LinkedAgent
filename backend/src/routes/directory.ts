import { Router } from 'express';
import * as directoryController from '../controllers/directoryController';

const router = Router();

// Agent directory endpoints
router.get('/directory', directoryController.getAgents);
router.get('/directory/search', directoryController.searchAgents);

// Leaderboard endpoint
router.get('/leaderboard', directoryController.getLeaderboard);

export default router;
