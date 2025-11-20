import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from './config.js';
export class QdrantService {
    client;
    collectionName;
    constructor() {
        this.client = new QdrantClient({
            url: config.qdrant.url,
            apiKey: config.qdrant.apiKey,
        });
        this.collectionName = config.qdrant.collectionName;
    }
    async ensureCollection() {
        try {
            const collections = await this.client.getCollections();
            const exists = collections.collections.some((col) => col.name === this.collectionName);
            if (!exists) {
                console.log(`Creating collection: ${this.collectionName}`);
                await this.client.createCollection(this.collectionName, {
                    vectors: {
                        size: config.qdrant.vectorSize,
                        distance: 'Cosine',
                    },
                });
                console.log('Collection created successfully');
            }
            else {
                console.log('Collection already exists');
            }
        }
        catch (error) {
            console.error('Error ensuring collection:', error);
            throw error;
        }
    }
    async upsertPoints(points) {
        try {
            await this.client.upsert(this.collectionName, {
                wait: true,
                points: points.map((point) => ({
                    id: point.id,
                    vector: point.vector,
                    payload: point.payload,
                })),
            });
            console.log(`Upserted ${points.length} points to Qdrant`);
        }
        catch (error) {
            console.error('Error upserting points:', error);
            throw error;
        }
    }
    async search(vector, limit = 5, scoreThreshold = 0.7) {
        try {
            const results = await this.client.search(this.collectionName, {
                vector,
                limit,
                score_threshold: scoreThreshold,
                with_payload: true,
            });
            return results.map((result) => ({
                id: result.id,
                score: result.score,
                payload: result.payload,
            }));
        }
        catch (error) {
            console.error('Error searching Qdrant:', error);
            throw error;
        }
    }
    async deleteCollection() {
        try {
            await this.client.deleteCollection(this.collectionName);
            console.log('Collection deleted successfully');
        }
        catch (error) {
            console.error('Error deleting collection:', error);
            throw error;
        }
    }
    async getCollectionInfo() {
        try {
            return await this.client.getCollection(this.collectionName);
        }
        catch (error) {
            console.error('Error getting collection info:', error);
            throw error;
        }
    }
}
