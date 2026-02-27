require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY || !ANTHROPIC_API_KEY.startsWith('sk-')) {
  console.error('❌  ERROR: Missing or invalid ANTHROPIC_API_KEY in .env');
  process.exit(1);
}

app.use(express.json({ limit: '10kb' }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST'],
}));

const portraitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please wait before generating more portraits.',
    retryAfter: 'Try again in 1 hour.'
  }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please slow down.' }
});

app.use(generalLimiter);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Moodverse API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/generate-portrait', portraitLimiter, async (req, res) => {
  const { mood, energy, tags, journal } = req.body;

  if (!mood || typeof mood !== 'string' || mood.length > 50) {
    return res.status(400).json({ error: 'Invalid mood input.' });
  }
  if (energy === undefined || energy < 1 || energy > 10) {
    return res.status(400).json({ error: 'Energy must be between 1 and 10.' });
  }
  if (journal && journal.length > 2000) {
    return res.status(400).json({ error: 'Journal entry too long (max 2000 chars).' });
  }

  const sanitizedJournal = (journal || '').replace(/<[^>]*>/g, '').trim();
  const sanitizedTags = Array.isArray(tags)
    ? tags.slice(0, 10).map(t => String(t).slice(0, 30)).join(', ')
    : '';

  const prompt = `You are a poetic AI soul reader for an app called Moodverse.

The user's emotional data:
- Core mood: ${mood}
- Energy level: ${energy}/10
- Descriptors: ${sanitizedTags || 'none selected'}
- Journal entry: "${sanitizedJournal || 'No entry today.'}"

Generate a deeply personal, poetic soul reading. Return ONLY valid JSON with this exact structure:
{
  "portrait_title": "A poetic 3-5 word title for this emotional portrait",
  "soul_color_primary": "a hex color that represents their primary emotion",
  "soul_color_secondary": "a hex color for secondary emotion",
  "soul_color_accent": "a hex color for accent",
  "mood_summary": "2-3 sentences describing their emotional state poetically and insightfully",
  "inner_weather": "one phrase like 'A storm clearing into gold' that describes their inner state",
  "energy_description": "one evocative sentence about their energy",
  "insight": "3-4 sentences of genuine psychological/emotional insight based on their inputs. Be specific, warm, and wise.",
  "affirmation": "A beautiful, personal affirmation (1-2 sentences) crafted specifically for this emotional moment. Make it poetic and powerful.",
  "mood_chips": ["chip1", "chip2", "chip3"],
  "canvas_style": "describe in 10 words a visual abstract art style that matches this mood"
}`;

  try {
    console.log(`[${new Date().toISOString()}] Generating portrait — mood: ${mood}, energy: ${energy}`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', errData);
      return res.status(502).json({
        error: 'Failed to generate portrait. Please try again.',
        detail: errData?.error?.message || `HTTP ${response.status}`
      });
    }

    const data = await response.json();
    const rawText = data.content?.find(b => b.type === 'text')?.text || '';
    const clean = rawText.replace(/```json|```/g, '').trim();

    let reading;
    try {
      reading = JSON.parse(clean);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr.message);
      return res.status(500).json({ error: 'Invalid response from AI. Please try again.' });
    }

    res.json({ success: true, reading });

  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('');
  console.log('  🌌  MOODVERSE Server');
  console.log(`  ✅  Running at http://localhost:${PORT}`);
  console.log(`  🔒  API key secured (${ANTHROPIC_API_KEY.slice(0, 12)}...)`);
  console.log('');
});

module.exports = app;
