import { QdrantService } from './qdrant-client.js';
import { EmbeddingService } from './embedding-service.js';
import { config } from './config.js';
import type { RAGContext } from './types.js';

export class RAGService {
  private qdrant: QdrantService;
  private embeddings: EmbeddingService;

  constructor() {
    this.qdrant = new QdrantService();
    this.embeddings = new EmbeddingService();
  }

  async initialize(): Promise<void> {
    await this.qdrant.ensureCollection();
  }

  async retrieveContext(query: string): Promise<RAGContext[]> {
    try {
      const queryEmbedding = await this.embeddings.generateEmbedding(query);

      const results = await this.qdrant.search(
        queryEmbedding,
        config.rag.topK,
        config.rag.scoreThreshold
      );

      return results.map((result) => ({
        text: result.payload?.text as string || '',
        source: result.payload?.source as string || '',
        score: result.score,
        page: result.payload?.page as number | undefined,
      }));
    } catch (error) {
      console.error('Error retrieving context:', error);
      return [];
    }
  }

  buildSystemPrompt(contexts: RAGContext[]): string {
    if (contexts.length === 0) {
      return `أنت المعلم الذكي، معلم رياضيات متخصص في المنهج السعودي. مهمتك هي مساعدة الطلاب على فهم المفاهيم الرياضية بطريقة واضحة وبسيطة.

قدم إجابات دقيقة ومفصلة، واستخدم أمثلة عملية عندما يكون ذلك مفيداً. إذا كان السؤال غير واضح، اطلب توضيحاً.`;
    }

    const contextText = contexts
      .map((ctx, idx) => {
        const pageInfo = ctx.page ? ` (صفحة ${ctx.page})` : '';
        return `[${idx + 1}] من ${ctx.source}${pageInfo}:\n${ctx.text}`;
      })
      .join('\n\n---\n\n');

    return `أنت المعلم الذكي، معلم رياضيات متخصص في المنهج السعودي. مهمتك هي مساعدة الطلاب على فهم المفاهيم الرياضية بطريقة واضحة وبسيطة.

لديك السياق التالي من المنهج الدراسي لمساعدتك في الإجابة:

${contextText}

استخدم هذا السياق للإجابة على أسئلة الطالب بدقة. إذا كان السؤال خارج نطاق السياق المتاح، قدم إجابة عامة مفيدة بناءً على معرفتك بالرياضيات.`;
  }

  async enhanceQuery(userQuery: string): Promise<{ systemPrompt: string; contexts: RAGContext[] }> {
    const contexts = await this.retrieveContext(userQuery);
    const systemPrompt = this.buildSystemPrompt(contexts);

    return { systemPrompt, contexts };
  }
}
