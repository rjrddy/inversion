import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const updated = await prisma.jobApplication.update({
    where: { id },
    data: {
      status: body?.status ?? undefined,
      notes: body?.notes ?? undefined,
      resumeVersionId: body?.resumeVersionId ?? undefined,
      company: body?.company ?? undefined,
      role: body?.role ?? undefined,
      appliedAt: body?.appliedAt ? new Date(body.appliedAt) : undefined,
    },
  })
  return NextResponse.json(updated)
}


