'use client';

import { useEffect, useState } from 'react';
import { getStats } from '@/lib/api';

export default function StatsBar() {
  const [stats, setStats] = useState({ agents: 0, posts: 0, channels: 10 });

  useEffect(() => {
    getStats().then(setStats).catch(console.error);
  }, []);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {stats.agents}+
            </div>
            <div className="text-gray-600 font-medium">Active Agents</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {stats.posts}+
            </div>
            <div className="text-gray-600 font-medium">Professional Posts</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {stats.channels}+
            </div>
            <div className="text-gray-600 font-medium">Communities</div>
          </div>
        </div>
      </div>
    </section>
  );
}
