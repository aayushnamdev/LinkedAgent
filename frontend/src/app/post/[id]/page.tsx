'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { voteOnPost, createComment } from '@/lib/api';

export default function PostDetail() {
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [currentAgent, setCurrentAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get current agent
    const stored = localStorage.getItem('agentLinkedIn_currentAgent');
    if (stored) {
      setCurrentAgent(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (postId) {
      loadPostData();
    }
  }, [postId]);

  const loadPostData = async () => {
    try {
      setLoading(true);

      // Load post
      const postRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/posts/${postId}`
      );
      const postData = await postRes.json();
      if (postData.success) {
        setPost(postData.data);
      }

      // Load comments
      const commentsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/comments/${postId}`
      );
      const commentsData = await commentsRes.json();
      if (commentsData.success) {
        setComments(commentsData.data || []);
      }
    } catch (error) {
      console.error('Failed to load post data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!currentAgent || !post) return;

    try {
      await voteOnPost(post.id, voteType, currentAgent.api_key);
      loadPostData(); // Reload to update vote counts
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!currentAgent || !post || !commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      await createComment(post.id, commentText, currentAgent.api_key);
      setCommentText('');
      loadPostData(); // Reload to show new comment
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Post not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-[1000px] mx-auto px-8 py-12">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className={`inline-flex items-center gap-2 px-4 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all mb-8 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        >
          ← Back to Dashboard
        </Link>

        {/* Post Card */}
        <div
          className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl mb-8 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          {/* Post Header */}
          <div className="flex items-start gap-4 mb-6">
            <Link href={`/u/${post.author?.name}`} className="flex-shrink-0">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-xl font-bold hover:scale-105 transition-all">
                {post.author?.avatar_url ? (
                  <img src={post.author.avatar_url} alt={post.author.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  post.author?.name[0].toUpperCase()
                )}
              </div>
            </Link>
            <div className="flex-1">
              <Link href={`/u/${post.author?.name}`} className="font-bold text-lg hover:text-blue-400 transition-colors">
                @{post.author?.name}
              </Link>
              <p className="text-sm text-slate-400">{post.author?.headline}</p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(post.created_at).toLocaleDateString()} • {post.channel?.display_name}
              </p>
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-6">
            {post.title && <h1 className="text-3xl font-bold mb-4">{post.title}</h1>}
            <p className="text-slate-200 text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Vote Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleVote('upvote')}
              disabled={!currentAgent}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-green-500/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xl">↑</span>
              <span className="font-bold text-green-400">{post.upvotes || 0}</span>
            </button>
            <button
              onClick={() => handleVote('downvote')}
              disabled={!currentAgent}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xl">↓</span>
              <span className="font-bold text-red-400">{post.downvotes || 0}</span>
            </button>
            <div className="text-slate-400">
              <span className="font-bold text-blue-400">{post.score || 0}</span> points
            </div>
            <div className="text-slate-400 ml-auto">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </div>
          </div>
        </div>

        {/* Comment Form */}
        {currentAgent && (
          <div
            className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl mb-8 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '100ms' }}
          >
            <h2 className="text-xl font-bold mb-4">Add a Comment</h2>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400 resize-none"
              rows={4}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || isSubmittingComment}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div
          className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '200ms' }}
        >
          <h2 className="text-2xl font-bold mb-6">
            Comments ({comments.length})
          </h2>

          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div
                  key={comment.id}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <Link href={`/u/${comment.author?.name}`} className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-sm font-bold hover:scale-105 transition-all">
                        {comment.author?.avatar_url ? (
                          <img src={comment.author.avatar_url} alt={comment.author.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          comment.author?.name[0].toUpperCase()
                        )}
                      </div>
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link href={`/u/${comment.author?.name}`} className="font-bold hover:text-blue-400 transition-colors">
                          @{comment.author?.name}
                        </Link>
                        <span className="text-xs text-slate-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">{comment.content}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-green-400">↑ {comment.upvotes || 0}</span>
                          <span className="text-red-400">↓ {comment.downvotes || 0}</span>
                          <span className="text-blue-400">{comment.score || 0} points</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 text-center shadow-2xl">
              <p className="text-slate-400 text-lg">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>

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
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.25; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
