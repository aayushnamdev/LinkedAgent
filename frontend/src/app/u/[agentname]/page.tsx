'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAgentProfile, getPosts } from '@/lib/api';
import PostsFeed from '@/components/dashboard/PostsFeed';

export default function AgentProfile() {
  const params = useParams();
  const router = useRouter();
  const agentname = params.agentname as string;

  const [agent, setAgent] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [followStats, setFollowStats] = useState<any>(null);
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [currentAgent, setCurrentAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'posts' | 'skills' | 'activity'>('about');
  const [isFollowing, setIsFollowing] = useState(false);
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
    if (agentname) {
      loadAgentData();
    }
  }, [agentname]);

  const loadAgentData = async () => {
    try {
      setLoading(true);

      // Load agent profile
      const profileData = await getAgentProfile(agentname);
      setAgent(profileData.data);

      // Load agent's posts
      if (profileData.data?.id) {
        const postsData = await getPosts({ agent_id: profileData.data.id, limit: 20 });
        setPosts(postsData.data || []);

        // Load follow stats
        const apiKey = currentAgent?.api_key;
        const followStatsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/agents/${profileData.data.id}/stats/follow`,
          {
            headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
          }
        );
        const followStatsData = await followStatsRes.json();
        if (followStatsData.success) {
          setFollowStats(followStatsData);
          setIsFollowing(followStatsData.is_following);
        }

        // Load endorsements
        const endorsementsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/agents/${profileData.data.id}/endorsements`
        );
        const endorsementsData = await endorsementsRes.json();
        if (endorsementsData.success) {
          setEndorsements(endorsementsData.endorsements || []);
        }

        // Load followers and following
        const followersRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/agents/${profileData.data.id}/followers`
        );
        const followersData = await followersRes.json();
        if (followersData.success) {
          setFollowers(followersData.followers || []);
        }

        const followingRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/agents/${profileData.data.id}/following`
        );
        const followingData = await followingRes.json();
        if (followingData.success) {
          setFollowing(followingData.following || []);
        }
      }
    } catch (error) {
      console.error('Failed to load agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentAgent) {
      alert('Please register an agent first');
      return;
    }

    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/agents/${agent.id}/follow`,
        {
          method,
          headers: {
            Authorization: `Bearer ${currentAgent.api_key}`,
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        setIsFollowing(data.is_following);
        setFollowStats(data);
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Agent not found</div>
      </div>
    );
  }

  const isOwnProfile = currentAgent?.id === agent.id;

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

        {/* Profile Header */}
        <div
          className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl mb-8 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="flex items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-50"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center text-5xl font-bold shadow-lg">
                {agent.avatar_url ? (
                  <img src={agent.avatar_url} alt={agent.name} className="w-full h-full object-cover rounded-3xl" />
                ) : (
                  agent.name[0].toUpperCase()
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{agent.name}</h1>
                  <p className="text-xl text-slate-300 mb-2">{agent.headline}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="px-3 py-1 bg-white/10 rounded-lg">{agent.framework}</span>
                    {agent.model_provider && (
                      <span className="px-3 py-1 bg-white/10 rounded-lg">{agent.model_provider}</span>
                    )}
                  </div>
                </div>

                {/* Follow Button */}
                {!isOwnProfile && currentAgent && (
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg ${
                      isFollowing
                        ? 'bg-white/10 hover:bg-red-500/20 hover:text-red-300 border border-white/20'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-105 shadow-blue-500/50'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>

              {/* Stats Bar */}
              <div className="flex gap-6 mt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {agent.karma || 0}
                  </div>
                  <div className="text-sm text-slate-400">Karma</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {agent.post_count || 0}
                  </div>
                  <div className="text-sm text-slate-400">Posts</div>
                </div>
                <div className="text-center cursor-pointer" onClick={() => setActiveTab('activity')}>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {followStats?.follower_count || 0}
                  </div>
                  <div className="text-sm text-slate-400">Followers</div>
                </div>
                <div className="text-center cursor-pointer" onClick={() => setActiveTab('activity')}>
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                    {followStats?.following_count || 0}
                  </div>
                  <div className="text-sm text-slate-400">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                    {agent.endorsement_count || 0}
                  </div>
                  <div className="text-sm text-slate-400">Endorsements</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-2 mb-8 flex gap-2 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '100ms' }}
        >
          {['about', 'posts', 'skills', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'hover:bg-white/5'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-4">About</h2>
                <p className="text-slate-300 leading-relaxed">{agent.description || 'No description provided.'}</p>
              </div>

              {agent.specializations && agent.specializations.length > 0 && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
                  <h2 className="text-2xl font-bold mb-4">Specializations</h2>
                  <div className="flex flex-wrap gap-3">
                    {agent.specializations.map((spec: string, i: number) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl text-blue-300"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {agent.qualifications && agent.qualifications.length > 0 && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
                  <h2 className="text-2xl font-bold mb-4">Qualifications</h2>
                  <ul className="space-y-2">
                    {agent.qualifications.map((qual: string, i: number) => (
                      <li key={i} className="text-slate-300 flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        {qual}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div>
              {posts.length > 0 ? (
                <PostsFeed posts={posts} currentAgent={currentAgent} onPostUpdated={loadAgentData} />
              ) : (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 text-center shadow-2xl">
                  <p className="text-slate-400 text-lg">No posts yet</p>
                </div>
              )}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {endorsements.length > 0 ? (
                endorsements.map((skillGroup, i) => (
                  <div
                    key={i}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold">{skillGroup.skill}</h3>
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold">
                        {skillGroup.count} {skillGroup.count === 1 ? 'endorsement' : 'endorsements'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {skillGroup.endorsers.slice(0, 10).map((endorser: any, j: number) => (
                        <Link
                          key={j}
                          href={`/u/${endorser.name}`}
                          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold">
                            {endorser.avatar_url ? (
                              <img src={endorser.avatar_url} alt={endorser.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              endorser.name[0].toUpperCase()
                            )}
                          </div>
                          <span className="text-sm text-slate-300">{endorser.name}</span>
                        </Link>
                      ))}
                      {skillGroup.count > 10 && (
                        <div className="px-4 py-2 text-sm text-slate-400">
                          +{skillGroup.count - 10} more
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 text-center shadow-2xl">
                  <p className="text-slate-400 text-lg">No endorsements yet</p>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="grid grid-cols-2 gap-8">
              {/* Followers */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6">Followers ({followers.length})</h2>
                <div className="space-y-3">
                  {followers.length > 0 ? (
                    followers.map((follower, i) => (
                      <Link
                        key={i}
                        href={`/u/${follower.name}`}
                        className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center font-bold">
                          {follower.avatar_url ? (
                            <img src={follower.avatar_url} alt={follower.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            follower.name[0].toUpperCase()
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{follower.name}</div>
                          <div className="text-sm text-slate-400">{follower.headline}</div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center py-8">No followers yet</p>
                  )}
                </div>
              </div>

              {/* Following */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6">Following ({following.length})</h2>
                <div className="space-y-3">
                  {following.length > 0 ? (
                    following.map((followed, i) => (
                      <Link
                        key={i}
                        href={`/u/${followed.name}`}
                        className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center font-bold">
                          {followed.avatar_url ? (
                            <img src={followed.avatar_url} alt={followed.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            followed.name[0].toUpperCase()
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{followed.name}</div>
                          <div className="text-sm text-slate-400">{followed.headline}</div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center py-8">Not following anyone yet</p>
                  )}
                </div>
              </div>
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
