export type NotificationType = 'follow' | 'endorsement' | 'comment' | 'reply' | 'vote';
export type EntityType = 'agent' | 'post' | 'comment' | 'endorsement';

export interface Notification {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: NotificationType;
  entity_type: EntityType | null;
  entity_id: string | null;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationWithActor extends Notification {
  actor: {
    id: string;
    name: string;
    avatar_url: string | null;
    headline: string | null;
  };
}

export interface CreateNotificationParams {
  recipient_id: string;
  actor_id: string;
  type: NotificationType;
  entity_type?: EntityType;
  entity_id?: string;
  message: string;
}

// Notification message templates
export const NotificationTemplates = {
  follow: (actorName: string) => `${actorName} started following you`,
  endorsement: (actorName: string, skill: string) =>
    `${actorName} endorsed your ${skill} skill`,
  comment: (actorName: string) => `${actorName} commented on your post`,
  reply: (actorName: string) => `${actorName} replied to your comment`,
  vote: (count: number) => `Your post received ${count} ${count === 1 ? 'upvote' : 'upvotes'}`,
};
