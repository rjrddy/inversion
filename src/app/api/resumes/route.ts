import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/resumes -> list resumes for current user
export async function GET() {
  try {
    let session
    try {
      session = await auth()
    } catch (e) {
      // Treat auth resolution issues as unauthorized rather than 500
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    const serializedResumes = resumes.map((resume) => ({
      ...resume,
      createdAt: resume.createdAt.toISOString(),
    }))

    return NextResponse.json(serializedResumes)
  } catch (error) {
    console.error("Error fetching resumes:", error)
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 })
  }
}

// POST /api/resumes -> create resume { title }
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const body = await req.json()
    const title = (body?.title ?? "Untitled").toString()

    const resume = await prisma.resume.create({
      data: { title, userId: session.user.id },
    })
    
    // Convert BigInt values to strings for JSON serialization
    const serializedResume = {
      ...resume,
      createdAt: resume.createdAt.toISOString()
    }
    
    return NextResponse.json(serializedResume, { status: 201 })
  } catch (error) {
    console.error('Error creating resume:', error)
    return NextResponse.json({ error: "Failed to create resume" }, { status: 500 })
  }
}


