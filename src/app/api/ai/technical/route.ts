import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

// Placeholder: in a real implementation we'd call LeetCode API or a mirror.
// For now, return a small curated set based on tag/role.
const BANK: Record<string, Array<{ title: string; slug: string }>> = {
  arrays: [
    { title: "Two Sum", slug: "two-sum" },
    { title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock" },
  ],
  graphs: [
    { title: "Number of Islands", slug: "number-of-islands" },
  ],
  dynamic: [
    { title: "Climbing Stairs", slug: "climbing-stairs" },
  ],
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { tag = "arrays", jobApplicationId } = await req.json()
  const problems = BANK[tag] ?? BANK["arrays"]

  const created = await prisma.interviewPrepEntry.create({
    data: {
      userId: session.user.id,
      jobApplicationId: jobApplicationId ?? null,
      type: "technical",
      input: { tag } as Prisma.InputJsonValue,
      output: { problems } as Prisma.InputJsonValue,
    },
  })

  return NextResponse.json({ problems, entryId: created.id })
}


