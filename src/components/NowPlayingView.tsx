import React, { useRef, useState } from 'react';
import { usePlayback } from '../PlaybackContext';

export const NowPlayingView: React.FC = () => {
  const {
    activeTrack,
    isPlaying,
    progress,
    volume,
    likedTrackIds,
    playlists,
    activeQueue,
    queueIndex,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleLikeTrack,
    addTrackToPlaylist,
    isNowPlayingOpen,
    setNowPlayingOpen,
    isShuffle,
    setShuffle,
    isRepeat,
    setRepeat,
    showVideoPlayer,
    setShowVideoPlayer,
    jumpToQueueIndex,
    removeFromQueue
  } = usePlayback();

  const progressContainerRef = useRef<HTMLDivElement>(null);
  const volumeContainerRef = useRef<HTMLDivElement>(null);
  const [showPlaylistOptions, setShowPlaylistOptions] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  if (!isNowPlayingOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressContainerRef.current) {
      const rect = progressContainerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const progressPercent = Math.max(0, Math.min(clickX / rect.width, 1));
      seek(progressPercent * activeTrack.durationSec);
    }
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (volumeContainerRef.current) {
      const rect = volumeContainerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const volumePercent = Math.max(0, Math.min(clickX / rect.width, 1));
      setVolume(Math.round(volumePercent * 100));
    }
  };

  const isLiked = likedTrackIds.includes(activeTrack.id);
  const progressPercent = (progress / activeTrack.durationSec) * 100;
  
  // Calculate upcoming tracks
  const upcomingQueue = activeQueue.slice(queueIndex + 1, queueIndex + 11); // Show next 10

  return (
    <div className="fixed inset-0 z-[100] h-screen w-screen bg-[#07080a] text-zinc-100 flex flex-col overflow-y-auto animate-in slide-in-from-bottom-12 duration-500 hide-scrollbar pb-10">
      
      {/* Background Ambience Blob - Uses track artwork with heavy blur overlay */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <img
          className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2 object-cover opacity-20 filter blur-[90px] animate-pulse-slow"
          src={activeTrack.coverArt}
          alt="Blur glow context"
        />
        <div className="absolute inset-0 bg-black/75" />
      </div>

      {/* Header Bar */}
      <header className="flex justify-between items-center h-16 px-6 pt-4 w-full z-10 gap-2 flex-shrink-0">
        <button
          onClick={() => setNowPlayingOpen(false)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/5 hover:opacity-80 transition-opacity active:scale-95 cursor-pointer flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[var(--theme-color)] text-2xl font-bold">expand_more</span>
        </button>

        {/* Dynamic Mode Switcher pills */}
        <div className="flex gap-1 bg-black/40 border border-white/5 rounded-full p-0.5">
          <button 
            onClick={() => setShowVideoPlayer(false)}
            className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
              !showVideoPlayer 
                ? 'bg-[var(--theme-color)] text-black shadow-md' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Audio Mode
          </button>
          <button 
            onClick={() => setShowVideoPlayer(true)}
            className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              showVideoPlayer 
                ? 'bg-red-650 text-white shadow-md' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-xs">play_circle</span>
            Video Live
          </button>
        </div>

        <button 
          onClick={() => setNowPlayingOpen(false)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/5 hover:opacity-80 transition-opacity active:scale-95 flex-shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-zinc-400 text-xl">close</span>
        </button>
      </header>

      {/* Centered Main Core content with constraints */}
      <div className="flex flex-col items-center justify-center gap-6 max-w-md mx-auto w-full px-6 py-4 flex-shrink-0">
        
        {/* Visual Stage Container: standard album art or live video slot */}
        {!showVideoPlayer ? (
          <div className="relative w-full aspect-square group max-w-[340px] md:max-w-[360px] bg-zinc-800 rounded-2xl flex items-center justify-center album-shadow">
             <img
               className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-[1.01]"
               src={activeTrack.coverArt || `https://images.unsplash.com/photo-1493225457124-a1a2a5f56468?auto=format&fit=crop&w=800&q=80`}
               alt={activeTrack.title}
             />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10"></div>
          </div>
        ) : (
          <div className="w-[280px] h-[160px] md:w-[340px] md:h-[190px] rounded-2xl bg-black/90 flex flex-col items-center justify-center border border-dashed border-red-500/20 text-xs text-zinc-400 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1a0033]/40 to-[#0e1014]/40 opacity-70 z-0"></div>
            <div className="w-12 h-12 bg-red-650/10 rounded-full flex items-center justify-center text-red-400 mb-2 animate-pulse">
              <span className="material-symbols-outlined text-2xl font-bold">videocam</span>
            </div>
          </div>
        )}

        {/* Metadata Details Row */}
        <div className="w-full mt-2 flex justify-between items-end border-b border-zinc-900 pb-2">
          <div className="flex-1 overflow-hidden pr-4">
            <h1 className="font-hanken text-2xl md:text-3xl text-white font-extrabold truncate uppercase tracking-tight">
              {activeTrack.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="font-jakarta text-sm text-[#a7a7a7] font-semibold truncate">
                {activeTrack.artist}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPlaylistOptions(!showPlaylistOptions)}
              className="w-12 h-12 flex items-center justify-center rounded-full text-[#a7a7a7] hover:text-[var(--theme-color)] hover:bg-white/5 transition-colors cursor-pointer"
              title="Add to Playlist"
            >
              <span className="material-symbols-outlined text-2xl">playlist_add</span>
            </button>
            <button
              onClick={() => toggleLikeTrack(activeTrack)}
              className="w-12 h-12 flex items-center justify-center rounded-full text-[#a7a7a7] hover:text-[var(--theme-color)] transition-colors cursor-pointer"
            >
              <span
                className={`material-symbols-outlined text-2xl transition-all ${
                  isLiked ? 'text-[var(--theme-color)] fill-1 scale-110' : ''
                }`}
              >
                favorite
              </span>
            </button>
          </div>
        </div>

        {showPlaylistOptions && (
          <div className="w-full bg-[#18191d] rounded-2xl p-4 border border-zinc-800 animate-in fade-in zoom-in duration-200">
            <h4 className="font-bold text-sm text-white mb-3">Add to Playlist</h4>
            {playlists.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto hide-scrollbar">
                {playlists.map(pl => (
                  <button
                    key={pl.id}
                    onClick={() => {
                      addTrackToPlaylist(pl.id, activeTrack);
                      setShowPlaylistOptions(false);
                    }}
                    className="text-left font-jakarta text-xs text-zinc-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    {pl.title}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 font-jakarta">No playlists available. Create one in your Library!</p>
            )}
          </div>
        )}

        {/* Interactive Progress Bar */}
        <div className="w-full space-y-2">
          <div
            ref={progressContainerRef}
            onClick={handleProgressClick}
            className="relative group h-6 flex items-center cursor-pointer"
            id="progress-container"
          >
            {/* Background Track */}
            <div className="absolute w-full h-1 bg-white/10 rounded-full"></div>
            {/* Active Highlighted timeline */}
            <div
              className="absolute h-1 bg-[var(--theme-color)] rounded-full progress-glow"
              style={{ width: `${progressPercent}%` }}
            ></div>
            {/* Draggable Playhead */}
            <div
              className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progressPercent}% - 7px)` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs font-semibold text-zinc-500">
            <span>{formatTime(progress)}</span>
            <span>{activeTrack.duration}</span>
          </div>
        </div>

        {/* Playback Controls Core Button group */}
        <div className="w-full flex items-center justify-between">
          <button
            onClick={() => setShuffle(!isShuffle)}
            className={`p-2 transition-colors cursor-pointer ${
              isShuffle ? 'text-[var(--theme-color)] font-bold scale-105' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-2xl font-bold">shuffle</span>
          </button>
          
          <div className="flex items-center gap-6">
            <button
              onClick={prevTrack}
              className="p-2 text-zinc-200 hover:text-[var(--theme-color)] transition-all active:scale-90 cursor-pointer"
            >
              <span className="material-symbols-outlined text-3xl font-extrabold">skip_previous</span>
            </button>
            <button
              onClick={togglePlay}
              className="w-18 h-18 flex items-center justify-center rounded-full bg-[var(--theme-color)] hover:bg-[#1ed760] hover:scale-105 active:scale-95 transition-all text-black cursor-pointer shadow-xl"
            >
              <span className="material-symbols-outlined text-4xl font-extrabold">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button
              onClick={nextTrack}
              className="p-2 text-zinc-200 hover:text-[var(--theme-color)] transition-all active:scale-90 cursor-pointer"
            >
              <span className="material-symbols-outlined text-3xl font-extrabold">skip_next</span>
            </button>
          </div>

          <button
            onClick={() => setRepeat(!isRepeat)}
            className={`p-2 transition-colors cursor-pointer ${
              isRepeat ? 'text-[var(--theme-color)] font-bold scale-105' : 'text-zinc-400 hover:text-[var(--theme-color)]'
            }`}
          >
            <span className="material-symbols-outlined text-2xl font-bold">repeat</span>
          </button>
        </div>

        {/* Volume controller */}
        <div className="w-full flex items-center gap-3 bg-[#18191d] px-5 py-3 rounded-2xl border border-white/5 shadow-md">
          <span className="material-symbols-outlined text-zinc-400 text-lg select-none">volume_down</span>
          <div
            ref={volumeContainerRef}
            onClick={handleVolumeClick}
            className="flex-1 h-1 bg-white/10 rounded-full relative cursor-pointer group py-2 flex items-center"
          >
            <div className="absolute w-full h-1 bg-white/10 rounded-full"></div>
            <div
              className="absolute h-1 bg-white/50 rounded-full group-hover:bg-[var(--theme-color)] transition-colors"
              style={{ width: `${volume}%` }}
            ></div>
          </div>
          <span className="material-symbols-outlined text-zinc-400 text-lg select-none">volume_up</span>
        </div>
      </div>

      {/* Swipe up queue pull tab */}
      <div 
        onClick={() => setShowQueue(!showQueue)}
        className="w-full flex justify-center py-4 cursor-pointer mt-auto"
      >
        <div className="w-12 h-1.5 bg-white/20 rounded-full hover:bg-white/40 transition-colors pointer-events-auto"></div>
      </div>

      {/* Up Next Queue Drawer */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-50 bg-[#0c0d10] border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] rounded-t-3xl transition-transform duration-500 flex flex-col ${
          showQueue ? 'translate-y-0 h-[75vh]' : 'translate-y-full h-[75vh]'
        }`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-[#18191d]/50 rounded-t-3xl backdrop-blur-xl">
          <h3 className="font-hanken text-xl font-bold text-white">Up Next Queue</h3>
          <button onClick={() => setShowQueue(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 hide-scrollbar">
          {upcomingQueue.length > 0 ? (
            upcomingQueue.map((track, i) => {
              const actualIndex = queueIndex + 1 + i;
              return (
                <div 
                  key={`${track.id}-${i}`}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#18191d] transition-colors group border border-transparent hover:border-white/5"
                >
                  <div 
                    onClick={() => jumpToQueueIndex(actualIndex)}
                    className="flex-1 flex items-center gap-4 overflow-hidden cursor-pointer"
                  >
                    <span className="font-jakarta text-xs w-6 text-center text-zinc-600 group-hover:text-white transition-colors">{actualIndex + 1}</span>
                    <div className="w-12 h-12 rounded-lg overflow-hidden relative shadow-md">
                      <img className="w-full h-full object-cover" src={track.coverArt} alt={track.title} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="material-symbols-outlined text-white text-base">play_arrow</span>
                      </div>
                    </div>
                    <div className="truncate pr-4">
                      <p className="font-jakarta font-semibold text-sm text-zinc-200 truncate group-hover:text-white transition-colors">{track.title}</p>
                      <p className="font-jakarta text-xs text-zinc-500 truncate">{track.artist}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromQueue(actualIndex)}
                    className="w-10 h-10 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all cursor-pointer bg-white/5 rounded-full hover:bg-white/10"
                    title="Remove from queue"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4 opacity-70">
               <span className="material-symbols-outlined text-4xl">queue_music</span>
               <p className="text-sm font-jakarta">Queue is empty</p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};
