import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const targetVersionId = body?.targetVersionId as string
  if (!targetVersionId) return NextResponse.json({ error: "Missing targetVersionId" }, { status: 400 })

  const target = await prisma.jobApplicationNoteVersion.findUnique({ where: { id: targetVersionId } })
  if (!target) return NextResponse.json({ error: "Target version not found" }, { status: 404 })

  const rollback = await prisma.jobApplicationNoteVersion.create({
    data: {
      jobApplicationId: id,
      content: target.content as Prisma.InputJsonValue,
      branchName: target.branchName,
    },
  })
  return NextResponse.json(rollback, { status: 201 })
}


