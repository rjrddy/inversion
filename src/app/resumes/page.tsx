"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ResumeEditor } from "@/components/resumes/editor"
import { Card } from "@/components/ui/card"

type Resume = { id: string; title: string; createdAt: string }

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [active, setActive] = useState<Resume | null>(null)

  async function load() {
    const res = await fetch("/api/resumes")
    if (!res.ok) {
      if (res.status === 401 && typeof window !== 'undefined') {
        window.location.href = "/signin"
        return
      }
      setResumes([])
      return
    }
    const text = await res.text()
    const data = text ? JSON.parse(text) : []
    setResumes(Array.isArray(data) ? data : [])
    if (!active && Array.isArray(data) && data.length > 0) setActive(data[0])
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function createResume() {
    const res = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `Resume ${resumes.length + 1}` }),
    })
    const created = await res.json()
    await load()
    setActive(created)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <Card className="lg:col-span-1 space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Resumes</h1>
          <Button size="sm" onClick={createResume}>New</Button>
        </div>
        <Separator />
        <div className="space-y-1">
          {resumes.map(r => (
            <button
              key={r.id}
              className={`w-full text-left rounded px-2 py-1 text-sm ${active?.id === r.id ? 'bg-muted' : 'hover:bg-muted'}`}
              onClick={() => setActive(r)}
            >
              {r.title}
            </button>
          ))}
          {resumes.length === 0 && (
            <div className="text-sm text-muted-foreground">No resumes yet.</div>
          )}
        </div>
      </Card>

      <Card className="lg:col-span-3 p-4">
        {active ? (
          <ResumeEditor resumeId={active.id} initialTitle={active.title} />
        ) : (
          <div className="text-sm text-muted-foreground">Select or create a resume to begin.</div>
        )}
      </Card>
    </div>
  )
}


