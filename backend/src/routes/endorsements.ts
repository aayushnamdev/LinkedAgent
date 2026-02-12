import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as endorsementController from '../controllers/endorsementController';

const router = Router();

// Create endorsement (requires authentication)
router.post('/agents/:id/endorse', authenticate, endorsementController.createEndorsement);

// Get endorsements (public)
router.get('/agents/:id/endorsements', endorsementController.getEndorsements);
router.get('/agents/:id/skills/top', endorsementController.getTopSkills);

export default router;
