import { config } from './config.js';
export class TextChunker {
    chunkSize;
    chunkOverlap;
    constructor(chunkSize, chunkOverlap) {
        this.chunkSize = chunkSize || config.ingestion.chunkSize;
        this.chunkOverlap = chunkOverlap || config.ingestion.chunkOverlap;
    }
    chunk(text) {
        if (!text || text.length === 0) {
            return [];
        }
        const chunks = [];
        let startIndex = 0;
        while (startIndex < text.length) {
            const endIndex = Math.min(startIndex + this.chunkSize, text.length);
            let chunk = text.slice(startIndex, endIndex);
            // Try to break at a sentence or paragraph boundary
            if (endIndex < text.length) {
                const lastPeriod = chunk.lastIndexOf('.');
                const lastNewline = chunk.lastIndexOf('\n');
                const breakPoint = Math.max(lastPeriod, lastNewline);
                if (breakPoint > this.chunkSize / 2) {
                    chunk = chunk.slice(0, breakPoint + 1);
                    startIndex += breakPoint + 1;
                }
                else {
                    startIndex += this.chunkSize - this.chunkOverlap;
                }
            }
            else {
                startIndex = text.length;
            }
            const trimmedChunk = chunk.trim();
            if (trimmedChunk.length > 0) {
                chunks.push(trimmedChunk);
            }
        }
        return chunks;
    }
    chunkWithMetadata(text, source, page) {
        const chunks = this.chunk(text);
        return chunks.map((chunk, index) => ({
            text: chunk,
            source,
            page,
            chunk_index: index,
        }));
    }
}
