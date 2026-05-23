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
    const { contacts, deals, tasks } = body;

    const dataSnapshotStr = JSON.stringify({
      contacts: contacts || [],
      deals: deals || [],
      tasks: tasks || [],
    });

    const prompt = `
You are the built-in AI Sales Director at Nexus CRM. Analyze the current state of our sales pipeline and activities, and provide high-impact, custom enterprise-level insights.

Metrics/Data provided:
${dataSnapshotStr}

Your response must be a valid JSON object containing exactly these properties:
{
  "summary": "A concise, sharp 1 sentence summary of our pipeline health.",
  "achievements": [
    "A notable achievement or positive indicator from our current activity."
  ],
  "risks": [
    "A direct risk or bottleneck detected (e.g., deals with no tasks, inactive customers, cold leads)."
  ],
  "recommendations": [
    {
      "title": "Short title of concrete action",
      "description": "Specific tactical action (e.g., 'Contact Michael Wood from TechStart Inc. regarding the CTO discussion, inactive for 2 days.')"
    }
  ],
  "predictedRevenue": "Brief forecast sentence for next month's closed-won revenue based on deal probability."
}

Ensure the recommendations are extremely precise, citing actual names and companies from the provided data.
Provide only the JSON block without markdown formatting or code block backticks.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const textOutput = response.text || "{}";
    // Parse to ensure it is valid JSON before returning
    const insights = JSON.parse(textOutput);

    return NextResponse.json({ success: true, insights });
  } catch (error: any) {
    console.error("Gemini API Error in /insights:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate predictive insights",
      },
      { status: 500 }
    );
  }
}
