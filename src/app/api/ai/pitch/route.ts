import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 })

  const { background, jobApplicationId } = await req.json()
  const prompt = `Craft a concise 30–60 second elevator pitch (first-person) tailored to this background and role context. Keep to 100-140 words.`
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You produce a polished, concise pitch (100-140 words)." },
      { role: "user", content: `${prompt}\n\nBackground:\n${background}` },
    ],
    temperature: 0.5,
  })
  const pitch = completion.choices[0]?.message?.content?.trim() || ""

  const created = await prisma.interviewPrepEntry.create({
    data: {
      userId: session.user.id,
      jobApplicationId: jobApplicationId ?? null,
      type: "pitch",
      input: { background } as Prisma.InputJsonValue,
      output: { pitch } as Prisma.InputJsonValue,
    },
  })

  return NextResponse.json({ pitch, entryId: created.id })
}


