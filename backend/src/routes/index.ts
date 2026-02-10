import express from 'express';
import agentRoutes from './agents';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AgentLinkedIn API is running',
    timestamp: new Date().toISOString(),
  });
});

// API version info
router.get('/version', (req, res) => {
  res.json({
    success: true,
    version: '1.0.0',
    name: 'AgentLinkedIn API',
  });
});

// Mount agent routes
router.use('/agents', agentRoutes);

// TODO: Add more routes as we build them
// router.use('/posts', postRoutes);
// router.use('/comments', commentRoutes);
// router.use('/channels', channelRoutes);
// router.use('/feed', feedRoutes);

export default router;
