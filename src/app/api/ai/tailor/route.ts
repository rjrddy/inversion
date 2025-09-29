import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { auth } from "@/lib/auth"

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 })
  }

  const { jobDescription, currentContent } = await req.json()
  const prompt = `You are an expert resume writer. Given the current resume content (JSON from a rich text editor) and a target job description, propose 3-6 concise bullet points tailored to the job. Output as a JSON array of strings.\n\nJob Description:\n${jobDescription}\n\nCurrent Resume Content (JSON):\n${JSON.stringify(currentContent).slice(0, 4000)}`

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Return only JSON array of strings with bullet suggestions." },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
  })

  const text = completion.choices[0]?.message?.content?.trim() || "[]"
  let bullets: string[] = []
  try {
    bullets = JSON.parse(text)
  } catch {
    bullets = []
  }

  return NextResponse.json({ bullets })
}


