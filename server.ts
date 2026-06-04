import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for real YouTube search proxy
  app.get("/api/youtube/search", async (req, res) => {
    try {
      const { q } = req.query;
      const apiKey = process.env.YOUTUBE_API_KEY;

      if (!apiKey) {
        return res.json({
          status: "configured_needed",
          error: "YOUTUBE_API_KEY environment variable is defined but missing is actual secret key in Settings.",
          tracks: []
        });
      }

      if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      // Fetch from YouTube Data API v3
      const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&videoCategoryId=10&type=video&q=${encodeURIComponent(
        q + " -shorts -short"
      )}&key=${apiKey}`;

      const response = await fetch(youtubeUrl);
      if (!response.ok) {
        const errorData = await response.json();
        return res.json({
          status: "api_error",
          error: errorData?.error?.message || "YouTube API error",
          tracks: []
        });
      }

      const data = await response.json();
      const items = data.items || [];
      if (items.length === 0) {
        return res.json({ status: "success", tracks: [] });
      }

      // Fetch durations
      const videoIds = items.map((item: any) => item.id.videoId).join(",");
      const durationUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`;
      const durationRes = await fetch(durationUrl);
      let durationMap: Record<string, { duration: string, durationSec: number }> = {};
      
      if (durationRes.ok) {
        const durationData = await durationRes.json();
        (durationData.items || []).forEach((vItem: any) => {
          const isoDuration = vItem.contentDetails?.duration || "PT3M30S";
          const sec = parseIsoDuration(isoDuration);
          durationMap[vItem.id] = {
            durationSec: sec,
            duration: formatDuration(sec)
          };
        });
      }

      // Map YouTube items to our high-fidelity Track schema
      const tracks = items.map((item: any) => {
        const videoId = item.id.videoId;
        const title = item.snippet.title;
        const artist = item.snippet.channelTitle || "YouTube Artist";
        const coverArt = item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&q=80&fit=crop";
        
        const d = durationMap[videoId] || { duration: "3:30", durationSec: 210 };

        return {
          id: `yt-${videoId}`,
          title: decodeHtmlEntities(title),
          artist: decodeHtmlEntities(artist),
          album: "YouTube Discovery",
          duration: d.duration,
          durationSec: d.durationSec,
          coverArt: coverArt,
          youtubeId: videoId
        };
      }).filter((t: any) => t.durationSec > 90); // Filter out potential shorts (<90s)

      res.json({
        status: "success",
        tracks
      });
    } catch (error: any) {
      console.error("YouTube search error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Helper utility to decode HTML character references
  function decodeHtmlEntities(str: string) {
    return str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
  }

  function parseIsoDuration(duration: string) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 210;
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  function formatDuration(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' + s : s}`;
  }

  // Vite middleware for development (fallback if dist/index.html doesn't exist)
  const distPath = path.join(process.cwd(), "dist");
  const useVite = process.env.NODE_ENV !== "production" || !fs.existsSync(path.join(distPath, "index.html"));

  if (useVite) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
