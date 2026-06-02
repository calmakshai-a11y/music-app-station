export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: string; // "3:45"
  durationSec: number; // 225
  coverArt: string;
  youtubeId: string;
}

export interface Playlist {
  id: string;
  title: string;
  tracksCount: number;
  tracks: Track[];
  coverArt: string;
  createdBy: string; // "You", "Station", etc.
}

export interface Artist {
  id: string;
  name: string;
  avatar: string;
  isFollowed: boolean;
}

export interface Genre {
  id: string;
  title: string;
  gradientFrom: string;
  gradientTo: string;
  coverArt: string;
  sampleTracks: Track[];
}
