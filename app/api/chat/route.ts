import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are JobMe Assistant, a helpful AI for the JobMe job portal.
      Help users with: finding jobs, applying for jobs, posting jobs,
      resume tips, interview tips, and navigating the portal.
      Keep answers short, friendly and helpful.`,
    });

    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return NextResponse.json({ reply: response });

  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json(
      { reply: "Something went wrong. Try again!" },
      { status: 500 }
    );
  }
}