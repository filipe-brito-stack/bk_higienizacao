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
    const body = await req.json();
    const { contact, tone, senderName } = body;

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contact details are required" },
        { status: 400 }
      );
    }

    const { name, company, role, status, email } = contact;

    const prompt = `
You are Alex, the Senior Business Development Executive at Nexus CRM (Enterprise Edition). 
Write a highly professional, captivating, and customized sales follow-up email.

Recipient:
- Name: ${name}
- Title/Role: ${role}
- Company: ${company}
- Relationship Status: ${status}
- Email: ${email}

Context details:
- Sender Signature: ${senderName || "Alex (Nexus CRM)"}
- Tone of communication: ${tone || "Professional yet Warm"}

Generate a subject line and the email body.
Your output must be a JSON object with this shape:
{
  "subject": "Email subject line",
  "body": "Email body paragraphs with proper spacing and line breaks (do not include markdown bold or HTML, just plain text with standard double returns for paragraphs)."
}

Provide only the plain JSON object. Do not wrap in backticks or markdown formatting.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const textOutput = response.text || "{}";
    const emailDraft = JSON.parse(textOutput);

    return NextResponse.json({ success: true, email: emailDraft });
  } catch (error: any) {
    console.error("Gemini API Error in /email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate follow-up email",
      },
      { status: 500 }
    );
  }
}
