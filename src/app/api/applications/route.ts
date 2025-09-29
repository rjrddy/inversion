import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const apps = await prisma.jobApplication.findMany({
    where: { userId: session.user.id },
    orderBy: { appliedAt: "desc" },
  })
  return NextResponse.json(apps)
}

// Create a new application
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const created = await prisma.jobApplication.create({
    data: {
      userId: session.user.id,
      company: String(body?.company ?? "Company"),
      role: String(body?.role ?? "Role"),
      status: String(body?.status ?? "Applied"),
      appliedAt: body?.appliedAt ? new Date(body.appliedAt) : new Date(),
      notes: body?.notes ?? null,
      resumeVersionId: body?.resumeVersionId ?? null,
    },
  })
  return NextResponse.json(created, { status: 201 })
}


