import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { QdrantClient } from "npm:@qdrant/js-client-rest@1.9.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface EmbeddingResponse {
  data: Array<{ embedding: number[] }>;
}

interface RAGContext {
  text: string;
  source: string;
  score: number;
}

async function generateEmbedding(text: string, apiKey: string, baseUrl: string): Promise<number[]> {
  const response = await fetch(`${baseUrl}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-3-small",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding API error: ${response.status} - ${errorText}`);
  }

  const data: EmbeddingResponse = await response.json();
  return data.data[0].embedding;
}

async function retrieveContext(
  query: string,
  qdrantUrl: string,
  qdrantApiKey: string | undefined,
  requestyKey: string,
  requestyBaseUrl: string
): Promise<RAGContext[]> {
  try {
    const queryEmbedding = await generateEmbedding(query, requestyKey, requestyBaseUrl);

    const qdrantConfig: any = { url: qdrantUrl };
    if (qdrantApiKey) {
      qdrantConfig.apiKey = qdrantApiKey;
    }
    
    const qdrant = new QdrantClient(qdrantConfig);

    const results = await qdrant.search("saudi-math-curriculum", {
      vector: queryEmbedding,
      limit: 5,
      score_threshold: 0.7,
      with_payload: true,
    });

    return results.map((result: any) => ({
      text: result.payload?.text || "",
      source: result.payload?.source || "",
      score: result.score,
    }));
  } catch (error) {
    console.error("Error retrieving context:", error);
    return [];
  }
}

function buildSystemPrompt(contexts: RAGContext[]): string {
  if (contexts.length === 0) {
    return `أنت المعلم الذكي، معلم رياضيات متخصص في المنهج السعودي. مهمتك هي مساعدة الطلاب على فهم المفاهيم الرياضية بطريقة واضحة وبسيطة.\n\nقدم إجابات دقيقة ومفصلة، واستخدم أمثلة عملية عندما يكون ذلك مفيداً. إذا كان السؤال غير واضح، اطلب توضيحاً.`;
  }

  const contextText = contexts
    .map((ctx, idx) => `[${idx + 1}] من ${ctx.source}:\n${ctx.text}`)
    .join("\n\n---\n\n");

  return `أنت المعلم الذكي، معلم رياضيات متخصص في المنهج السعودي. مهمتك هي مساعدة الطلاب على فهم المفاهيم الرياضية بطريقة واضحة وبسيطة.\n\nلديك السياق التالي من المنهج الدراسي لمساعدتك في الإجابة:\n\n${contextText}\n\nاستخدم هذا السياق للإجابة على أسئلة الطالب بدقة. إذا كان السؤال خارج نطاق السياق المتاح، قدم إجابة عامة مفيدة بناءً على معرفتك بالرياضيات.`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const qdrantUrl = Deno.env.get("QDRANT_URL") || "http://localhost:6333";
    const qdrantApiKey = Deno.env.get("QDRANT_API_KEY");
    const requestyKey = Deno.env.get("REQUESTY_API_KEY");
    const requestyBaseUrl = Deno.env.get("REQUESTY_BASE_URL") || "https://router.requesty.ai/v1";

    if (!requestyKey) {
      return new Response(
        JSON.stringify({ error: "Missing REQUESTY_API_KEY" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const chatRequest: ChatRequest = await req.json();
    const userMessages = chatRequest.messages || [];

    const lastUserMessage = userMessages
      .filter((m) => m.role === "user")
      .pop();

    if (!lastUserMessage) {
      return new Response(
        JSON.stringify({ error: "No user message found" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const contexts = await retrieveContext(
      lastUserMessage.content,
      qdrantUrl,
      qdrantApiKey,
      requestyKey,
      requestyBaseUrl
    );

    const systemPrompt = buildSystemPrompt(contexts);

    const enhancedMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...userMessages.filter((m) => m.role !== "system"),
    ];

    const llmResponse = await fetch(
      `${requestyBaseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${requestyKey}`,
        },
        body: JSON.stringify({
          model: chatRequest.model || "anthropic/claude-3.5-sonnet",
          messages: enhancedMessages,
          temperature: chatRequest.temperature || 0.7,
          max_tokens: chatRequest.max_tokens || 4096,
        }),
      }
    );

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text();
      return new Response(
        JSON.stringify({ error: `LLM API error: ${errorText}` }),
        {
          status: llmResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const llmData = await llmResponse.json();

    return new Response(JSON.stringify(llmData), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in smart-math-chat:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
