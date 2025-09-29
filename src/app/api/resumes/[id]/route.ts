import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const resume = await prisma.resume.findFirst({
    where: { id, userId: session.user.id },
    include: { versions: { orderBy: { createdAt: "desc" } } },
  })
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(resume)
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()

  const updated = await prisma.resume.update({
    where: { id },
    data: { title: body?.title },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.resume.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}


