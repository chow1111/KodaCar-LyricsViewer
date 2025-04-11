
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

const CACHE = new Map();

const App = () => {
  const [song, setSong] = useState(null);
  const [lyrics, setLyrics] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(16);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const lyricsRef = useRef(null);

  useEffect(() => {
    const hash = window.location.href.split('?')[1];
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    setAccessToken(token);
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    const fetchSong = async () => {
      try {
        const res = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.data?.item) {
          const currentSong = res.data.item;
          setSong(currentSong);

          const key = `${currentSong.name}-${currentSong.artists[0].name}`;

          if (CACHE.has(key)) {
            setLyrics(CACHE.get(key));
          } else {
            const lyricsRes = await axios.get(`https://kodacar-lyricsviewer.onrender.com/lyrics?title=${encodeURIComponent(currentSong.name)}&artist=${encodeURIComponent(currentSong.artists[0].name)}`);
            CACHE.set(key, lyricsRes.data.lyrics);
            setLyrics(lyricsRes.data.lyrics);
          }
        }
      } catch (err) {
        setError('Failed to fetch song or lyrics. Please make sure Spotify is playing and tokens are valid.');
      }
    };

    fetchSong();
    const interval = setInterval(fetchSong, 10000);
    return () => clearInterval(interval);
  }, [accessToken]);

  useEffect(() => {
    if (lyricsRef.current) {
      const interval = setInterval(() => {
        lyricsRef.current.scrollTop += scrollSpeed;
      }, 100);
      return () => clearInterval(interval);
    }
  }, [lyrics, scrollSpeed]);

  return (
    <div className="p-4 text-white bg-black min-h-screen">
      <h1 className="text-xl font-bold mb-4">🎵 Tesla Lyrics Viewer</h1>
      {error && <div className="text-red-500">{error}</div>}

      {song && (
        <>
          <p className="text-lg">{song.name} - {song.artists[0].name}</p>
          <img src={song.album.images[0].url} alt="album cover" className="w-48 my-2" />
        </>
      )}

      <div className="mb-4">
        <label className="block text-sm">Font Size: {fontSize}px</label>
        <input type="range" min="12" max="30" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />

        <label className="block text-sm mt-2">Scroll Speed: {scrollSpeed}</label>
        <input type="range" min="1" max="10" value={scrollSpeed} onChange={(e) => setScrollSpeed(Number(e.target.value))} />
      </div>

      <div ref={lyricsRef} className="overflow-auto h-64 border border-gray-700 p-2 rounded" style={{ fontSize: `${fontSize}px` }}>
        <pre className="whitespace-pre-wrap">{lyrics}</pre>
      </div>
    </div>
  );
};

export default App;
