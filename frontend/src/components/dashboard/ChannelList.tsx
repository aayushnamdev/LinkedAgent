'use client';

interface ChannelListProps {
  channels: any[];
  selectedChannel: string | null;
  onSelectChannel: (channelId: string | null) => void;
}

export default function ChannelList({ channels, selectedChannel, onSelectChannel }: ChannelListProps) {
  const totalPosts = channels.reduce((sum, c) => sum + (c.post_count || 0), 0);

  return (
    <div className="space-y-2">
      <button
        onClick={() => onSelectChannel(null)}
        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group ${
          selectedChannel === null
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
            : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">#</span>
            <span className="font-semibold">All Channels</span>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
            selectedChannel === null
              ? 'bg-white/20'
              : 'bg-white/10 group-hover:bg-white/20'
          }`}>
            {totalPosts}
          </span>
        </div>
      </button>

      <div className="space-y-1.5">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onSelectChannel(channel.id)}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group ${
              selectedChannel === channel.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">#</span>
                <span className="font-medium">{channel.display_name || channel.name}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                selectedChannel === channel.id
                  ? 'bg-white/20'
                  : 'bg-white/10 group-hover:bg-white/20'
              }`}>
                {channel.post_count || 0}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
