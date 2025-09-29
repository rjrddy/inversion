"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card as UICard } from "@/components/ui/card"

type App = { id: string; company: string; role: string; status: string; notes?: string | null }

const STATUSES = ["Applied", "Interviewing", "Offer", "Rejected"]

export default function ApplicationsPage() {
  const [apps, setApps] = useState<App[]>([])
  const [creating, setCreating] = useState({ company: "", role: "" })

  async function load() {
    const res = await fetch("/api/applications")
    if (!res.ok) {
      if (res.status === 401 && typeof window !== 'undefined') {
        window.location.href = "/signin"
        return
      }
      setApps([])
      return
    }
    const text = await res.text()
    const data = text ? JSON.parse(text) : []
    setApps(Array.isArray(data) ? data : [])
  }
  useEffect(() => { load() }, [])

  async function create() {
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: creating.company, role: creating.role, status: "Applied" }),
    })
    await res.json()
    setCreating({ company: "", role: "" })
    load()
  }

  async function move(id: string, status: string) {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    load()
  }

  function Column({ status }: { status: string }) {
    const columnApps = apps.filter(a => a.status === status)
    return (
      <UICard className="p-3 bg-card min-h-64">
        <div className="text-sm font-medium mb-2">{status}</div>
        <div className="space-y-2">
          {columnApps.map(a => (
            <ApplicationCard key={a.id} app={a} onMove={move} />
          ))}
          {columnApps.length === 0 && <div className="text-xs text-muted-foreground">No applications</div>}
        </div>
      </UICard>
    )
  }

  function ApplicationCard({ app, onMove }: { app: App; onMove: (id: string, status: string) => void }) {
    const [tab, setTab] = useState<'move' | 'notes'>('move')
    const [note, setNote] = useState("")
    const [versions, setVersions] = useState<any[]>([])
    const [branch, setBranch] = useState("main")

    async function addNote() {
      if (!note.trim()) return
      await fetch(`/api/applications/${app.id}/notes/versions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: { text: note, prep: [], questions: [] }, branchName: branch }) })
      setNote("")
      loadVersions()
    }
    async function loadVersions() {
      const res = await fetch(`/api/applications/${app.id}/notes/versions`)
      const data = await res.json()
      setVersions(data)
    }
    async function rollback(id: string) {
      await fetch(`/api/applications/${app.id}/notes/versions/rollback`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetVersionId: id }) })
      loadVersions()
    }

    useEffect(() => { loadVersions() }, [])

    return (
      <UICard className="bg-background p-2 space-y-2">
        <div className="text-sm font-medium">{app.company} — {app.role}</div>
        <div className="flex items-center gap-2 text-xs">
          <button className={`px-2 py-1 rounded ${tab==='move'?'bg-muted':''}`} onClick={() => setTab('move')}>Move</button>
          <button className={`px-2 py-1 rounded ${tab==='notes'?'bg-muted':''}`} onClick={() => setTab('notes')}>Company Notes</button>
        </div>
        {tab === 'move' && (
          <div className="flex items-center gap-2">
            {STATUSES.filter(s => s !== app.status).map(s => (
              <Button key={s} size="sm" variant="outline" onClick={() => onMove(app.id, s)}>{s}</Button>
            ))}
          </div>
        )}
        {tab === 'notes' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <select className="h-8 rounded-md border bg-background px-2 text-xs" value={branch} onChange={(e) => setBranch(e.target.value)}>
                {["main", ...Array.from(new Set(versions.map(v => v.branchName))).filter(b => b !== 'main')].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <Input value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="branch" />
            </div>
            <div className="flex items-center gap-2">
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes / prep / questions" />
              <Button size="sm" onClick={addNote}>Save</Button>
            </div>
            <div className="space-y-1">
              {versions.map(v => (
                <div key={v.id} className="rounded border p-2 text-xs flex items-center justify-between">
                  <span>{v.branchName} · {new Date(v.createdAt).toLocaleString()}</span>
                  <Button size="sm" variant="outline" onClick={() => rollback(v.id)}>Rollback</Button>
                </div>
              ))}
              {versions.length === 0 && <div className="text-xs text-muted-foreground">No note versions yet.</div>}
            </div>
          </div>
        )}
      </UICard>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Applications</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Company" value={creating.company} onChange={(e) => setCreating({ ...creating, company: e.target.value })} />
          <Input placeholder="Role" value={creating.role} onChange={(e) => setCreating({ ...creating, role: e.target.value })} />
          <Button onClick={create}>Add</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {STATUSES.map(s => <Column key={s} status={s} />)}
      </div>
    </div>
  )
}


