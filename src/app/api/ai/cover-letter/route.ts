import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { auth } from "@/lib/auth"

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 })

  const { jobDescription, resumeText } = await req.json()
  const prompt = `You are an expert cover letter writer. Write a tailored, compelling cover letter draft (4-6 short paragraphs) based on the resume text and job description. Return plain markdown.\n\nJob Description:\n${jobDescription}\n\nResume:\n${resumeText?.slice?.(0, 8000) || ""}`

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You return concise, well-formatted markdown only." },
      { role: "user", content: prompt },
    ],
    temperature: 0.5,
  })

  const text = completion.choices[0]?.message?.content?.trim() || ""
  return NextResponse.json({ markdown: text })
}


