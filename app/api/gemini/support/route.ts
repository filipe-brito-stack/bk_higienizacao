import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Convert messages to Gemini SDK contents format
    // Or we can use historical system instruction config
    const systemInstruction = `
You are the dedicated AI Sales Coach and CRM Administrator at Nexus CRM (Enterprise Edition). 
Provide direct, highly polished, expert business development guidance, answer operational questions, or coach of sales practices.
The active user is Alex, Senior Business Executive. Keep answers professional, crisp, tactical, and warm. 
Format your output with beautiful structured paragraphs. Avoid jargon larping, maintain humble yet confident corporate tone.
`;

    // Process last user prompt
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || "No response received from Gemini.";

    return NextResponse.json({ success: true, reply });
  } catch (error: any) {
    console.error("Gemini API Error in Support Chat:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to communicate with support agent" },
      { status: 500 }
    );
  }
}
