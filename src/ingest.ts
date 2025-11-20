import fs from 'fs/promises';
import path from 'path';
// @ts-ignore - pdf-parse types are incomplete
import pdf from 'pdf-parse';
import { QdrantService } from './qdrant-client.js';
import { EmbeddingService } from './embedding-service.js';
import { TextChunker } from './text-chunker.js';
import type { QdrantPoint } from './types.js';
import { randomUUID } from 'crypto';

async function ingestPDFs() {
  console.log('Starting PDF ingestion process...');

  const dataDir = path.join(process.cwd(), 'data');
  const qdrant = new QdrantService();
  const embeddings = new EmbeddingService();
  const chunker = new TextChunker();

  try {
    await qdrant.ensureCollection();

    const files = await fs.readdir(dataDir);
    const pdfFiles = files.filter((file) => file.toLowerCase().endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      console.log('No PDF files found in ./data directory');
      console.log('Please add PDF files to the ./data directory and run again');
      return;
    }

    console.log(`Found ${pdfFiles.length} PDF file(s)`);

    for (const pdfFile of pdfFiles) {
      console.log(`\nProcessing: ${pdfFile}`);
      const filePath = path.join(dataDir, pdfFile);

      try {
        const dataBuffer = await fs.readFile(filePath);
        const pdfData = await pdf(dataBuffer);

        console.log(`  Pages: ${pdfData.numpages}`);
        console.log(`  Text length: ${pdfData.text.length} characters`);

        const chunks = chunker.chunkWithMetadata(
          pdfData.text,
          pdfFile,
          undefined
        );

        console.log(`  Created ${chunks.length} chunks`);

        const batchSize = 10;
        for (let i = 0; i < chunks.length; i += batchSize) {
          const batch = chunks.slice(i, i + batchSize);
          console.log(`  Processing chunks ${i + 1}-${Math.min(i + batchSize, chunks.length)}...`);

          const texts = batch.map((chunk) => chunk.text);
          const embeddings_vectors = await embeddings.generateEmbeddings(texts);

          const points: QdrantPoint[] = batch.map((chunk, idx) => ({
            id: randomUUID(),
            vector: embeddings_vectors[idx],
            payload: {
              text: chunk.text,
              source: chunk.source,
              page: chunk.page,
              chunk_index: chunk.chunk_index,
            },
          }));

          await qdrant.upsertPoints(points);
        }

        console.log(`  ✓ Successfully processed ${pdfFile}`);
      } catch (error) {
        console.error(`  ✗ Error processing ${pdfFile}:`, error);
      }
    }

    const info = await qdrant.getCollectionInfo();
    console.log(`\n✓ Ingestion complete!`);
    console.log(`Total vectors in collection: ${info.points_count}`);
  } catch (error) {
    console.error('Fatal error during ingestion:', error);
    process.exit(1);
  }
}

ingestPDFs();
