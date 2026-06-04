import { useState, useEffect } from 'react';
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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const colors = [
    { name: 'Spotify Green', value: '#1db954' },
    { name: 'Ocean Blue', value: '#3b82f6' },
    { name: 'Amethyst', value: '#8b5cf6' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' }
  ];
  const fonts = [
    { name: 'Jakarta (Default)', value: "'Plus Jakarta Sans', system-ui, sans-serif" },
    { name: 'Playfair Display (Serif)', value: "'Playfair Display', serif" },
    { name: 'Baskervville (Classic)', value: "'Baskervville', serif" },
    { name: 'Quicksand (Rounded)', value: "'Quicksand', sans-serif" },
    { name: 'Courier Prime (Mono)', value: "'Courier Prime', monospace" },
    { name: 'Cinzel (Cinematic)', value: "'Cinzel', serif" },
    { name: 'Varela Round (Soft Soft)', value: "'Varela Round', sans-serif" },
    { name: 'Pacifico (Cursive)', value: "'Pacifico', cursive" },
  ];

  useEffect(() => {
    const savedColor = localStorage.getItem('station_theme_color');
    const savedFont = localStorage.getItem('station_theme_font');
    if (savedColor) document.documentElement.style.setProperty('--theme-color', savedColor);
    if (savedFont) {
      document.documentElement.style.setProperty('--theme-font', savedFont);
      document.documentElement.style.setProperty('--theme-heading-font', savedFont);
    }
  }, []);

  const changeThemeColor = (color: string) => {
    document.documentElement.style.setProperty('--theme-color', color);
    localStorage.setItem('station_theme_color', color);
  };

  const changeThemeFont = (font: string) => {
    document.documentElement.style.setProperty('--theme-font', font);
    document.documentElement.style.setProperty('--theme-heading-font', font);
    localStorage.setItem('station_theme_font', font);
  };


  // Progress Bar percentage for the mini player
  const progressPercent = (progress / activeTrack.durationSec) * 100 || 0;

  const navigateToPlaylist = (id: string) => {
    setSelectedPlaylistId(id);
    setCurrentView('playlist');
  };

  return (
    <div className="min-h-screen pb-36 relative font-jakarta select-none selection:bg-[var(--theme-color)]/30 bg-[#07080a]">
      
      {/* TopAppBar Navigation Header */}
      <nav id="top-nav-bar" className="fixed top-0 w-full z-40 bg-[#0b0c0f]/80 backdrop-blur-3xl border-b border-white/5 shadow-sm flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-[var(--theme-color)] scale-105 active:scale-95 transition-transform cursor-pointer">
            radio
          </button>
          <h1 
            onClick={() => setCurrentView('home')}
            className="font-hanken text-2xl text-white tracking-tighter font-extrabold cursor-pointer hover:text-[#3b82f6] transition-colors flex items-center gap-1.5"
          >
            Station
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="material-symbols-outlined text-[#a7a7a7] hover:text-[var(--theme-color)] transition-colors cursor-pointer"
          >
            settings
          </button>
          <button 
            onClick={() => setCurrentView('search')}
            className="material-symbols-outlined text-[#a7a7a7] hover:text-[var(--theme-color)] transition-colors cursor-pointer"
          >
            search
          </button>
          <button 
            onClick={() => setShowNameModal(true)}
            className="w-8 h-8 rounded-full bg-[var(--theme-color)] flex items-center justify-center hover:scale-105 transition-transform cursor-pointer font-bold text-black text-xs shadow-lg"
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
              className="w-full h-12 bg-black/50 border border-zinc-800 rounded-xl px-4 text-white font-jakarta focus:outline-none focus:border-[var(--theme-color)]"
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
                className="px-6 py-2 bg-[var(--theme-color)] text-black font-semibold rounded-full hover:scale-105 transition-transform font-jakarta text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#18191d] p-6 rounded-3xl border border-white/5 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <h3 className="text-white font-hanken font-bold text-2xl flex items-center gap-2">
                <span className="material-symbols-outlined">style</span> Appearance
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-3">Theme Color</h4>
                <div className="flex gap-3">
                  {colors.map(c => (
                    <button
                      key={c.name}
                      onClick={() => changeThemeColor(c.value)}
                      title={c.name}
                      className="w-8 h-8 rounded-full shadow-md transition-transform hover:scale-110 active:scale-95"
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-3">Typography</h4>
                <div className="space-y-2">
                  {fonts.map(f => (
                    <button
                      key={f.name}
                      onClick={() => changeThemeFont(f.value)}
                      className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-jakarta text-sm transition-colors border border-transparent hover:border-white/10"
                      style={{ fontFamily: f.value }}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
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
            <div className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 bg-zinc-800 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
              <img alt="Playing album artwork mini" className="w-full h-full object-cover animate-in fade-in" src={activeTrack.coverArt || `https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=200&q=80`} />
            </div>
            <div className="truncate min-w-[120px]">
              <p className="font-jakarta font-semibold text-xs text-white truncate">{activeTrack.title}</p>
              <div className="flex items-center gap-1">
                <p className="text-[10px] text-[#a7a7a7] truncate">{activeTrack.artist}</p>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-color)] animate-ping flex-shrink-0"></span>
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
              className="w-9 h-9 rounded-full bg-[var(--theme-color)] flex items-center justify-center text-black shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
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
              className="h-full bg-[var(--theme-color)] shadow-[0_0_8px_rgba(29,185,84,0.6)] transition-all duration-300" 
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
            currentView === 'home' ? 'text-[var(--theme-color)] font-bold scale-102' : 'text-[#a7a7a7] opacity-70 hover:opacity-100'
          }`}
        >
          <span className="material-symbols-outlined fill-1">home</span>
          <span className="font-jakarta text-[10px] uppercase font-bold tracking-tight mt-1">Home</span>
        </button>

        <button 
          onClick={() => setCurrentView('search')}
          className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer ${
            currentView === 'search' ? 'text-[var(--theme-color)] font-bold scale-102' : 'text-[#a7a7a7] opacity-70 hover:opacity-100'
          }`}
        >
          <span className="material-symbols-outlined">search</span>
          <span className="font-jakarta text-[10px] uppercase font-bold tracking-tight mt-1">Search</span>
        </button>

        <button 
          onClick={() => setCurrentView('library')}
          className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer ${
            currentView === 'library' ? 'text-[var(--theme-color)] font-bold scale-102' : 'text-[#a7a7a7] opacity-70 hover:opacity-100'
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
