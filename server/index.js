const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config({ path:'/etc/secrets/.env' });

const app = express();
const PORT = process.env.PORT || 8888;

app.use(cors());

app.get('/lyrics', async (req, res) => {
  console.log('this is jjs test');
  const { title, artist } = req.query;

  try {
    const response = await axios.get('https://api.genius.com/search', {
      headers: { Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}` },
      params: { q: `${title} ${artist}` }
    });

    const hits = response.data.response.hits;
    if (hits.length === 0) return res.status(404).json({ lyrics: 'Lyrics not found.' });

    const songPath = hits[0].result.path;
    const html = await axios.get(`https://genius.com${songPath}`);
    const lyricsMatch = html.data.match(/<div class="lyrics">.*?<p>(.*?)<\/p>/s);
    const lyrics = lyricsMatch ? lyricsMatch[1].replace(/<br\/>/g, '\n') : 'Lyrics not found';

    res.json({ lyrics });
  } catch (err) {
    console.log(`Error fetching lyrics: ${err}`)
    res.status(500).json({ error: 'Failed to fetch lyrics.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
