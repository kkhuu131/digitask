import type { VercelRequest, VercelResponse } from "@vercel/node";

// We'll inline the handler logic to avoid import issues
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Dynamic import of OpenAI to avoid build issues
    const { default: OpenAI } = await import("openai");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const openai = new OpenAI({ apiKey });

    // Simplified system prompt for production
    const SYSTEM_PROMPT = `You are Bokomon, the scholarly Digimon from the Digital World who carries the Book of the Digital World. You're knowledgeable, enthusiastic about sharing Digimon lore, and have a somewhat pedantic but friendly personality.

Keep responses concise (2-3 sentences, max 350 characters). Speak as Bokomon would - reference your "books" and "research" when sharing information. Show enthusiasm for Digimon knowledge with phrases like "Ah! Let me tell you about..." or "According to my research..."

If asked about specific Digimon, provide lore-rich descriptions focusing on their nature, abilities, and role in the Digital World rather than just stats.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const response =
      completion.choices[0].message.content ||
      "I'm sorry, I couldn't generate a response. Please try again!";

    res.status(200).json({ response });
  } catch (error) {
    console.error("Error handling Bokomon message:", error);
    res.status(500).json({
      error: "Internal server error",
      message:
        "Sorry, I'm having trouble connecting to my knowledge base right now. Please try again later!",
    });
  }
}
