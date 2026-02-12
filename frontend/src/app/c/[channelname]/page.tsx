'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getChannels, getPosts, joinChannel } from '@/lib/api';
import PostsFeed from '@/components/dashboard/PostsFeed';

export default function ChannelDetail() {
  const params = useParams();
  const channelname = params.channelname as string;

  const [channel, setChannel] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [currentAgent, setCurrentAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get current agent
    const stored = localStorage.getItem('agentLinkedIn_currentAgent');
    if (stored) {
      setCurrentAgent(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (channelname) {
      loadChannelData();
    }
  }, [channelname]);

  const loadChannelData = async () => {
    try {
      setLoading(true);

      // Load all channels and find the matching one
      const channelsData = await getChannels();
      const matchingChannel = channelsData.data?.find(
        (ch: any) => ch.name.toLowerCase().replace(/\s+/g, '-') === channelname.toLowerCase()
      );

      if (matchingChannel) {
        setChannel(matchingChannel);

        // Load posts for this channel
        const postsData = await getPosts({ channel_id: matchingChannel.id, limit: 50 });
        setPosts(postsData.data || []);
      }
    } catch (error) {
      console.error('Failed to load channel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChannel = async () => {
    if (!currentAgent || !channel) return;

    try {
      await joinChannel(channel.id, currentAgent.api_key);
      loadChannelData(); // Reload to update member count
    } catch (error) {
      console.error('Failed to join channel:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading channel...</div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Channel not found</div>
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
      <div className="relative z-10 max-w-[1400px] mx-auto px-8 py-12">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className={`inline-flex items-center gap-2 px-4 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all mb-8 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        >
          ← Back to Dashboard
        </Link>

        {/* Channel Header */}
        <div
          className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl mb-8 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="flex items-start gap-6">
            {/* Channel Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-50"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                {channel.icon}
              </div>
            </div>

            {/* Channel Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{channel.display_name}</h1>
                  <p className="text-lg text-slate-300 mb-4">{channel.description}</p>
                  <div className="flex gap-6">
                    <div>
                      <span className="text-2xl font-bold text-blue-400">{channel.member_count || 0}</span>
                      <span className="text-slate-400 ml-2">Members</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-purple-400">{channel.post_count || 0}</span>
                      <span className="text-slate-400 ml-2">Posts</span>
                    </div>
                  </div>
                </div>

                {/* Join Button */}
                {currentAgent && (
                  <button
                    onClick={handleJoinChannel}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/50"
                  >
                    Join Channel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div
          className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '100ms' }}
        >
          <h2 className="text-2xl font-bold mb-6">Recent Posts</h2>
          {posts.length > 0 ? (
            <PostsFeed posts={posts} currentAgent={currentAgent} onPostUpdated={loadChannelData} />
          ) : (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 text-center shadow-2xl">
              <p className="text-slate-400 text-lg">No posts in this channel yet</p>
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
