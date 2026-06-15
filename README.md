# Voice Changer

A full-stack voice transformation web app built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **FFmpeg**. Upload audio, apply classic DSP voice effects, preview the result, and download the processed file.

No AI or machine learning — only traditional FFmpeg audio filters.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![FFmpeg](https://img.shields.io/badge/FFmpeg-DSP-green)

## Features

- Drag-and-drop audio upload (MP3, WAV, M4A)
- 5 voice effects powered by FFmpeg DSP filters
- Original and processed audio preview players
- One-click download of transformed audio
- Real-time processing status and toast notifications
- Responsive, dark-mode UI with modern gradients
- Secure server-side processing with automatic temp file cleanup
- 25MB maximum upload size with validation

## Voice Effects

| Effect | FFmpeg Filter |
|--------|---------------|
| **Deep Voice** | `asetrate=44100*0.8,aresample=44100` |
| **Chipmunk** | `asetrate=44100*1.25,aresample=44100` |
| **Robot** | `afftfilt=real='hypot(re,im)*cos(0)':imag='hypot(re,im)*sin(0)'` |
| **Echo / Reverb** | `aecho=0.8:0.9:1000:0.3` |
| **Telephone** | `highpass=f=500,lowpass=f=2000` |

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn-style (Radix UI primitives)
- **Audio Processing:** FFmpeg via `fluent-ffmpeg` + `ffmpeg-static`
- **Notifications:** Sonner
- **Forms:** React Hook Form (available), native FormData for uploads

## Project Structure

```
voice-changer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── process/
│   │   │       └── route.ts       # POST endpoint for audio processing
│   │   ├── globals.css            # Global styles & theme tokens
│   │   ├── layout.tsx             # Root layout with toaster
│   │   ├── loading.tsx            # Loading skeleton
│   │   └── page.tsx               # Main landing page
│   ├── components/
│   │   ├── ui/                    # Reusable UI primitives (Button, Card, Select…)
│   │   └── voice-changer/         # Feature components
│   │       ├── AudioPlayer.tsx
│   │       ├── AudioUploader.tsx
│   │       ├── EffectSelector.tsx
│   │       ├── LoadingSkeleton.tsx
│   │       └── VoiceChangerApp.tsx
│   ├── lib/
│   │   ├── ffmpeg/
│   │   │   ├── cleanup.ts         # Temp file deletion
│   │   │   ├── effects.ts         # Effect definitions & filters
│   │   │   └── processor.ts       # FFmpeg processing wrapper
│   │   ├── utils.ts               # cn(), formatFileSize()
│   │   └── validation.ts          # File & effect validation
│   └── types/
│       └── voice.ts               # Shared TypeScript types
├── tmp/
│   └── audio/                     # Temporary processing directory (gitignored)
├── .env.example
├── next.config.ts
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- **Node.js** 18.17 or later (20+ recommended)
- **npm** 9+

### Installation

```bash
# Clone or navigate to the project
cd voice-changer

# Install dependencies
npm install

# (Optional) Copy environment template
cp .env.example .env.local
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Other Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript compiler check |
| `npm run clean` | Remove temporary audio files |

## API Reference

### `POST /api/process`

Process an uploaded audio file with a voice effect.

**Request** — `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Audio file (mp3, wav, m4a), max 25MB |
| `effect` | string | Yes | One of: `deep`, `chipmunk`, `robot`, `echo`, `telephone` |

**Response** — `200 OK`

Returns the processed audio as `audio/mpeg` with `Content-Disposition: attachment`.

**Error Response** — `400` / `500`

```json
{ "error": "Error message" }
```

## Deployment Notes

### Vercel

Vercel serverless functions have limitations for this app:

1. **FFmpeg binary size** — `ffmpeg-static` adds ~70MB. Vercel's 250MB function size limit usually accommodates this, but cold starts can be slow.
2. **Execution timeout** — Hobby plan: 10s max. Pro plan: up to 60s (configured via `maxDuration = 60` in the API route).
3. **Request body limit** — Vercel Hobby has a ~4.5MB request body limit. For 25MB uploads, use **Vercel Pro** or deploy elsewhere.
4. **Filesystem** — Serverless functions have ephemeral `/tmp`. The app writes to `tmp/audio/` which maps correctly in the Node.js runtime.

**Recommended Vercel settings:**
- Runtime: Node.js (not Edge) — already configured
- Region: Choose closest to your users
- Consider Pro plan for larger uploads and longer processing

### Railway

Railway is well-suited for this application:

1. **Persistent filesystem** — Temp files work reliably
2. **No strict body size limits** — 25MB uploads work out of the box
3. **Longer execution times** — Better for audio processing
4. **Docker option** — For guaranteed FFmpeg availability:

```dockerfile
FROM node:20-slim

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
```

On Railway with Docker, set `FFMPEG_PATH=/usr/bin/ffmpeg` in environment variables and update `processor.ts` to use it when set.

### General Production Tips

- Set `NODE_ENV=production`
- Ensure the `tmp/audio` directory is writable
- Monitor disk usage if processing volume is high
- Run `npm run clean` periodically or rely on automatic cleanup (already implemented)
- Use a reverse proxy (nginx) for additional upload size controls if needed

## Security

- File type validated by extension and MIME type
- Maximum file size enforced (25MB)
- Effect parameter validated against allowlist
- Temporary files deleted after every request (success or failure)
- No persistent storage of user uploads
- Server-side processing only — FFmpeg never runs in the browser

## License

MIT
