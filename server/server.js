const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();
const rateLimit = require('express-rate-limit');
const mime = require('mime-types');

const app = express();
const port = process.env.PORT || 5050;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());

const upload = multer({ dest: 'transcripts/', limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

const allowedExtensions = [
  '.txt',
  '.flac',
  '.m4a',
  '.mp3',
  '.mpga',   
  '.oga',    
  '.ogg',
  '.wav',
  '.webm',
  '.mp4',
  '.aac'
];

app.post('/upload', upload.single('transcript'), async (req, res) => {
  let filePath = req.file.path;
  try {
    const ext = path.extname(req.file.originalname).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      fs.unlink(filePath, () => {});
      return res.status(400).send(`Unsupported file format. Supported: ${allowedExtensions.join(', ')}`);
    }

    // Normalize file extension (for Whisper)
    const normalizedPath = filePath + ext;
    fs.renameSync(filePath, normalizedPath);
    filePath = normalizedPath;

    let transcript = '';

    if (ext === '.txt') {
      transcript = fs.readFileSync(filePath, 'utf8');
    } else {
      // Audio/video transcription using Whisper
      const audioStream = fs.createReadStream(filePath);
      const transcription = await openai.audio.transcriptions.create({
        file: audioStream,
        model: 'whisper-1',
      });
      transcript = transcription.text;
    }

    const prompt = `
You are an AI meeting assistant. Analyze this transcript and return a concise summary with bold headings (no Markdown asterisks):

Action items: List next steps for the sales rep.
Client objections: List concerns or questions raised by the client.
Sentiment: Indicate positive, neutral, or negative.
Deal status: Assess hot, warm, or cold.

Transcript:
${transcript}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    res.json({ result: completion.choices[0].message.content });
  } catch (err) {
    console.error('Error processing upload:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

app.listen(port,'0.0.0.0', () => {
  console.log(`Server running on port:${port}`);
});