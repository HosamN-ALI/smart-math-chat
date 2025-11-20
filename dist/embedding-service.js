import { config } from './config.js';
export class EmbeddingService {
    apiKey;
    endpoint;
    model;
    constructor() {
        this.apiKey = config.requesty.apiKey;
        this.endpoint = config.requesty.baseUrl;
        this.model = config.requesty.embeddingModel;
        if (!this.apiKey) {
            throw new Error('REQUESTY_API_KEY is required');
        }
    }
    async generateEmbedding(text) {
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
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Embedding API error: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            if (!data.data || data.data.length === 0) {
                throw new Error('No embedding data returned');
            }
            return data.data[0].embedding;
        }
        catch (error) {
            console.error('Error generating embedding:', error);
            throw error;
        }
    }
    async generateEmbeddings(texts) {
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
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Embedding API error: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            return data.data.map((item) => item.embedding);
        }
        catch (error) {
            console.error('Error generating embeddings:', error);
            throw error;
        }
    }
}
