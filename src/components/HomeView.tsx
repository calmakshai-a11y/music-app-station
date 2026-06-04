import React from 'react';
import { usePlayback } from '../PlaybackContext';
import { TrackItem } from './TrackItem';

interface HomeViewProps {
  onNavigateToPlaylist: (id: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigateToPlaylist }) => {
  const { recentTracks, clearRecentTracks, removeRecentTrack } = usePlayback();

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* Dynamic Link Display for Spotify styled Premium look */}
      <section className="bg-[#18191d] border border-zinc-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="material-symbols-outlined text-[var(--theme-color)]">verified</span>
            <h4 className="font-hanken text-white font-bold text-sm">Station Premium Stream Active</h4>
          </div>
          <p className="font-jakarta text-xs text-[#a7a7a7]">
            Your listening history and personal collection.
          </p>
        </div>
      </section>

      {/* Recent Tracks History */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white text-2xl">history</span>
            <h3 className="font-hanken text-xl md:text-2xl text-white font-bold">Recently Played</h3>
          </div>
          {recentTracks.length > 0 && (
            <button
              onClick={clearRecentTracks}
              className="font-jakarta text-xs text-[var(--theme-color)] font-semibold hover:underline bg-transparent border-0 cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>
        
        {recentTracks.length > 0 ? (
          <div className="space-y-2">
            {recentTracks.map((track, i) => (
              <TrackItem 
                key={`recent-${track.id}-${i}`} 
                track={track} 
                onRemove={() => removeRecentTrack(track.id)}
                removeLabel="Remove from history"
              />
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm font-jakarta">No tracks played yet. Search for songs to start listening!</p>
        )}
      </section>

    </div>
  );
};
