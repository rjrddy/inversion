import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export default async function PortfolioPreviewPage() {
  const session = await auth()
  if (!session?.user?.id) return null
  const draft = await prisma.portfolioDraft.findFirst({ where: { userId: session.user.id } })
  if (!draft) return null

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-3xl mx-auto">
        {draft.template === "clean" && (
          <div className="space-y-6">
            {draft.aboutMe && (
              <section>
                <h2 className="text-3xl font-semibold mb-2">About Me</h2>
                <p className="text-base whitespace-pre-wrap opacity-80">{draft.aboutMe}</p>
              </section>
            )}
            <section>
              <h3 className="text-2xl font-semibold">Projects</h3>
              <div className="mt-3 space-y-3">
                {(Array.isArray(draft.projects) ? draft.projects : []).map((p: any, i: number) => (
                  <div key={i} className="rounded border p-3">
                    <div className="text-lg font-medium">{p.title || "Untitled project"}</div>
                    {p.description && <div className="opacity-80 whitespace-pre-wrap">{p.description}</div>}
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h3 className="text-2xl font-semibold">Experience</h3>
              <div className="mt-3 space-y-3">
                {(Array.isArray(draft.experience) ? draft.experience : []).map((e: any, i: number) => (
                  <div key={i} className="rounded border p-3">
                    <div className="text-lg font-medium">{e.role || "Role"} @ {e.company || "Company"}</div>
                    {e.summary && <div className="opacity-80 whitespace-pre-wrap">{e.summary}</div>}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}


