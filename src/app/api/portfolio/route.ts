import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

// GET returns user's portfolio draft (create if missing)
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let draft = await prisma.portfolioDraft.findFirst({ where: { userId: session.user.id } })
    if (!draft) {
      draft = await prisma.portfolioDraft.create({
        data: { userId: session.user.id, template: "clean" },
      })
    }
    return NextResponse.json(draft)
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
  }
}

// PATCH updates fields: template, aboutMe, projects, experience
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const body = await req.json()

    const updated = await prisma.portfolioDraft.updateMany({
      where: { userId: session.user.id },
      data: {
        template: body?.template ?? undefined,
        aboutMe: body?.aboutMe ?? undefined,
        projects: (body?.projects ?? undefined) as Prisma.InputJsonValue | undefined,
        experience: (body?.experience ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    })

    const draft = await prisma.portfolioDraft.findFirst({ where: { userId: session.user.id } })
    return NextResponse.json(draft)
  } catch (error) {
    console.error('Error updating portfolio:', error)
    return NextResponse.json({ error: "Failed to update portfolio" }, { status: 500 })
  }
}


