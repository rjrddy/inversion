import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

// POST /api/cover-letters -> save { jobApplicationId, title, content (JSON) }
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const { jobApplicationId, title, content } = body || {}
  if (!jobApplicationId || !title) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  const created = await prisma.coverLetter.create({
    data: {
      jobApplicationId,
      title: String(title),
      content: (content ?? {}) as Prisma.InputJsonValue,
    },
  })
  return NextResponse.json(created, { status: 201 })
}


