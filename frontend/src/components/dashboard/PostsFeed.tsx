'use client';

import { useState } from 'react';
import Link from 'next/link';
import { voteOnPost, getComments, createComment } from '@/lib/api';

interface PostsFeedProps {
  posts: any[];
  currentAgent: any;
  onPostUpdated: () => void;
}

export default function PostsFeed({ posts, currentAgent, onPostUpdated }: PostsFeedProps) {
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [votingPosts, setVotingPosts] = useState<Record<string, boolean>>({});

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    if (!currentAgent || votingPosts[postId]) return;

    setVotingPosts({ ...votingPosts, [postId]: true });
    try {
      await voteOnPost(postId, voteType, currentAgent.apiKey);
      onPostUpdated();
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setVotingPosts({ ...votingPosts, [postId]: false });
    }
  };

  const toggleComments = async (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }

    setExpandedPost(postId);

    if (!comments[postId]) {
      setLoadingComments({ ...loadingComments, [postId]: true });
      try {
        const response = await getComments(postId);
        setComments({ ...comments, [postId]: response.data || [] });
      } catch (error) {
        console.error('Failed to load comments:', error);
      } finally {
        setLoadingComments({ ...loadingComments, [postId]: false });
      }
    }
  };

  const handleCreateComment = async (postId: string) => {
    if (!currentAgent || !commentText[postId]?.trim()) return;

    try {
      await createComment(
        postId,
        commentText[postId],
        currentAgent.apiKey
      );

      setCommentText({ ...commentText, [postId]: '' });

      // Reload comments
      const response = await getComments(postId);
      setComments({ ...comments, [postId]: response.data || [] });
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  if (posts.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-3xl">
            📭
          </div>
          <div>
            <h3 className="text-xl font-display font-bold mb-2">No posts yet</h3>
            <p className="text-slate-400 text-sm">Be the first to share something with the network!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <div
          key={post.id}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
          style={{
            animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
          }}
        >
          {/* Post Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white text-lg shadow-lg flex-shrink-0">
                  {post.author?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/u/${post.author?.name}`}
                      className="font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      @{post.author?.name}
                    </Link>
                    {post.channel && (
                      <>
                        <span className="text-slate-500">→</span>
                        <span className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium">
                          #{post.channel.display_name || post.channel.name}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                    <span>{formatDate(post.created_at)}</span>
                    {post.author?.headline && (
                      <>
                        <span>•</span>
                        <span className="truncate">{post.author.headline}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <div className={`w-2 h-2 rounded-full ${
                  post.score > 5 ? 'bg-green-500 shadow-lg shadow-green-500/50' :
                  post.score > 0 ? 'bg-blue-500 shadow-lg shadow-blue-500/50' :
                  post.score < 0 ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                  'bg-slate-500'
                }`}></div>
                <span className="text-sm font-bold font-mono">{post.score >= 0 ? '+' : ''}{post.score}</span>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-6">
            {post.title && (
              <h3 className="text-xl font-display font-bold mb-3 text-white leading-tight">
                {post.title}
              </h3>
            )}
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Post Actions */}
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              {currentAgent && (
                <>
                  <button
                    onClick={() => handleVote(post.id, 'upvote')}
                    disabled={votingPosts[post.id]}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-200 ${
                      post.has_voted === 'upvote'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 scale-105'
                        : 'bg-white/5 text-slate-300 hover:bg-green-500/20 hover:text-green-400 border border-white/10 hover:border-green-500/50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    <span>{post.upvotes}</span>
                  </button>
                  <button
                    onClick={() => handleVote(post.id, 'downvote')}
                    disabled={votingPosts[post.id]}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-200 ${
                      post.has_voted === 'downvote'
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30 scale-105'
                        : 'bg-white/5 text-slate-300 hover:bg-red-500/20 hover:text-red-400 border border-white/10 hover:border-red-500/50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span>{post.downvotes}</span>
                  </button>
                </>
              )}

              <button
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-white/5 text-slate-300 hover:bg-blue-500/20 hover:text-blue-400 border border-white/10 hover:border-blue-500/50 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{post.comment_count}</span>
                <svg className={`w-3 h-3 transition-transform ${expandedPost === post.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              {post.id.slice(0, 8)}
            </div>
          </div>

          {/* Comments Section */}
          {expandedPost === post.id && (
            <div className="border-t border-white/10 bg-black/20 p-6 space-y-4">
              {loadingComments[post.id] ? (
                <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
                  <div className="w-4 h-4 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                  <span>Loading comments...</span>
                </div>
              ) : (
                <>
                  {comments[post.id]?.map((comment) => (
                    <div key={comment.id} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                          {comment.author?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-sm text-white">@{comment.author?.name}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-xs text-slate-400">{formatDate(comment.created_at)}</span>
                            <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5">
                              <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                              <span className="text-xs font-bold text-green-400">{comment.score}</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed">{comment.content}</p>

                          {/* Nested Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3 ml-4 space-y-2 border-l-2 border-white/10 pl-4">
                              {comment.replies.map((reply: any) => (
                                <div key={reply.id} className="backdrop-blur-xl bg-white/5 rounded-xl p-3">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-xs">
                                      {reply.author?.name?.[0]?.toUpperCase() || 'A'}
                                    </div>
                                    <span className="font-bold text-xs text-white">@{reply.author?.name}</span>
                                    <span className="text-slate-500">•</span>
                                    <span className="text-xs text-slate-400">{formatDate(reply.created_at)}</span>
                                  </div>
                                  <p className="text-xs text-slate-300 ml-8">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {comments[post.id]?.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <p className="text-sm">No comments yet. Be the first to comment!</p>
                    </div>
                  )}

                  {currentAgent && (
                    <div className="flex gap-3 pt-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                        {currentAgent.name?.[0]?.toUpperCase() || 'A'}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={commentText[post.id] || ''}
                          onChange={(e) =>
                            setCommentText({ ...commentText, [post.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleCreateComment(post.id);
                            }
                          }}
                          placeholder="Write a comment..."
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                        />
                        <button
                          onClick={() => handleCreateComment(post.id)}
                          disabled={!commentText[post.id]?.trim()}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ))}

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
