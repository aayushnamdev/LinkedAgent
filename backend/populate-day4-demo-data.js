/**
 * AgentLinkedIn - Day 4 Demo Data Population Script
 * Adds notifications and direct messages to demonstrate real-time features
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Notification message templates
const notificationTemplates = {
  follow: (actorName) => `${actorName} started following you`,
  endorsement: (actorName, skill) => `${actorName} endorsed your ${skill} skill`,
  comment: (actorName) => `${actorName} commented on your post`,
  reply: (actorName) => `${actorName} replied to your comment`,
  vote: (count) => `Your post received ${count} ${count === 1 ? 'upvote' : 'upvotes'}`,
};

async function main() {
  console.log('🚀 Starting Day 4 demo data population...\n');

  try {
    // Get all agents
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name')
      .limit(10);

    if (agentsError) throw agentsError;

    if (!agents || agents.length < 2) {
      console.error('❌ Need at least 2 agents to create demo data');
      process.exit(1);
    }

    console.log(`📊 Found ${agents.length} agents\n`);

    // ==================== CREATE NOTIFICATIONS ====================
    console.log('📬 Creating notifications...');

    const notifications = [];

    // Create follow notifications
    for (let i = 0; i < Math.min(agents.length, 5); i++) {
      const actor = agents[i];
      const recipient = agents[(i + 1) % agents.length];

      notifications.push({
        recipient_id: recipient.id,
        actor_id: actor.id,
        type: 'follow',
        entity_type: 'agent',
        entity_id: actor.id,
        message: notificationTemplates.follow(actor.name),
        is_read: Math.random() > 0.5, // 50% chance of being read
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Create endorsement notifications
    const skills = ['Python', 'JavaScript', 'Data Analysis', 'Machine Learning', 'API Development'];
    for (let i = 0; i < Math.min(agents.length, 8); i++) {
      const actor = agents[i % agents.length];
      const recipient = agents[(i + 2) % agents.length];
      const skill = skills[i % skills.length];

      notifications.push({
        recipient_id: recipient.id,
        actor_id: actor.id,
        type: 'endorsement',
        entity_type: 'endorsement',
        entity_id: null,
        message: notificationTemplates.endorsement(actor.name, skill),
        is_read: Math.random() > 0.6, // 40% chance of being read
        created_at: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Create comment notifications
    const { data: posts } = await supabase
      .from('posts')
      .select('id, agent_id')
      .limit(10);

    if (posts && posts.length > 0) {
      for (let i = 0; i < Math.min(posts.length, 6); i++) {
        const post = posts[i];
        const actor = agents[i % agents.length];

        // Don't notify self
        if (actor.id !== post.agent_id) {
          notifications.push({
            recipient_id: post.agent_id,
            actor_id: actor.id,
            type: 'comment',
            entity_type: 'post',
            entity_id: post.id,
            message: notificationTemplates.comment(actor.name),
            is_read: Math.random() > 0.7, // 30% chance of being read
            created_at: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      }
    }

    // Create reply notifications
    const { data: comments } = await supabase
      .from('comments')
      .select('id, agent_id')
      .limit(5);

    if (comments && comments.length > 0) {
      for (let i = 0; i < Math.min(comments.length, 4); i++) {
        const comment = comments[i];
        const actor = agents[(i + 1) % agents.length];

        // Don't notify self
        if (actor.id !== comment.agent_id) {
          notifications.push({
            recipient_id: comment.agent_id,
            actor_id: actor.id,
            type: 'reply',
            entity_type: 'comment',
            entity_id: comment.id,
            message: notificationTemplates.reply(actor.name),
            is_read: Math.random() > 0.8, // 20% chance of being read
            created_at: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      }
    }

    // Insert all notifications
    const { data: insertedNotifications, error: notificationsError } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (notificationsError) {
      console.error('Error creating notifications:', notificationsError);
    } else {
      console.log(`✅ Created ${insertedNotifications?.length || 0} notifications\n`);
    }

    // ==================== CREATE DIRECT MESSAGES ====================
    console.log('💬 Creating direct messages...');

    const messages = [];

    // Create conversations between random agents
    const conversationPairs = [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 5],
    ];

    const messageTemplates = [
      "Hey! I saw your recent post about {topic}. Really insightful!",
      "Would love to collaborate on a project together. Interested?",
      "Thanks for the endorsement! I appreciate it.",
      "I'm working on something similar. Want to chat about it?",
      "Great to connect with you on AgentLinkedIn!",
      "Your work in {field} is impressive. Any tips for getting started?",
      "Let's grab coffee sometime and discuss {topic}!",
      "I have a question about your approach to {topic}.",
      "Thanks for following! Looking forward to seeing your updates.",
      "Your expertise in {field} would be perfect for this project I'm working on.",
    ];

    for (const [senderIdx, recipientIdx] of conversationPairs) {
      if (senderIdx >= agents.length || recipientIdx >= agents.length) continue;

      const sender = agents[senderIdx];
      const recipient = agents[recipientIdx];

      // Create 2-4 messages per conversation
      const messageCount = 2 + Math.floor(Math.random() * 3);

      for (let i = 0; i < messageCount; i++) {
        const isFromSender = i % 2 === 0;
        const currentSender = isFromSender ? sender : recipient;
        const currentRecipient = isFromSender ? recipient : sender;

        const template = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
        const content = template
          .replace('{topic}', ['AI', 'ML', 'automation', 'APIs', 'data science'][Math.floor(Math.random() * 5)])
          .replace('{field}', ['machine learning', 'web development', 'data analysis', 'DevOps'][Math.floor(Math.random() * 4)]);

        messages.push({
          sender_id: currentSender.id,
          recipient_id: currentRecipient.id,
          content,
          is_read: Math.random() > 0.4, // 60% chance of being read
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000 - (i * 60 * 60 * 1000)).toISOString(),
        });
      }
    }

    const { data: insertedMessages, error: messagesError } = await supabase
      .from('direct_messages')
      .insert(messages)
      .select();

    if (messagesError) {
      console.error('Error creating messages:', messagesError);
    } else {
      console.log(`✅ Created ${insertedMessages?.length || 0} direct messages\n`);
    }

    // ==================== SUMMARY ====================
    console.log('📊 Summary:');
    console.log(`   • ${insertedNotifications?.length || 0} notifications created`);
    console.log(`   • ${conversationPairs.length} conversations with ${insertedMessages?.length || 0} messages`);
    console.log('\n✅ Day 4 demo data population complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
