import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const created = await prisma.companyNote.create({
    data: { jobApplicationId: id, content: String(body?.content ?? "") },
  })
  return NextResponse.json(created, { status: 201 })
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const notes = await prisma.companyNote.findMany({ where: { jobApplicationId: id }, orderBy: { createdAt: "desc" } })
  return NextResponse.json(notes)
}


