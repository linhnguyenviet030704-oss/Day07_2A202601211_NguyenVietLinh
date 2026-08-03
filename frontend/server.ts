import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

app.use(express.json({ limit: "25mb" }));

app.use("/backend", async (req, res) => {
  try {
    const target = `${BACKEND_URL}${req.originalUrl.replace(/^\/backend/, "")}`;
    const upstream = await fetch(target, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: req.method === "GET" || req.method === "HEAD" ? undefined : JSON.stringify(req.body ?? {}),
    });
    res.status(upstream.status).type(upstream.headers.get("content-type") || "application/json");
    res.send(await upstream.text());
  } catch (error: any) {
    res.status(502).json({ error: error.message || "Backend unavailable" });
  }
});

// Initialize Gemini Client Lazily with User-Agent header as specified in skill guidelines
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      geminiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return geminiClient;
}

// Health Check API
app.get("/api/health", (req, res) => {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  res.json({
    status: "ok",
    hasApiKey,
    timestamp: new Date().toISOString()
  });
});

// Server-side RAG Direct Query Endpoint with Gemini Integration
app.post("/api/rag/generate", async (req, res) => {
  const startTime = Date.now();
  try {
    const { prompt, retrievedContext, retrievalOptions, history } = req.body;

    const ai = getGeminiClient();
    const generationMode = retrievalOptions?.generationMode || "grounded_strict";
    const temperature = retrievalOptions?.temperature ?? 0.2;

    let systemInstruction = "";

    if (generationMode === "grounded_strict") {
      systemInstruction = `Bạn là Trợ lý AI RAG chuyên nghiệp, chính xác và minh bạch.
Nhiệm vụ của bạn là trả lời câu hỏi của người dùng CHỈ DỰA TRÊN CÁC ĐOẠN TÀI LIỆU (RETRIEVED CONTEXT) được cung cấp bên dưới.
Quy tắc:
1. Trích dẫn rõ tên tài liệu và phần liên quan khi trả lời.
2. Nếu thông tin không có trong tài liệu được cung cấp, hãy nói rõ: "Dựa trên kho tài liệu hiện tại, tôi chưa tìm thấy thông tin cụ thể cho câu hỏi này."
3. Trình bày bằng tiếng Việt rõ ràng, mạch lạc, sử dụng định dạng Markdown đẹp mắt.`;
    } else if (generationMode === "analytical_synthesis") {
      systemInstruction = `Bạn là Chuyên gia Phân tích Tri thức RAG.
Nhiệm vụ của bạn là tổng hợp, so sánh và phân tích sâu các thông tin từ kho tài liệu retrieved được cung cấp.
Hãy tổ chức câu trả lời dưới dạng các mục phân tích, bảng biểu hoặc danh sách điểm chính nếu phù hợp.`;
    } else {
      systemInstruction = `Bạn là Trợ lý AI Thông minh. Sử dụng các đoạn ngữ cảnh retrieved được cung cấp để hỗ trợ trả lời câu hỏi một cách sáng tạo, tự nhiên và mở rộng giải thích khi cần thiết.`;
    }

    const contextBlock = retrievedContext && retrievedContext.length > 0
      ? retrievedContext.map((item: any, idx: number) => {
          return `--- [Tài liệu #${idx + 1}: ${item.chunk.documentName} | Độ tương đồng (similarity = 1 - distance): ${item.scoreFormatted} | Distance: ${item.distance}] ---
${item.chunk.content}`;
        }).join("\n\n")
      : "Không tìm thấy đoạn tài liệu phù hợp trong kho tri thức.";

    const fullUserPrompt = `[NGỮ CẢNH TRUY XUẤT (RETRIEVED CONTEXT)]
${contextBlock}

[CÂU HỎI NGUỜI DÙNG]
${prompt}`;

    let answerText = "";
    let tokensUsed = { prompt: 0, completion: 0 };

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: fullUserPrompt,
          config: {
            systemInstruction,
            temperature,
          },
        });
        answerText = response.text || "Không nhận được phản hồi từ mô hình Gemini.";
      } catch (err: any) {
        console.error("Gemini API call failed, generating fallback response:", err.message);
        answerText = generateFallbackRAGAnswer(prompt, retrievedContext, generationMode);
      }
    } else {
      answerText = generateFallbackRAGAnswer(prompt, retrievedContext, generationMode);
    }

    const duration = Date.now() - startTime;

    res.json({
      success: true,
      answer: answerText,
      executionTimeMs: duration,
      modelUsed: ai ? "gemini-3.6-flash (Live)" : "RAG Direct Processor",
      tokensUsed
    });
  } catch (error: any) {
    console.error("RAG Generate API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Lỗi xử lý sinh câu trả lời RAG"
    });
  }
});

// Helper Fallback Answer Generator if API key is not configured yet
function generateFallbackRAGAnswer(prompt: string, contextItems: any[], mode: string): string {
  if (!contextItems || contextItems.length === 0) {
    return `Tôi đã tìm kiếm trong kho tài liệu nhưng chưa thấy nội dung nào đáp ứng câu hỏi: "**${prompt}**".\n\n*Gợi ý:* Bạn có thể điều chỉnh **Ngưỡng tương đồng (Similarity Threshold)** trong phần cài đặt hoặc bổ sung thêm tài liệu liên quan.`;
  }

  const topMatch = contextItems[0];
  const totalMatches = contextItems.length;

  let response = `Dựa trên **${totalMatches} đoạn tài liệu** được trích xuất thành công (độ tương đồng cao nhất: **${topMatch.scoreFormatted}**):\n\n`;

  contextItems.forEach((item, index) => {
    response += `### ${index + 1}. Từ nguồn: \`${item.chunk.documentName}\` *(Similarity: ${item.scoreFormatted} | dist: ${item.distance})*\n`;
    const snippet = item.chunk.content.length > 250 ? item.chunk.content.substring(0, 250) + "..." : item.chunk.content;
    response += `> ${snippet.replace(/\n/g, "\n> ")}\n\n`;
  });

  response += `**Tóm tắt giải đáp cho câu hỏi "${prompt}":**\n`;
  response += `Các tài liệu được tìm thấy chứa thông tin liên quan trực tiếp đến truy vấn của bạn. Bạn có thể kiểm tra chi tiết từng đoạn trích xuất (retrieved items) ở danh sách thẻ bên dưới câu trả lời này.`;

  return response;
}

// Start Server Routine with Vite Integration
async function main() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server RAG application running on http://0.0.0.0:${PORT}`);
  });
}

main().catch(err => {
  console.error("Failed to start server:", err);
});
