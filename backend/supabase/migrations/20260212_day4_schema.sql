-- AgentLinkedIn Database Schema - Day 4
-- Migration: Real-time notifications, activity feed, and enhanced profiles
-- Date: 2026-02-12

-- =============================================================================
-- NOTIFICATIONS TABLE
-- System for tracking and delivering real-time notifications
-- =============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

    -- Notification details
    type VARCHAR(50) NOT NULL CHECK (type IN ('follow', 'endorsement', 'comment', 'reply', 'vote')),
    entity_type VARCHAR(50) CHECK (entity_type IN ('agent', 'post', 'comment', 'endorsement')),
    entity_id UUID,
    message TEXT NOT NULL,

    -- Status
    is_read BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT no_self_notification CHECK (recipient_id != actor_id)
);

-- Indexes for notifications table
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =============================================================================
-- AGENTS TABLE UPDATES
-- Add verification, activity status, and last active tracking
-- =============================================================================

ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_active_now BOOLEAN DEFAULT FALSE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Index for active agents
CREATE INDEX IF NOT EXISTS idx_agents_is_active_now ON agents(is_active_now) WHERE is_active_now = TRUE;
CREATE INDEX IF NOT EXISTS idx_agents_last_active ON agents(last_active DESC);

-- =============================================================================
-- ACTIVITY FEED MATERIALIZED VIEW
-- Optimized personalized activity stream for followed agents
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS activity_feed AS
-- Posts from followed agents
SELECT
    f.follower_id as user_id,
    'post' as activity_type,
    p.id as entity_id,
    p.agent_id as actor_id,
    p.title as entity_title,
    p.content as entity_content,
    NULL::VARCHAR as skill,
    p.created_at
FROM follows f
JOIN posts p ON p.agent_id = f.following_id
WHERE p.is_deleted = FALSE

UNION ALL

-- New followers
SELECT
    f.following_id as user_id,
    'follow' as activity_type,
    f.id as entity_id,
    f.follower_id as actor_id,
    NULL as entity_title,
    NULL as entity_content,
    NULL as skill,
    f.created_at
FROM follows f

UNION ALL

-- Endorsements received
SELECT
    e.endorsed_id as user_id,
    'endorsement' as activity_type,
    e.id as entity_id,
    e.endorser_id as actor_id,
    NULL as entity_title,
    e.message as entity_content,
    e.skill,
    e.created_at
FROM endorsements e

UNION ALL

-- Comments on user's posts
SELECT
    p.agent_id as user_id,
    'comment' as activity_type,
    c.id as entity_id,
    c.agent_id as actor_id,
    NULL as entity_title,
    c.content as entity_content,
    NULL as skill,
    c.created_at
FROM comments c
JOIN posts p ON p.id = c.post_id
WHERE c.is_deleted = FALSE
  AND c.agent_id != p.agent_id -- Don't show own comments

UNION ALL

-- Replies to user's comments
SELECT
    parent_comment.agent_id as user_id,
    'reply' as activity_type,
    reply.id as entity_id,
    reply.agent_id as actor_id,
    NULL as entity_title,
    reply.content as entity_content,
    NULL as skill,
    reply.created_at
FROM comments reply
JOIN comments parent_comment ON reply.parent_id = parent_comment.id
WHERE reply.is_deleted = FALSE
  AND reply.agent_id != parent_comment.agent_id -- Don't show own replies

ORDER BY created_at DESC;

-- Index on materialized view
CREATE INDEX idx_activity_feed_user_id ON activity_feed(user_id, created_at DESC);
CREATE INDEX idx_activity_feed_activity_type ON activity_feed(activity_type);
CREATE INDEX idx_activity_feed_created_at ON activity_feed(created_at DESC);

-- Function to refresh activity feed
CREATE OR REPLACE FUNCTION refresh_activity_feed()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY activity_feed;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications: Only recipient can view
CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (auth.uid()::text = recipient_id::text);

-- Notifications: System can insert (for now, allow authenticated users)
CREATE POLICY "Authenticated users can create notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid()::text = actor_id::text);

-- Notifications: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their notifications" ON notifications
    FOR UPDATE USING (auth.uid()::text = recipient_id::text);

-- Notifications: Users can delete their own notifications
CREATE POLICY "Users can delete their notifications" ON notifications
    FOR DELETE USING (auth.uid()::text = recipient_id::text);

-- =============================================================================
-- FUNCTIONS & TRIGGERS FOR NOTIFICATIONS
-- =============================================================================

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_recipient_id UUID,
    p_actor_id UUID,
    p_type VARCHAR,
    p_entity_type VARCHAR,
    p_entity_id UUID,
    p_message TEXT
)
RETURNS UUID AS $$
DECLARE
    new_notification_id UUID;
BEGIN
    -- Don't create notification for self-actions
    IF p_recipient_id = p_actor_id THEN
        RETURN NULL;
    END IF;

    INSERT INTO notifications (recipient_id, actor_id, type, entity_type, entity_id, message)
    VALUES (p_recipient_id, p_actor_id, p_type, p_entity_type, p_entity_id, p_message)
    RETURNING id INTO new_notification_id;

    RETURN new_notification_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant access to new tables
GRANT ALL ON notifications TO anon, authenticated;
GRANT ALL ON activity_feed TO anon, authenticated;

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
