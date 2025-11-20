# Curriculum Data Directory

Place your Saudi math curriculum PDF files in this directory.

## Instructions

1. Add PDF files containing the math curriculum content
2. Run the ingestion script: `npm run ingest`
3. The script will automatically:
   - Extract text from PDFs
   - Chunk the content
   - Generate embeddings
   - Store in Qdrant vector database

## Example Structure

```
data/
├── grade-1-math.pdf
├── grade-2-math.pdf
├── algebra-basics.pdf
└── geometry-fundamentals.pdf
```

After ingestion, these files will be processed and their content will be available for the RAG system to retrieve relevant context for student questions.
