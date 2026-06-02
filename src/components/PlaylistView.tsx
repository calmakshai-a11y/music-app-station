import React from 'react';
import { usePlayback } from '../PlaybackContext';
import { TrackItem } from './TrackItem';

interface PlaylistViewProps {
  playlistId: string | null;
  onBack: () => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({ playlistId, onBack }) => {
  const { playlists, deletePlaylist, removeTrackFromPlaylist } = usePlayback();

  const playlist = playlists.find((p) => p.id === playlistId);

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <span className="material-symbols-outlined text-4xl text-zinc-600">error</span>
        <h2 className="text-white font-hanken text-xl font-bold">Playlist not found</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-jakarta text-xs cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-end gap-6 bg-gradient-to-t from-[#18191d] to-transparent p-6 -mx-4 sm:mx-0 rounded-2xl sm:rounded-none sm:bg-none sm:p-0 border-b border-zinc-900 pb-8">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
          <img className="w-full h-full object-cover" src={playlist.coverArt} alt={playlist.title} />
        </div>
        <div className="space-y-2">
          <p className="font-jakarta text-xs font-bold text-white uppercase tracking-widest">Playlist</p>
          <h1 className="font-hanken text-4xl md:text-6xl text-white font-extrabold tracking-tight">
            {playlist.title}
          </h1>
          <p className="font-jakarta text-sm text-[#a7a7a7]">
            {playlist.tracksCount || playlist.tracks.length} Tracks • Created by {playlist.createdBy}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full font-jakarta text-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back
        </button>

        <button
          onClick={() => {
            deletePlaylist(playlist.id);
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-full font-jakarta text-xs cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-sm">delete</span> Delete Playlist
        </button>
      </div>

      {/* Track List */}
      <div className="space-y-2 pt-4">
        {playlist.tracks.length > 0 ? (
          playlist.tracks.map((track, idx) => (
            <TrackItem 
              key={track.id + idx} 
              track={track} 
              index={idx}
              onRemove={() => removeTrackFromPlaylist(playlist.id, track.id)}
              removeLabel="Remove from playlist"
            />
          ))
        ) : (
          <p className="text-zinc-500 font-jakarta text-sm">This playlist is empty. Play songs and add them here!</p>
        )}
      </div>
    </div>
  );
};
