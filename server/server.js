// server.js

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();
const rateLimit = require('express-rate-limit');
const app = express();
const port = process.env.port || 5050;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 20, 
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false, 
});

app.use(limiter);

const upload = multer({ dest: 'transcripts/' });

app.use(express.static(path.join(__dirname, '../client')));

app.use(express.json());

app.post('/upload', upload.single('transcript'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const transcript = fs.readFileSync(filePath, 'utf8');

    const prompt = `
You are an AI meeting assistant. Analyze this transcript and return:
- Action items
- Client objections
- Sentiment (positive, neutral, negative)
- Deal status (hot/warm/cold)
Output text with headings in bold; do not use Markdown asterisks
Transcript:
${transcript}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    res.json({ result: completion.choices[0].message.content });
  } catch (err) {
    console.error('Error processing upload:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
