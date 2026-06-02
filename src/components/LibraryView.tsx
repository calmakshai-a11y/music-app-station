import React, { useState } from 'react';
import { usePlayback } from '../PlaybackContext';

interface LibraryViewProps {
  onNavigateToPlaylist: (id: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onNavigateToPlaylist }) => {
  const { playlists, createPlaylist, likedTracks, playTrack } = usePlayback();
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistTitle.trim()) {
      createPlaylist(newPlaylistTitle.trim());
      setNewPlaylistTitle('');
      setIsCreating(false);
    }
  };

  const filteredPlaylists = playlists.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const likedSongs = likedTracks;

  // Determine if Liked Songs matches search
  const showLikedSongs = searchQuery.trim() === '' || 'liked songs'.includes(searchQuery.toLowerCase());

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Hero / Title Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-hanken text-3xl md:text-4xl text-white font-extrabold tracking-tight">Your Library</h2>
          <p className="font-jakarta text-xs text-[#a7a7a7] mt-0.5">Manage your personal playlists and liked songs.</p>
        </div>
        
        {isCreating ? (
          <form onSubmit={handleCreatePlaylist} className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              required
              autoFocus
              placeholder="Playlist name..."
              value={newPlaylistTitle}
              onChange={(e) => setNewPlaylistTitle(e.target.value)}
              className="px-4 py-2 bg-[#18191d] border border-zinc-850 rounded-full text-sm text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-[#1db954]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold rounded-full text-xs active:scale-95 transition-transform cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs cursor-pointer"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1db954] hover:bg-[#1ed760] text-black rounded-full text-xs font-bold transition-all hover:scale-102 active:scale-95 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            <span>Create New Playlist</span>
          </button>
        )}
      </div>

      {/* Library Search Filter */}
      <div className="relative group max-w-md">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-[#a7a7a7] text-sm">search</span>
        </div>
        <input
          type="text"
          className="w-full h-10 pl-10 pr-4 bg-[#18191d] border border-zinc-800 rounded-full font-jakarta text-xs text-[#f4f4f5] placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#1db954]/50 focus:border-[#1db954] transition-all"
          placeholder="Filter playlists, songs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h3 className="font-hanken text-lg text-white font-bold">Your Collections</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Liked Songs Tile */}
            {showLikedSongs && (
              <div
                className="bg-gradient-to-br from-[#4a148c] to-[#311b92] p-4 rounded-2xl flex flex-col justify-between h-48 hover:scale-[1.02] transition-transform cursor-pointer shadow-lg group relative overflow-hidden"
              >
                <div className="flex-1 space-y-2 mt-4 z-10 w-full mb-8 overflow-y-auto hide-scrollbar">
                  {likedSongs.slice(0, 3).map(song => (
                    <div key={song.id} className="text-white text-xs font-jakarta truncate opacity-90 w-full" onClick={(e) => { e.stopPropagation(); playTrack(song); }}>
                      <span className="font-bold">{song.title}</span> <span className="opacity-70">• {song.artist}</span>
                    </div>
                  ))}
                  {likedSongs.length > 3 && (
                    <div className="text-white text-xs font-jakarta opacity-70">
                      and {likedSongs.length - 3} more...
                    </div>
                  )}
                </div>
                <div className="z-10 mt-auto">
                  <h3 className="text-2xl font-bold font-hanken text-white">Liked Songs</h3>
                  <p className="text-white/80 font-jakarta text-xs font-semibold">{likedSongs.length} liked songs</p>
                </div>
              </div>
            )}

            {filteredPlaylists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => onNavigateToPlaylist(playlist.id)}
                className="bg-[#18191d] p-3 rounded-2xl flex items-center gap-4 hover:bg-[#202125] transition-all cursor-pointer group border border-zinc-850 h-24"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md bg-zinc-800">
                  {playlist.coverArt ? (
                    <img
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      src={playlist.coverArt}
                      alt={playlist.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                      <span className="material-symbols-outlined">queue_music</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-jakarta font-semibold text-sm text-white truncate">{playlist.title}</p>
                  <p className="font-jakarta text-xs text-[#a7a7a7]">
                    {playlist.tracksCount || playlist.tracks.length} Tracks
                  </p>
                </div>
                <button className="material-symbols-outlined text-zinc-500 hover:text-white transition-opacity p-2 text-2xl">
                  chevron_right
                </button>
              </div>
            ))}

            {!showLikedSongs && filteredPlaylists.length === 0 && (
              <div className="col-span-full py-8 text-center bg-[#18191d] border border-zinc-850 rounded-2xl text-zinc-500 font-jakarta text-sm">
                No collections found matching '{searchQuery}'
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
