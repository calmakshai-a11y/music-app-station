import React, { useState } from 'react';
import { usePlayback } from '../PlaybackContext';
import { Track } from '../types';
import { TrackItem } from './TrackItem';

export const SearchView: React.FC = () => {
  const { playTrack, activeTrack, isPlaying } = usePlayback();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('station_search_history');
    return saved ? JSON.parse(saved) : ['Chill', 'Synth', 'Dream', 'Midnight'];
  });

  const saveHistory = (history: string[]) => {
    setSearchHistory(history);
    localStorage.setItem('station_search_history', JSON.stringify(history));
  };

  const [ytResults, setYtResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Focus input automatically
  React.useEffect(() => {
    // just dummy
  }, []);

  const searchYouTube = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setYtResults([]);
      return;
    }
    
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      if (data.status === 'success') {
        setYtResults(data.tracks || []);
      } else {
        setApiError(data.error || 'Failed to search YouTube API');
        setYtResults([]);
      }
    } catch (e: any) {
      setApiError(e.message);
      setYtResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeSearch = (query: string) => {
    const trimmed = query.trim();
    if (trimmed && !searchHistory.includes(trimmed)) {
      saveHistory([trimmed, ...searchHistory].slice(0, 10)); // keep last 10
    }
    setSearchQuery(trimmed);
    searchYouTube(trimmed);
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    searchYouTube(query);
  };

  const handleClearSearches = () => {
    saveHistory([]);
  };

  // Replace old displayTracks
  const displayTracks = ytResults;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Search Bar Section */}
      <section className="relative w-full space-y-3">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-[#a7a7a7]">search</span>
          </div>
          <input
            type="text"
            className="w-full h-14 pl-12 pr-4 bg-[#18191d] border border-zinc-800 rounded-full font-jakarta text-sm text-[#f4f4f5] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1db954]/50 focus:border-[#1db954] transition-all duration-300"
            placeholder="Search artists, songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                executeSearch(searchQuery);
              }
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-4 flex items-center text-xs text-[#a7a7a7] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Dynamic Search Results */}
      {searchQuery && (
        <section className="space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
            <h3 className="font-hanken text-lg text-white font-bold">Search Results</h3>
            {isLoading ? (
              <span className="text-xs text-[#1db954] animate-pulse flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-sm animate-spin">sync</span> Searching YouTube database...
              </span>
            ) : (
              <span className="text-xs text-[#a7a7a7]">
                {displayTracks.length} items found
              </span>
            )}
          </div>

          {apiError && (
             <div className="p-4 bg-orange-950/20 border border-orange-500/30 rounded-xl text-xs text-orange-200">
               <p className="font-bold flex items-center gap-1">
                 <span className="material-symbols-outlined text-base">warning</span> YouTube API Limitation
               </p>
               <p className="mt-1 opacity-80">{apiError}</p>
             </div>
          )}

          {displayTracks.length > 0 ? (
            <div className="space-y-2">
              {displayTracks.map((track) => (
                <TrackItem key={track.id} track={track} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-[#c7c4d7]/55">
              No matching tracks found for "{searchQuery}".
            </div>
          )}
        </section>
      )}

      {/* Default/Empty State: Recent Search History */}
      {!searchQuery && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-hanken text-lg md:text-xl text-white font-bold">Recent Searches</h2>
            {searchHistory.length > 0 && (
              <button
                onClick={handleClearSearches}
                className="font-jakarta text-xs text-[#1db954] font-semibold hover:underline bg-transparent border-0 cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
          
          {searchHistory.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((query, index) => (
                <div
                  key={index}
                  className="flex items-center pl-4 pr-1 py-1 bg-[#18191d] hover:bg-[#202125] text-white text-sm rounded-full transition-colors border border-zinc-800"
                >
                  <span onClick={() => handleHistoryClick(query)} className="cursor-pointer flex items-center group">
                    <span className="material-symbols-outlined text-xs mr-2 text-zinc-400 group-hover:text-white transition-colors">history</span>
                    <span>{query}</span>
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); saveHistory(searchHistory.filter((_, i) => i !== index)); }}
                    className="w-6 h-6 ml-2 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-jakarta text-sm text-zinc-500">Your search history is empty.</p>
          )}
        </section>
      )}
    </div>
  );
};
