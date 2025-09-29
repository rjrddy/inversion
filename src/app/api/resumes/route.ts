import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/resumes -> list resumes for current user
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(resumes)
}

// POST /api/resumes -> create resume { title }
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const title = (body?.title ?? "Untitled").toString()

  const resume = await prisma.resume.create({
    data: { title, userId: session.user.id },
  })
  return NextResponse.json(resume, { status: 201 })
}


