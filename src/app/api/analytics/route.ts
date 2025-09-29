import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function ym(date: Date) {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  return `${y}-${String(m).padStart(2, "0")}`
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Applications over time (group by year-month)
  const apps = await prisma.jobApplication.findMany({
    where: { userId: session.user.id },
    select: { appliedAt: true, company: true, status: true, resumeVersionId: true },
  })

  const byMonth: Record<string, number> = {}
  for (const a of apps) {
    const key = ym(new Date(a.appliedAt))
    byMonth[key] = (byMonth[key] ?? 0) + 1
  }
  const months = Object.keys(byMonth).sort()
  const applicationsOverTime = months.map((date) => ({ date, count: byMonth[date] }))

  // Companies contacted
  const companyCounts: Record<string, number> = {}
  for (const a of apps) {
    if (!a.company) continue
    companyCounts[a.company] = (companyCounts[a.company] ?? 0) + 1
  }
  const companiesContacted = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name, value]) => ({ name, value }))

  // Resume versions vs interview success (success = status === "Offer")
  // For each application linked to a resumeVersionId, find total versions of that resume
  const versionsMap: Record<number, number> = {}
  for (const a of apps) {
    if (!a.resumeVersionId) continue
    if (a.status !== "Offer") continue
    const linked = await prisma.resumeVersion.findUnique({
      where: { id: a.resumeVersionId },
      select: { resumeId: true },
    })
    if (!linked?.resumeId) continue
    const count = await prisma.resumeVersion.count({ where: { resumeId: linked.resumeId } })
    versionsMap[count] = (versionsMap[count] ?? 0) + 1
  }
  const versionsVsSuccess = Object.entries(versionsMap)
    .map(([versions, success]) => ({ versions: Number(versions), success: Number(success) }))
    .sort((a, b) => a.versions - b.versions)

  return NextResponse.json({ applicationsOverTime, versionsVsSuccess, companiesContacted })
}


