# Parser Service

Dedicated upload parser service for Ghana Lesson Planner.
npx expo start -c --web


## Responsibility

This service is intended to be the hosted home for:

- PDF/DOCX text extraction
- class/term section isolation
- AI-assisted scheme parsing
- curriculum reconciliation
- parser warnings and confidence scoring

It is separate from Supabase Edge Functions because document parsing is heavier and needs
better file-processing support.

## Local run

From the repo root:

```bash
cd parser-service
npm install
npm run dev
```

By default the service looks for:

- `parser-service/.env`
- then falls back to the repo root `.env`

Required environment variables:

```env
ANTHROPIC_API_KEY
PARSER_SERVICE_PORT=8788
LOCAL_AI_MODEL=claude-sonnet-4-5
```

Optional app-side environment variable for Expo clients:

```env
EXPO_PUBLIC_PARSER_SERVICE_URL=https://your-parser-service-url
```

When that variable is set, uploaded scheme parsing goes to the hosted parser service instead
of the local development parser.

## Endpoint

### `POST /parse-scheme`

JSON body:

```json
{
  "subject": "Computing",
  "classLevel": "B7",
  "term": "Term 1",
  "fileName": "scheme.pdf",
  "fileBase64": "...",
  "numberOfWeeks": 12,
  "curriculumYearHint": []
}
```

Returns:

- reconciled `scheme`
- `detectedMetadata`

## Cloud Run

This folder includes a Dockerfile suitable as a first deploy target for Google Cloud Run.

## Render

This service is also ready for Render deployment.

The repo root includes a [render.yaml](</abs/path/c:/Users/KHERKHELLY/Desktop/LESSON PLANS/New folder/render.yaml:1>) blueprint that defines a Docker-based web service for the parser.

### Recommended setup in Render

1. Push this repo to GitHub.
2. Sign in to Render.
3. Create a new `Blueprint` or `Web Service`.
4. Connect the repo.
5. If you use the blueprint, Render should pick up:
   - `render.yaml`
   - `parser-service/Dockerfile`
6. Add the secret environment variable:

```env
ANTHROPIC_API_KEY
```

Render will provide the `PORT` environment variable. The blueprint also sets:

```env
PARSER_SERVICE_PORT=10000
LOCAL_AI_MODEL=claude-sonnet-4-5
```

### After deploy

Copy the Render service URL and add it to your Expo app:

```env
EXPO_PUBLIC_PARSER_SERVICE_URL=https://your-service-name.onrender.com
```

Then uploaded scheme parsing will use the hosted Render parser instead of localhost.
