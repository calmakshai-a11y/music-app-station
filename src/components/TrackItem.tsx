import React, { useState, useRef, useEffect } from 'react';
import { Track } from '../types';
import { usePlayback } from '../PlaybackContext';

interface TrackItemProps {
  track: Track;
  index?: number;
  onRemove?: () => void;
  removeLabel?: string;
}

export const TrackItem: React.FC<TrackItemProps> = ({ track, index, onRemove, removeLabel }) => {
  const { playTrack, activeTrack, isPlaying, playNext, addToQueue, toggleLikeTrack, likedTracks, playlists, addTrackToPlaylist } = usePlayback();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isCurrent = activeTrack.id === track.id;
  const isLiked = likedTracks.some(t => t.id === track.id);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setShowPlaylists(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
    setShowPlaylists(false);
  };

  return (
    <div
      onClick={() => playTrack(track)}
      className={`flex items-center justify-between p-3 rounded-xl hover:bg-[#18191d] transition-all cursor-pointer relative group ${
        isCurrent ? 'bg-[#18191d] border border-zinc-800' : 'border border-transparent'
      }`}
    >
      <div className="flex items-center gap-4 overflow-hidden">
        {index !== undefined && (
          <span className="font-jakarta text-xs w-6 text-center text-zinc-500 font-medium">
            {index + 1}
          </span>
        )}
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative border border-white/5 shadow-sm">
          <img className="w-full h-full object-cover" src={track.coverArt} alt={track.title} />
          {isCurrent && isPlaying && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#1db954] animate-pulse">equalizer</span>
            </div>
          )}
        </div>
        <div className="truncate pr-4">
          <p className={`font-jakarta font-semibold text-sm truncate ${isCurrent ? 'text-[#1db954]' : 'text-zinc-200'}`}>
            {track.title}
          </p>
          <p className="font-jakarta text-xs text-[#a7a7a7] truncate">{track.artist}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLikeTrack(track);
          }}
          className={`material-symbols-outlined transition-colors text-xl cursor-pointer hover:scale-110 active:scale-90 ${isLiked ? 'text-[#1db954] fill-1' : 'text-[#a7a7a7]'}`}
        >
          favorite
        </button>
        <button
          onClick={handleMenuClick}
          className="material-symbols-outlined transition-colors text-xl cursor-pointer text-[#a7a7a7] hover:text-white"
        >
          more_vert
        </button>
      </div>

      {menuOpen && (
        <div ref={menuRef} className="absolute right-4 top-12 w-48 bg-[#18191d] border border-zinc-700 shadow-2xl rounded-xl p-2 z-50 animate-in fade-in zoom-in duration-200">
          {!showPlaylists ? (
            <div className="flex flex-col">
              <button onClick={(e) => { e.stopPropagation(); playNext(track); setMenuOpen(false); }} className="text-left text-xs font-jakarta text-zinc-300 hover:bg-white/10 hover:text-white rounded-md px-3 py-2 cursor-pointer transition-colors">
                Play Next
              </button>
              <button onClick={(e) => { e.stopPropagation(); addToQueue(track); setMenuOpen(false); }} className="text-left text-xs font-jakarta text-zinc-300 hover:bg-white/10 hover:text-white rounded-md px-3 py-2 cursor-pointer transition-colors">
                Add to Queue
              </button>
              <button onClick={(e) => { e.stopPropagation(); setShowPlaylists(true); }} className="text-left text-xs font-jakarta text-zinc-300 hover:bg-white/10 hover:text-white rounded-md px-3 py-2 cursor-pointer transition-colors flex justify-between items-center">
                Add to Playlist <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
              {onRemove && (
                <button onClick={(e) => { e.stopPropagation(); onRemove(); setMenuOpen(false); }} className="text-left text-xs font-jakarta text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-md px-3 py-2 cursor-pointer transition-colors mt-1 border-t border-zinc-800">
                  {removeLabel || 'Remove'}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col max-h-40 overflow-y-auto">
              <button onClick={(e) => { e.stopPropagation(); setShowPlaylists(false); }} className="text-left text-[10px] font-jakarta text-zinc-500 hover:text-white uppercase font-bold px-3 py-2 cursor-pointer flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">chevron_left</span> Back
              </button>
              {playlists.length > 0 ? (
                 playlists.map(pl => (
                  <button key={pl.id} onClick={(e) => { e.stopPropagation(); addTrackToPlaylist(pl.id, track); setMenuOpen(false); }} className="text-left text-xs font-jakarta text-zinc-300 hover:bg-white/10 hover:text-white rounded-md px-3 py-2 cursor-pointer transition-colors truncate">
                    {pl.title}
                  </button>
                 ))
              ) : (
                 <div className="px-3 py-2 text-xs text-zinc-500 font-jakarta">No playlists available.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
