import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ensure this exists:
const IMAGES_DIR = path.join(process.cwd(), 'images');
await fs.mkdir(IMAGES_DIR, { recursive: true });

// Serve front-end & saved images
app.use(express.static('public'));
app.use('/images', express.static(IMAGES_DIR));

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('Missing OPENAI_API_KEY in .env');
  process.exit(1);
}

// A simple root route
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Generate story
app.post('/generate-story', async (req, res) => {
  const words = req.body.words || [];
  try {
    const storyPrompt = `Write a dream-like first person story based on these components: ${words.join(', ')}. Keep it under 100 words.`;

    const aiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: storyPrompt }]
      }),
    });
    const aiData = await aiResp.json();
    const story = aiData.choices?.[0]?.message?.content;
    if (story) return res.json({ story });
    res.status(500).json({ error: 'No story generated.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'OpenAI error.' });
  }
});

// Generate a DALL·E-style prompt from the story
app.post('/generate-image-prompt', async (req, res) => {
  const { story } = req.body;
  if (!story) {
    return res.status(400).json({ error: 'Missing story in request body' });
  }

  try {
    const promptResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system',
            content: `You are an assistant that turns short stories into vivid DALL·E prompts.  
                      Always write them in a surrealist style from artists like Dalí or Magritte, but with muted colors`.replace(/\s+/g,' ')
          },
          { role: 'user', content: story }
        ],
        temperature: 0.8,
        max_tokens: 60
      })
    });
    const promptData = await promptResp.json();

    if (promptData.error) {
      console.error('OpenAI image-prompt error:', promptData.error);
      return res.status(502).json({ error: promptData.error.message });
    }

    const imagePrompt = promptData.choices?.[0]?.message?.content?.trim();
    if (!imagePrompt) {
      return res.status(500).json({ error: 'Failed to generate image prompt' });
    }

    res.json({ imagePrompt });
  } catch (err) {
    console.error('❌ /generate-image-prompt error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /generate-images → generate n images, save each to disk, return their public URLs
app.post('/generate-images', async (req, res) => {
    const { prompt, n = 3 } = req.body;

    try {
      const aiResp = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ prompt, n, size: '512x512' })
      });
      const aiData = await aiResp.json();
      if (!aiData.data || !Array.isArray(aiData.data)) {
        return res.status(500).json({ error: 'No images returned from OpenAI' });
      }

      const publicUrls = await Promise.all(aiData.data.map(async (item) => {
        const imageUrl = item.url;
        const imgResp = await fetch(imageUrl);
        const buffer = await imgResp.buffer();

        const filename = `ai-image-${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
        const filepath = path.join(IMAGES_DIR, filename);
        await fs.writeFile(filepath, buffer);

        return `${req.protocol}://${req.get('host')}/images/${filename}`;
      }));

      res.json({ imageUrls: publicUrls });

    } catch (err) {
      console.error('❌ /generate-images error', err);
      res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

// Ensure all OpenAI API calls are routed through the server
// Removed direct API key usage from the front-end
