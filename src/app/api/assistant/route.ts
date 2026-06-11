import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { buildSystemPrompt, type AssistantContext } from "@/lib/assistant/context";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Free-model chain (level 3 — the deterministic mock — lives client-side):
// 1. Gemini via the free Google AI Studio key, the strongest free-tier model
// 2. Pollinations: keyless, free, OpenAI-compatible — works with zero setup
const pollinations = createOpenAICompatible({
  name: "pollinations",
  baseURL: "https://text.pollinations.ai/openai",
});

function hasGeminiKey(): boolean {
  return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
}

// The client shows which mode is active (Gemini / Free AI / Demo)
export async function GET() {
  return Response.json({ mode: hasGeminiKey() ? "gemini" : "free" });
}

export async function POST(req: Request) {
  const { messages, context }: { messages: UIMessage[]; context: AssistantContext } =
    await req.json();

  const model = hasGeminiKey()
    ? google(config.ASSISTANT_GEMINI_MODEL)
    : pollinations(config.ASSISTANT_FREE_MODEL);

  const result = streamText({
    model,
    system: buildSystemPrompt(context),
    messages: await convertToModelMessages(messages),
    abortSignal: AbortSignal.timeout(45_000),
  });

  return result.toUIMessageStreamResponse();
}
