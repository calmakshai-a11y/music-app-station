import { useState } from 'react';
import { PlaybackProvider, usePlayback } from './PlaybackContext';
import { HomeView } from './components/HomeView';
import { SearchView } from './components/SearchView';
import { LibraryView } from './components/LibraryView';
import { PlaylistView } from './components/PlaylistView';
import { NowPlayingView } from './components/NowPlayingView';

function StationAppContent() {
  const [currentView, setCurrentView] = useState<'home' | 'search' | 'library' | 'playlist'>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const {
    activeTrack,
    isPlaying,
    progress,
    togglePlay,
    nextTrack,
    prevTrack,
    setNowPlayingOpen,
    userName,
    setUserName,
  } = usePlayback();

  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState(userName);

  // Progress Bar percentage for the mini player
  const progressPercent = (progress / activeTrack.durationSec) * 100 || 0;

  const navigateToPlaylist = (id: string) => {
    setSelectedPlaylistId(id);
    setCurrentView('playlist');
  };

  return (
    <div className="min-h-screen pb-36 relative font-jakarta select-none selection:bg-[#1db954]/30 bg-[#07080a]">
      
      {/* TopAppBar Navigation Header */}
      <nav id="top-nav-bar" className="fixed top-0 w-full z-40 bg-[#0b0c0f]/80 backdrop-blur-3xl border-b border-white/5 shadow-sm flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-[#1db954] scale-105 active:scale-95 transition-transform cursor-pointer">
            radio
          </button>
          <h1 
            onClick={() => setCurrentView('home')}
            className="font-hanken text-2xl text-white tracking-tighter font-extrabold cursor-pointer hover:text-[#1db954] transition-colors flex items-center gap-1.5"
          >
            Station <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-[#1db954] border border-green-500/20 uppercase tracking-widest hidden sm:inline-block">Spotify Styled</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentView('search')}
            className="material-symbols-outlined text-[#a7a7a7] hover:text-[#1db954] transition-colors cursor-pointer"
          >
            search
          </button>
          <button 
            onClick={() => setShowNameModal(true)}
            className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center hover:scale-105 transition-transform cursor-pointer font-bold text-black text-xs shadow-lg"
          >
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </button>
        </div>
      </nav>

      {/* Name Config Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#18191d] p-6 rounded-2xl border border-zinc-800 w-full max-w-sm">
            <h3 className="text-white font-hanken font-bold text-xl mb-4">Set Your Name</h3>
            <input 
              type="text" 
              placeholder="Your Name"
              className="w-full h-12 bg-black/50 border border-zinc-800 rounded-xl px-4 text-white font-jakarta focus:outline-none focus:border-[#1db954]"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
            />
            <div className="flex gap-3 justify-end mt-6">
              <button 
                onClick={() => setShowNameModal(false)}
                className="px-4 py-2 text-zinc-400 font-jakarta text-sm hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if(tempName.trim()) setUserName(tempName.trim());
                  setShowNameModal(false);
                }}
                className="px-6 py-2 bg-[#1db954] text-black font-semibold rounded-full hover:scale-105 transition-transform font-jakarta text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas Views Router Container */}
      <main className="pt-24 px-6 max-w-7xl mx-auto">
        {currentView === 'home' && <HomeView onNavigateToPlaylist={navigateToPlaylist} />}
        {currentView === 'search' && <SearchView />}
        {currentView === 'library' && <LibraryView onNavigateToPlaylist={navigateToPlaylist} />}
        {currentView === 'playlist' && selectedPlaylistId && (
          <PlaylistView 
            playlistId={selectedPlaylistId} 
            onBack={() => setCurrentView('library')} 
          />
        )}
      </main>

      {/* Playback Floating Bar (Spotify styled glass-morphic bar) */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-2xl z-40">
        <div 
          onClick={() => setNowPlayingOpen(true)}
          className="bg-[#18191d]/95 backdrop-blur-xl rounded-2xl p-3 flex items-center justify-between gap-4 shadow-2xl cursor-pointer hover:bg-[#222328] transition-all border border-white/5"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 ${isPlaying ? 'animate-pulse' : ''}`}>
              <img alt="Playing album artwork mini" className="w-full h-full object-cover animate-in fade-in" src={activeTrack.coverArt} />
            </div>
            <div className="truncate min-w-[120px]">
              <p className="font-jakarta font-semibold text-xs text-white truncate">{activeTrack.title}</p>
              <div className="flex items-center gap-1">
                <p className="text-[10px] text-[#a7a7a7] truncate">{activeTrack.artist}</p>
                <span className="w-1.5 h-1.5 rounded-full bg-[#1db954] animate-ping flex-shrink-0"></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pr-1">
            <button 
              onClick={(e) => { e.stopPropagation(); prevTrack(); }}
              className="material-symbols-outlined text-[#a7a7a7] hover:text-white text-xl cursor-pointer transition-colors"
            >
              skip_previous
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="w-9 h-9 rounded-full bg-[#1db954] flex items-center justify-center text-black shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined fill-1 text-xl font-bold">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextTrack(); }}
              className="material-symbols-outlined text-[#a7a7a7] hover:text-white text-xl cursor-pointer transition-colors"
            >
              skip_next
            </button>
          </div>

          {/* Miniature interactive loading progress line */}
          <div className="absolute bottom-0 left-0 h-0.5 bg-white/5 w-full overflow-hidden rounded-full">
            <div 
              className="h-full bg-[#1db954] shadow-[0_0_8px_rgba(29,185,84,0.6)] transition-all duration-300" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* BottomNavigationBar layout for view switches */}
      <nav className="fixed bottom-0 w-full z-40 bg-[#0c0d10]/95 backdrop-blur-3xl rounded-t-2xl border-t border-white/5 shadow-2xl flex justify-around items-center h-20 px-4">
        
        <button 
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer ${
            currentView === 'home' ? 'text-[#1db954] font-bold scale-102' : 'text-[#a7a7a7] opacity-70 hover:opacity-100'
          }`}
        >
          <span className="material-symbols-outlined fill-1">home</span>
          <span className="font-jakarta text-[10px] uppercase font-bold tracking-tight mt-1">Home</span>
        </button>

        <button 
          onClick={() => setCurrentView('search')}
          className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer ${
            currentView === 'search' ? 'text-[#1db954] font-bold scale-102' : 'text-[#a7a7a7] opacity-70 hover:opacity-100'
          }`}
        >
          <span className="material-symbols-outlined">search</span>
          <span className="font-jakarta text-[10px] uppercase font-bold tracking-tight mt-1">Search</span>
        </button>

        <button 
          onClick={() => setCurrentView('library')}
          className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer ${
            currentView === 'library' ? 'text-[#1db954] font-bold scale-102' : 'text-[#a7a7a7] opacity-70 hover:opacity-100'
          }`}
        >
          <span className="material-symbols-outlined">library_music</span>
          <span className="font-jakarta text-[10px] uppercase font-bold tracking-tight mt-1">Library</span>
        </button>

      </nav>

      {/* Magnificent overlay drawer screen */}
      <NowPlayingView />

    </div>
  );
}

export default function App() {
  return (
    <PlaybackProvider>
      <StationAppContent />
    </PlaybackProvider>
  );
}
