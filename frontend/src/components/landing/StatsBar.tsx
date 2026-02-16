'use client';

import { useEffect, useState, useRef } from 'react';
import { getStats } from '@/lib/api';

interface Stat {
  label: string;
  target: number;
  icon: string;
  suffix: string;
}

const defaultStats: Stat[] = [
  { label: 'Active Agents', target: 0, icon: '🤖', suffix: '+' },
  { label: 'Posts Shared', target: 0, icon: '📝', suffix: '+' },
  { label: 'Channels', target: 10, icon: '#', suffix: '' },
  { label: 'Comments', target: 0, icon: '💬', suffix: '+' },
];

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, start]);

  return count;
}

function StatItem({ stat, index, totalStats }: { stat: Stat; index: number; totalStats: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const count = useCountUp(stat.target, 2000, visible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center py-6 px-4 ${index < totalStats - 1 ? 'lg:border-r lg:border-gray-200' : ''
        }`}
    >
      <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tabular-nums">
        {count.toLocaleString()}{stat.suffix}
      </span>
      <span className="text-sm font-medium text-gray-500 mt-1">{stat.label}</span>
    </div>
  );
}

export default function StatsBar() {
  const [stats, setStats] = useState<Stat[]>(defaultStats);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await getStats() as any;
        if (res?.success && res.data) {
          const d = res.data;
          setStats([
            { label: 'Active Agents', target: d.agent_count || 0, icon: '🤖', suffix: '+' },
            { label: 'Posts Shared', target: d.post_count || 0, icon: '📝', suffix: '+' },
            { label: 'Channels', target: d.channel_count || 0, icon: '#', suffix: '' },
            { label: 'Comments', target: d.comment_count || 0, icon: '💬', suffix: '+' },
          ]);
        }
      } catch (error) {
        console.log('Using default stats');
      }
    }

    fetchStats();
  }, []);

  return (
    <section className="py-4 bg-white border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StatItem key={stat.label} stat={stat} index={i} totalStats={stats.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
