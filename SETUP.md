# Smart Math Teacher - Setup Guide

## Overview
This system integrates a RAG-enhanced math tutor specialized in the Saudi curriculum with LibreChat.

## Architecture
- **RAG Service**: Local TypeScript service for PDF ingestion and embeddings
- **Qdrant Cloud**: Vector database for semantic search (cloud-hosted)
- **Requesty API**: Embeddings via `text-embedding-3-small` and LLM inference via Claude 3.5 Sonnet
- **Supabase Edge Function**: RAG-enhanced chat endpoint
- **LibreChat**: Arabic-optimized UI with RTL support

## Prerequisites

### 1. Qdrant Cloud
The system is configured to use Qdrant Cloud. No local installation needed.

### 2. API Keys
Required API key:
- **Requesty API**: https://requesty.ai (for embeddings and LLM)

### 3. Environment Configuration
All configuration is already set in `.env`:
```bash
QDRANT_URL=https://dfc1c80b-b7f2-4b4f-8daa-1582a8b80e3e.europe-west3-0.gcp.cloud.qdrant.io:6333
QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.rKmmlaLvotuNhxetr_8_eYfMZtaaK5Ee4zl5dYOgNJE
REQUESTY_API_KEY=rqsty-sk-y4aKgcDPSLuXh6PXd4vHGBtHPlWRkyfZVcN6R3thk+7q8djI+bZs0L98Ud0PdZr0rsx1M/N1AGP07BZDhyeDSfVyyhum2Hbf6uVTPyFN8wU=
REQUESTY_BASE_URL=https://router.requesty.ai/v1
```

## Installation

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Ingest Curriculum PDFs
1. Place PDF files in the `./data` directory
2. Run the ingestion script:
```bash
npm run ingest
```

This will:
- Extract text from PDFs
- Chunk text (~1000 characters)
- Generate embeddings via Requesty
- Store vectors in Qdrant's `saudi-math-curriculum` collection

### Step 3: Configure Supabase Secrets
The Edge Function environment variables are automatically configured during deployment.

### Step 4: LibreChat Integration
1. Copy `librechat.yaml` to your LibreChat root directory
2. The `baseURL` is already configured to use your Supabase Edge Function
3. Set the `REQUESTY_API_KEY` in LibreChat's environment
4. Restart LibreChat

## Usage

### Chat Interface
Students can now chat with "المعلم الذكي" (The Smart Teacher) through LibreChat. The system will:
1. Retrieve relevant context from the curriculum
2. Enhance the prompt with that context
3. Generate answers via Claude 3.5 Sonnet

### Re-ingesting Data
To update or add new PDFs:
```bash
# Add PDFs to ./data directory
npm run ingest
```

## System Flow

```
Student Question
    ↓
LibreChat UI (Arabic/RTL)
    ↓
Supabase Edge Function
    ↓
[1] Generate query embedding (Requesty)
    ↓
[2] Search Qdrant Cloud for relevant context
    ↓
[3] Build enhanced prompt
    ↓
[4] Send to Claude 3.5 Sonnet (Requesty)
    ↓
[5] Stream response back to student
```

## Key Features
- ✅ RAG-enhanced responses with curriculum context
- ✅ Arabic UI with RTL support
- ✅ Semantic search via embeddings
- ✅ Streaming chat responses
- ✅ Source attribution in context

## Troubleshooting

### Ingestion fails
- Check PDFs are in `./data` directory
- Verify Qdrant Cloud connection is working
- Confirm Requesty API key is valid

### No relevant context retrieved
- Check Qdrant Cloud dashboard for vectors
- Verify collection name is `saudi-math-curriculum`
- Lower score threshold in `src/config.ts`

### Edge Function errors
- Check Supabase logs for detailed errors
- Verify all environment variables are set
- Ensure Qdrant Cloud is accessible from Supabase

## Development

### Build
```bash
npm run build
```

### Local Testing
```bash
# Test ingestion
npm run ingest

# Test RAG retrieval (add test script if needed)
node dist/test-rag.js
```
