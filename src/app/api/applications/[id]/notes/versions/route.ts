import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const versions = await prisma.jobApplicationNoteVersion.findMany({ where: { jobApplicationId: id }, orderBy: { createdAt: "desc" } })
  return NextResponse.json(versions)
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const created = await prisma.jobApplicationNoteVersion.create({
    data: {
      jobApplicationId: id,
      content: (body?.content ?? {}) as Prisma.InputJsonValue,
      branchName: (body?.branchName ?? "main").toString(),
    },
  })
  return NextResponse.json(created, { status: 201 })
}
