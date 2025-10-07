"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

type Draft = {
  id: string
  template: string
  aboutMe?: string | null
  projects?: any
  experience?: any
}

export default function PortfolioPage() {
  const [draft, setDraft] = useState<Draft | null>(null)
  const [aboutMe, setAboutMe] = useState("")
  const [template, setTemplate] = useState("clean")
  const [projects, setProjects] = useState<Array<{ title: string; description: string }>>([])
  const [experience, setExperience] = useState<Array<{ company: string; role: string; summary: string }>>([])

  useEffect(() => {
    fetch("/api/portfolio")
      .then(async (r) => {
        if (!r.ok) {
          const errorText = await r.text()
          console.error(`Portfolio API Error ${r.status}:`, errorText)
          throw new Error(`HTTP error! status: ${r.status}`)
        }
        const text = await r.text()
        if (!text) {
          throw new Error('Empty response')
        }
        return JSON.parse(text)
      })
      .then((d: Draft) => {
        setDraft(d)
        setTemplate(d.template || "clean")
        setAboutMe(d.aboutMe || "")
        setProjects(Array.isArray(d.projects) ? d.projects : [])
        setExperience(Array.isArray(d.experience) ? d.experience : [])
      })
      .catch((error) => {
        console.error('Error fetching portfolio:', error)
        // Set default values on error
        setTemplate("clean")
        setAboutMe("")
        setProjects([])
        setExperience([])
        // You could add a toast notification here to inform the user
      })
  }, [])

  function addProject() {
    setProjects([...projects, { title: "", description: "" }])
  }
  function addExperience() {
    setExperience([...experience, { company: "", role: "", summary: "" }])
  }

  async function save() {
    try {
      const res = await fetch("/api/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template, aboutMe, projects, experience }),
      })
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const text = await res.text()
      if (!text) {
        throw new Error('Empty response')
      }
      
      const data = JSON.parse(text)
      setDraft(data)
    } catch (error) {
      console.error('Error saving portfolio:', error)
      // You might want to show a toast notification here
    }
  }

  function TemplatePreview() {
    return (
      <Card className="p-5 bg-card">
        {template === "clean" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">{aboutMe ? "About Me" : ""}</h2>
              {aboutMe && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{aboutMe}</p>}
            </div>
            <div>
              <h3 className="text-lg font-semibold">Projects</h3>
              <div className="mt-2 space-y-2">
                {projects.map((p, i) => (
                  <div key={i} className="rounded border p-2">
                    <div className="font-medium">{p.title || "Untitled project"}</div>
                    {p.description && <div className="text-sm text-muted-foreground whitespace-pre-wrap">{p.description}</div>}
                  </div>
                ))}
                {projects.length === 0 && <div className="text-sm text-muted-foreground">No projects yet.</div>}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Experience</h3>
              <div className="mt-2 space-y-2">
                {experience.map((e, i) => (
                  <div key={i} className="rounded border p-2">
                    <div className="font-medium">{e.role || "Role"} @ {e.company || "Company"}</div>
                    {e.summary && <div className="text-sm text-muted-foreground whitespace-pre-wrap">{e.summary}</div>}
                  </div>
                ))}
                {experience.length === 0 && <div className="text-sm text-muted-foreground">No experience yet.</div>}
              </div>
            </div>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Portfolio</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => window.open("/portfolio/preview", "_blank")}>Preview Mode</Button>
          <Button onClick={save}>Save Draft</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="space-y-4 p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Template</label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={template} onChange={(e) => setTemplate(e.target.value)}>
              <option value="clean">Clean</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">About Me</label>
            <textarea className="w-full rounded-md border bg-background p-2 text-sm min-h-32" value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Projects</label>
              <Button size="sm" onClick={addProject}>Add</Button>
            </div>
            <div className="space-y-2">
              {projects.map((p, i) => (
                <div key={i} className="rounded border p-2 space-y-2">
                  <Input placeholder="Title" value={p.title} onChange={(e) => {
                    const next = [...projects]; next[i] = { ...next[i], title: e.target.value }; setProjects(next)
                  }} />
                  <textarea className="w-full rounded-md border bg-background p-2 text-sm min-h-20" placeholder="Description" value={p.description} onChange={(e) => {
                    const next = [...projects]; next[i] = { ...next[i], description: e.target.value }; setProjects(next)
                  }} />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Experience</label>
              <Button size="sm" onClick={addExperience}>Add</Button>
            </div>
            <div className="space-y-2">
              {experience.map((e, i) => (
                <div key={i} className="rounded border p-2 space-y-2">
                  <Input placeholder="Company" value={e.company} onChange={(ev) => {
                    const next = [...experience]; next[i] = { ...next[i], company: ev.target.value }; setExperience(next)
                  }} />
                  <Input placeholder="Role" value={e.role} onChange={(ev) => {
                    const next = [...experience]; next[i] = { ...next[i], role: ev.target.value }; setExperience(next)
                  }} />
                  <textarea className="w-full rounded-md border bg-background p-2 text-sm min-h-20" placeholder="Summary" value={e.summary} onChange={(ev) => {
                    const next = [...experience]; next[i] = { ...next[i], summary: ev.target.value }; setExperience(next)
                  }} />
                </div>
              ))}
            </div>
          </div>
        </Card>
        <TemplatePreview />
      </div>
    </div>
  )
}


