import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track, Playlist, Artist } from './types';
import { TRACKS } from './data';

interface PlaybackContextType {
  activeTrack: Track;
  isPlaying: boolean;
  progress: number;
  volume: number;
  likedTrackIds: string[];
  likedTracks: Track[];
  playlists: Playlist[];
  recentTracks: Track[];
  activeQueue: Track[];
  queueIndex: number;
  togglePlay: () => void;
  playTrack: (track: Track, contextQueue?: Track[]) => void;
  playPlaylist: (playlist: Playlist) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleLikeTrack: (track: Track) => void;
  createPlaylist: (title: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  clearRecentTracks: () => void;
  removeRecentTrack: (trackId: string) => void;
  isNowPlayingOpen: boolean;
  setNowPlayingOpen: (open: boolean) => void;
  isShuffle: boolean;
  setShuffle: (b: boolean) => void;
  isRepeat: boolean;
  setRepeat: (b: boolean) => void;
  showVideoPlayer: boolean;
  setShowVideoPlayer: (b: boolean) => void;
  userName: string;
  setUserName: (name: string) => void;
  playNext: (track: Track) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  jumpToQueueIndex: (index: number) => void;
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultTrack: Track = {
    id: 'empty',
    title: 'Search to play',
    artist: 'Station',
    album: '',
    duration: '0:00',
    durationSec: 0,
    coverArt: '',
    youtubeId: ''
  };

  const [activeTrack, setActiveTrack] = useState<Track>(defaultTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(70);
  
  const [likedTracks, setLikedTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem('station_liked_tracks_full');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Keep an ID array purely for quick lookups if needed, backward compatible
  const likedTrackIds = likedTracks.map(t => t.id);

  useEffect(() => {
    localStorage.setItem('station_liked_tracks_full', JSON.stringify(likedTracks));
  }, [likedTracks]);

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('station_playlists');
    if (saved) {
      // Remove the old hardcoded mock playlists
      const parsed = JSON.parse(saved);
      return parsed.filter((p: Playlist) => p.id !== 'midnight-echoes' && p.id !== 'late-night-jazz');
    }
    return [];
  });
  
  const [recentTracks, setRecentTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem('station_recent_tracks');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeQueue, setActiveQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isRadioQueue, setIsRadioQueue] = useState(true);
  const [isNowPlayingOpen, setNowPlayingOpen] = useState(false);
  const [isShuffle, setShuffle] = useState(false);
  const [isRepeat, setRepeat] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [userName, setUserNameState] = useState(() => {
    return localStorage.getItem('station_user_name') || 'User';
  });

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem('station_user_name', name);
  };

  const ytPlayerRef = useRef<any>(null);
  const iframeContainerRef = useRef<HTMLDivElement | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const eventCallbacksRef = useRef<{ handleTrackEnded: () => void, setIsPlaying: (val: boolean) => void, prevTrack: () => void, nextTrack: () => void, togglePlay: () => void, activeTrack: Track | null }>({
    handleTrackEnded: () => {},
    setIsPlaying: () => {},
    prevTrack: () => {},
    nextTrack: () => {},
    togglePlay: () => {},
    activeTrack: null
  });

  useEffect(() => {
    localStorage.setItem('station_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('station_recent_tracks', JSON.stringify(recentTracks));
  }, [recentTracks]);

  const addToRecentTracks = (track: Track) => {
    setRecentTracks(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      return [track, ...filtered].slice(0, 20); // Keep last 20
    });
  };

