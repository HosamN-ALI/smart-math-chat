import { config } from './config.js';
import type { EmbeddingRequest, EmbeddingResponse } from './types.js';

export class EmbeddingService {
  private apiKey: string;
  private endpoint: string;
  private model: string;

  constructor() {
    this.apiKey = config.requesty.apiKey;
    this.endpoint = config.requesty.baseUrl;
    this.model = config.requesty.embeddingModel;

    if (!this.apiKey) {
      throw new Error('REQUESTY_API_KEY is required');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.endpoint}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          input: text,
          model: this.model,
        } as EmbeddingRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Embedding API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as EmbeddingResponse;

      if (!data.data || data.data.length === 0) {
        throw new Error('No embedding data returned');
      }

      return data.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await fetch(`${this.endpoint}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          input: texts,
          model: this.model,
        } as EmbeddingRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Embedding API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as EmbeddingResponse;

      return data.data.map((item) => item.embedding);
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }
}
