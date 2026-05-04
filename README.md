# DineNYC

DineNYC is an AI-powered restaurant discovery app for New York City. It lets users search in natural language (for example: "family-friendly Japanese spots in Manhattan") and returns matching restaurants from the NYC dataset.

## Features

- Natural-language restaurant search UI
- AI vector search pipeline using OpenAI + Pinecone
- Automatic fallback to local keyword matching when AI services are unavailable
- Borough and inspection-grade filters (`A`, `B`, `C`)
- Quick actions for call and map navigation
- Built-in API rate limit (50 requests/day per IP)

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- LangChain + LangGraph
- OpenAI (`gpt-4o-mini`, `text-embedding-3-large`)
- Pinecone Vector DB
- Zod + React Hook Form

## Project Structure

- `src/app/page.tsx`: Main UI, filters, and results cards
- `src/components/search-form.tsx`: Prompt input and submit flow
- `src/app/api/search/route.ts`: Search API (vector mode + fallback mode)
- `src/lib/data/Restaurants-Dataset.json`: Restaurant dataset used for matching
- `src/lib/VectorizeEmbed.ts`: Utility to generate and upload embeddings to Pinecone

## Environment Variables

Copy `.env.example` into `.env.local` and fill in values:

```bash
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_INDEX=
```

Behavior notes:

- If all three values are present, API uses vector retrieval + LLM orchestration.
- If any value is missing, API returns local fallback results from dataset keyword matching.

## Local Development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

- `npm run dev`: Start development server (Turbopack)
- `npm run build`: Build production app
- `npm run start`: Start production server
- `npm run lint`: Run lint checks

## API

### `POST /api/search`

Request body:

```json
{
  "prompt": "best chinese restaurants in queens"
}
```

Successful response shape:

```json
{
  "response": [
    {
      "DBA": "...",
      "BORO": "..."
    }
  ],
  "mode": "vector"
}
```

Possible `mode` values:

- `vector`: AI vector search path
- `fallback`: Local keyword matching path

Rate limit:

- 50 requests per 24-hour window per IP

## Deployment

This app can be deployed on Vercel or any Node-compatible Next.js host.

For production vector search, configure:

- `OPENAI_API_KEY`
- `PINECONE_API_KEY`
- `PINECONE_INDEX`

## Author

Built by Hrishik Desai.
