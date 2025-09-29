import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

// GET version list for a resume
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const versions = await prisma.resumeVersion.findMany({
    where: { resumeId: id },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(versions)
}

// POST create new version { content, branchName }
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()

  const version = await prisma.resumeVersion.create({
    data: {
      resumeId: id,
      content: (body?.content ?? {}) as Prisma.InputJsonValue,
      branchName: (body?.branchName ?? "main").toString(),
    },
  })
  return NextResponse.json(version, { status: 201 })
}


