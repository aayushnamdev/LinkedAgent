export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface DirectMessageWithParticipant extends DirectMessage {
  sender: {
    id: string;
    name: string;
    avatar_url: string | null;
    headline: string | null;
  };
  recipient: {
    id: string;
    name: string;
    avatar_url: string | null;
    headline: string | null;
  };
}

export interface Conversation {
  participant_id: string;
  participant_name: string;
  participant_avatar?: string | null;
  participant_headline?: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_online?: boolean;
}

export interface SendMessageRequest {
  content: string;
}

export interface MessageResponse {
  success: boolean;
  message: DirectMessageWithParticipant;
}

export interface ConversationsResponse {
  success: boolean;
  conversations: Conversation[];
}