  const generateRelatedQueue = async (track: Track, append: boolean = false) => {
    try {
      const query = track.artist ? `${track.artist} official music` : track.title + ' official track';
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.tracks) {
          const related = data.tracks.filter((t: Track) => t.id !== track.id).slice(0, 24);
          if (append) {
             setActiveQueue(prev => {
                const existingIds = new Set(prev.map(t => t.id));
                const uniqueNew = related.filter((t: Track) => !existingIds.has(t.id));
                return [...prev, ...uniqueNew];
             });
          } else {
             setActiveQueue([track, ...related]);
          }
          return;
        }
      }
    } catch(e) {
      console.warn("Failed to fetch related queue");
    }
  };

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      window.onYouTubeIframeAPIReady = () => {
        initYoutubePlayer(activeTrack.youtubeId);
      };
    } else {
      initYoutubePlayer(activeTrack.youtubeId);
    }

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    iframeContainerRef.current = document.getElementById('station-yt-player-container') as HTMLDivElement;
  }, []);

  const initYoutubePlayer = (videoId: string) => {
    if (!window.YT || !window.YT.Player) return;

    const target = document.createElement('div');
    target.id = 'yt-player-target';
    if (iframeContainerRef.current) {
      iframeContainerRef.current.innerHTML = '';
      iframeContainerRef.current.appendChild(target);
    }

    try {
      ytPlayerRef.current = new window.YT.Player('yt-player-target', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          disablekb: 0,
          fs: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(volume);
          },
          onStateChange: (event: any) => {
            if (event.data === 0) { // ENDED
              eventCallbacksRef.current.handleTrackEnded();
            } else if (event.data === 1) { // PLAYING
              eventCallbacksRef.current.setIsPlaying(true);
            } else if (event.data === 2) { // PAUSED
              eventCallbacksRef.current.setIsPlaying(false);
            }
          },
        },
      });
    } catch (e) {
      console.error('Failed to init YT player', e);
    }
  };

  useEffect(() => {
    if (ytPlayerRef.current && ytPlayerRef.current.loadVideoById) {
      ytPlayerRef.current.loadVideoById({
        videoId: activeTrack.youtubeId,
        startSeconds: 0,
      });
      if (isPlaying) {
        ytPlayerRef.current.playVideo();
      } else {
        ytPlayerRef.current.pauseVideo();
      }
    }
    setProgress(0);
  }, [activeTrack]);

  useEffect(() => {
    if (ytPlayerRef.current) {
      if (isPlaying) {
        if (ytPlayerRef.current.playVideo) ytPlayerRef.current.playVideo();
      } else {
        if (ytPlayerRef.current.pauseVideo) ytPlayerRef.current.pauseVideo();
      }
    }

    if (isPlaying) {
      progressTimerRef.current = window.setInterval(() => {
        setProgress((prev) => {
          const limit = activeTrack.durationSec;
          if (prev >= limit) {
            handleTrackEnded();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    }

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [isPlaying, activeTrack]);

  const handleTrackEnded = () => {
    if (isRepeat) {
      seek(0);
      if (ytPlayerRef.current && ytPlayerRef.current.playVideo) {
        ytPlayerRef.current.playVideo();
      }
    } else {
      nextTrack();
    }
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const playTrack = (track: Track, contextQueue?: Track[]) => {
    // Only play if not empty fallback
    if (track.id === 'empty') return;
    
    setActiveTrack(track);
    addToRecentTracks(track);
    
    if (contextQueue && contextQueue.length > 0) {
      setActiveQueue(contextQueue);
      setQueueIndex(contextQueue.findIndex(t => t.id === track.id) || 0);
      setIsRadioQueue(false);
      setIsPlaying(true);
    } else {
      // Seed with just this track first so it plays immediately
      setActiveQueue([track]);
      setQueueIndex(0);
      setIsRadioQueue(true);
      setIsPlaying(true);
      generateRelatedQueue(track);
    }
  };

  const playPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length > 0) {
      setActiveQueue(playlist.tracks);
      setQueueIndex(0);
      setActiveTrack(playlist.tracks[0]);
      addToRecentTracks(playlist.tracks[0]);
      setIsRadioQueue(false);
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    if (activeQueue.length === 0) return;
    let nextIndex = queueIndex + 1;
    
    // Handle queue expansion
    if (isRadioQueue && nextIndex >= activeQueue.length - 2 && activeQueue.length > 0) {
       generateRelatedQueue(activeQueue[activeQueue.length - 1], true);
    }

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * activeQueue.length);
    } else if (nextIndex >= activeQueue.length) {
      nextIndex = 0;
    }
    setQueueIndex(nextIndex);
    const nextTrk = activeQueue[nextIndex];
    setActiveTrack(nextTrk);
    addToRecentTracks(nextTrk);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (activeQueue.length === 0) return;
    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = activeQueue.length - 1;
    }
    setQueueIndex(prevIndex);
    const prevTrk = activeQueue[prevIndex];
    setActiveTrack(prevTrk);
    addToRecentTracks(prevTrk);
    setIsPlaying(true);
  };

  const seek = (seconds: number) => {
    const boundSec = Math.max(0, Math.min(seconds, activeTrack.durationSec));
    setProgress(boundSec);
    if (ytPlayerRef.current && ytPlayerRef.current.seekTo) {
      ytPlayerRef.current.seekTo(boundSec, true);
    }
  };

  const setVolume = (v: number) => {
    const boundedVolume = Math.max(0, Math.min(v, 100));
    setVolumeState(boundedVolume);
    if (ytPlayerRef.current && ytPlayerRef.current.setVolume) {
      ytPlayerRef.current.setVolume(boundedVolume);
    }
  };

  const toggleLikeTrack = (track: Track) => {
    setLikedTracks((prev) => {
      if (prev.some(t => t.id === track.id)) {
        return prev.filter((t) => t.id !== track.id);
      } else {
        return [track, ...prev];
      }
    });
  };

  const createPlaylist = (title: string) => {
    const newPlaylist: Playlist = {
      id: `custom-${Date.now()}`,
      title,
      tracksCount: 0,
      tracks: [],
      coverArt: '',
      createdBy: userName
    };
    setPlaylists((prev) => [newPlaylist, ...prev]);
  };

  const addTrackToPlaylist = (playlistId: string, track: Track) => {
    setPlaylists((prev) => prev.map(p => {
      if (p.id === playlistId) {
        // Prevent dupes
        if (!p.tracks.some(t => t.id === track.id)) {
          return {
            ...p,
            tracks: [...p.tracks, track],
            tracksCount: p.tracks.length + 1
          };
        }
      }
      return p;
    }));
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) => 
      prev.map(pl => {
        if (pl.id === playlistId) {
          const newTracks = pl.tracks.filter(t => t.id !== trackId);
          return {
            ...pl,
            tracks: newTracks,
            tracksCount: newTracks.length
          }
        }
        return pl;
      })
    );
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(pl => pl.id !== playlistId));
  };
  
  const clearRecentTracks = () => {
    setRecentTracks([]);
  };

  const removeRecentTrack = (trackId: string) => {
    setRecentTracks(prev => prev.filter(t => t.id !== trackId));
  };

  const playNext = (track: Track) => {
    if (activeQueue.length === 0) {
      playTrack(track);
      return;
    }
    setActiveQueue(prev => {
      const copy = [...prev];
      copy.splice(queueIndex + 1, 0, track);
      return copy;
    });
  };

  const addToQueue = (track: Track) => {
    if (activeQueue.length === 0) {
      playTrack(track);
      return;
    }
    setActiveQueue(prev => [...prev, track]);
  };

  const removeFromQueue = (index: number) => {
    setActiveQueue(prev => {
      const nextQ = prev.filter((_, i) => i !== index);
      if (index < queueIndex) {
        setQueueIndex(queueIndex - 1);
      }
      return nextQ;
    });
  };

  useEffect(() => {
    eventCallbacksRef.current = {
      handleTrackEnded,
      setIsPlaying,
      prevTrack,
      nextTrack,
      togglePlay,
      activeTrack
    };
  }, [handleTrackEnded, setIsPlaying, prevTrack, nextTrack, togglePlay, activeTrack]);

  // Update Media Session
  useEffect(() => {
    if ('mediaSession' in navigator && window.MediaMetadata) {
      if (activeTrack && activeTrack.id !== 'empty') {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: activeTrack.title,
          artist: activeTrack.artist,
          artwork: [
            {
              src: activeTrack.coverArt || `https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=512&q=80`,
              sizes: '512x512',
              type: 'image/jpeg'
            }
          ]
        });

        navigator.mediaSession.setActionHandler('play', () => {
          eventCallbacksRef.current.setIsPlaying(true);
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          eventCallbacksRef.current.setIsPlaying(false);
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          eventCallbacksRef.current.prevTrack();
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          eventCallbacksRef.current.nextTrack();
        });
      }
    }
  }, [activeTrack]);

  const jumpToQueueIndex = (index: number) => {
    if (index >= 0 && index < activeQueue.length) {
      setQueueIndex(index);
      const track = activeQueue[index];
      setActiveTrack(track);
      addToRecentTracks(track);
      setIsPlaying(true);
    }
  };

  return (
    <PlaybackContext.Provider
      value={{
        activeTrack,
        isPlaying,
        progress,
        volume,
        likedTrackIds,
        likedTracks,
        playlists,
        recentTracks,
        activeQueue,
        queueIndex,
        togglePlay,
        playTrack,
        playPlaylist,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleLikeTrack,
        createPlaylist,
        addTrackToPlaylist,
        isNowPlayingOpen,
        setNowPlayingOpen,
        isShuffle,
        setShuffle,
        isRepeat,
        setRepeat,
        showVideoPlayer,
        setShowVideoPlayer,
        userName,
        setUserName,
        playNext,
        addToQueue,
        removeFromQueue,
        jumpToQueueIndex,
        removeTrackFromPlaylist,
        deletePlaylist,
        clearRecentTracks,
        removeRecentTrack,
      }}
    >
      {children}
      <div
        id="station-yt-player-container"
        className={`fixed transition-all duration-500 ease-out z-[110] rounded-2xl overflow-hidden border border-white/10 ${
          isNowPlayingOpen && showVideoPlayer
            ? 'top-[22%] left-1/2 -translate-x-1/2 w-[280px] h-[160px] md:w-[340px] md:h-[190px] opacity-100 shadow-[0_0_25px_rgba(128,131,255,0.3)] pointer-events-auto'
            : 'top-[-2000px] left-[-2000px] w-[300px] h-[300px] opacity-0 pointer-events-none'
        }`}
      >
        <div id="yt-player-target"></div>
      </div>
    </PlaybackContext.Provider>
  );
};

export const usePlayback = () => {
  const context = useContext(PlaybackContext);
  if (context === undefined) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return context;
};
