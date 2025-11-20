export const config = {
  qdrant: {
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY || undefined,
    collectionName: 'saudi-math-curriculum',
    vectorSize: 1536, // text-embedding-3-small dimension
  },
  requesty: {
    apiKey: process.env.REQUESTY_API_KEY || '',
    baseUrl: process.env.REQUESTY_BASE_URL || 'https://router.requesty.ai/v1',
    embeddingModel: 'text-embedding-3-small',
    chatModel: 'anthropic/claude-3.5-sonnet',
  },
  ingestion: {
    chunkSize: 1000,
    chunkOverlap: 200,
  },
  rag: {
    topK: 5,
    scoreThreshold: 0.7,
  },
};
