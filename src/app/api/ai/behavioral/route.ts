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

  const { prompt, answer, jobApplicationId } = await req.json()

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a behavioral interview coach. Give concise, actionable feedback (STAR)." },
      { role: "user", content: `Question: ${prompt}\nCandidate Answer: ${answer}` },
    ],
    temperature: 0.4,
  })

  const feedback = completion.choices[0]?.message?.content?.trim() || ""

  const created = await prisma.interviewPrepEntry.create({
    data: {
      userId: session.user.id,
      jobApplicationId: jobApplicationId ?? null,
      type: "behavioral",
      input: { prompt, answer } as Prisma.InputJsonValue,
      output: { feedback } as Prisma.InputJsonValue,
    },
  })

  return NextResponse.json({ feedback, entryId: created.id })
}


