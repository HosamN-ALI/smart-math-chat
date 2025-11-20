export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
}

export interface EmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface QdrantPoint {
  id: string;
  vector: number[];
  payload: {
    text: string;
    source: string;
    page?: number;
    chunk_index: number;
  };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface RAGContext {
  text: string;
  source: string;
  score: number;
  page?: number;
}
