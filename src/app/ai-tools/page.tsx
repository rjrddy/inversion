"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"

type App = { id: string; company: string; role: string }

export default function AIToolsPage() {
  const [fileText, setFileText] = useState("")
  const [jobDesc, setJobDesc] = useState("")
  const [apps, setApps] = useState<App[]>([])
  const [selectedApp, setSelectedApp] = useState<string>("")
  const [title, setTitle] = useState("Cover Letter")
  const [loading, setLoading] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: "Generated cover letter will appear here…" })],
    content: "",
    editorProps: { attributes: { class: "prose prose-sm max-w-none focus:outline-none min-h-64" } },
    immediatelyRender: false,
  })

  useEffect(() => {
    fetch("/api/applications")
      .then(async (r) => {
        if (!r.ok) {
          const errorText = await r.text()
          console.error(`API Error ${r.status}:`, errorText)
          throw new Error(`HTTP error! status: ${r.status}`)
        }
        const text = await r.text()
        if (!text) {
          throw new Error('Empty response')
        }
        return JSON.parse(text)
      })
      .then(setApps)
      .catch((error) => {
        console.error('Error fetching applications:', error)
        setApps([])
        // You could add a toast notification here to inform the user
      })
  }, [])

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const text = await f.text()
    setFileText(text)
  }

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jobDesc, resumeText: fileText }),
      })
      const data = await res.json()
      const markdown = data?.markdown || ""
      // simple: insert as paragraphs
      editor?.commands.setContent({ type: 'doc', content: markdown.split(/\n\n+/).map(p => ({ type: 'paragraph', content: [{ type: 'text', text: p }] })) })
    } finally {
      setLoading(false)
    }
  }

  async function save() {
    const json = editor?.getJSON() ?? {}
    if (!selectedApp) return
    await fetch("/api/cover-letters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobApplicationId: selectedApp, title, content: json }),
    })
  }

  // Interview prep state
  const [prepApp, setPrepApp] = useState<string>("")
  const [behavioralQ, setBehavioralQ] = useState("")
  const [behavioralA, setBehavioralA] = useState("")
  const [behavioralFeedback, setBehavioralFeedback] = useState("")
  const [techTag, setTechTag] = useState("arrays")
  const [techProblems, setTechProblems] = useState<Array<{ title: string; slug: string }>>([])
  const [pitchBackground, setPitchBackground] = useState("")
  const [pitch, setPitch] = useState("")

  async function runBehavioral() {
    const res = await fetch("/api/ai/behavioral", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: behavioralQ, answer: behavioralA, jobApplicationId: prepApp || undefined }) })
    const data = await res.json()
    setBehavioralFeedback(data?.feedback || "")
  }
  async function runTechnical() {
    const res = await fetch("/api/ai/technical", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tag: techTag, jobApplicationId: prepApp || undefined }) })
    const data = await res.json()
    setTechProblems(Array.isArray(data?.problems) ? data.problems : [])
  }
  async function runPitch() {
    const res = await fetch("/api/ai/pitch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ background: pitchBackground, jobApplicationId: prepApp || undefined }) })
    const data = await res.json()
    setPitch(data?.pitch || "")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">AI Tools</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 space-y-3 p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Resume (TXT, MD, or PDF extracted)</label>
            <Input type="file" accept=".txt,.md,.pdf" onChange={onFile} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Description</label>
            <textarea className="w-full rounded-md border bg-background p-2 text-sm min-h-32" value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Link to Application</label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={selectedApp} onChange={(e) => setSelectedApp(e.target.value)}>
              <option value="">Select application…</option>
              {apps.map(a => (
                <option key={a.id} value={a.id}>{a.company} — {a.role}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={generate} disabled={loading || !jobDesc.trim() || !fileText.trim()}>{loading ? 'Generating…' : 'Generate'}</Button>
            <Button onClick={save} variant="secondary" disabled={!selectedApp}>Save</Button>
          </div>
        </Card>
        <Card className="lg:col-span-2 p-3">
          <EditorContent editor={editor} />
        </Card>
      </div>

      <Card className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Interview Prep</h2>
          <select className="h-9 rounded-md border bg-background px-3 text-sm" value={prepApp} onChange={(e) => setPrepApp(e.target.value)}>
            <option value="">Unlinked</option>
            {apps.map(a => (<option key={a.id} value={a.id}>{a.company} — {a.role}</option>))}
          </select>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Behavioral Practice</div>
            <textarea className="w-full rounded-md border bg-background p-2 text-sm min-h-16" placeholder="Interviewer question" value={behavioralQ} onChange={(e) => setBehavioralQ(e.target.value)} />
            <textarea className="w-full rounded-md border bg-background p-2 text-sm min-h-24" placeholder="Your answer" value={behavioralA} onChange={(e) => setBehavioralA(e.target.value)} />
            <Button size="sm" onClick={runBehavioral}>Get Feedback</Button>
            {behavioralFeedback && <div className="text-sm whitespace-pre-wrap border rounded p-2">{behavioralFeedback}</div>}
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Technical Question Sets</div>
            <select className="h-9 rounded-md border bg-background px-3 text-sm" value={techTag} onChange={(e) => setTechTag(e.target.value)}>
              <option value="arrays">Arrays</option>
              <option value="graphs">Graphs</option>
              <option value="dynamic">Dynamic Programming</option>
            </select>
            <Button size="sm" onClick={runTechnical}>Fetch Set</Button>
            <div className="text-sm space-y-1">
              {techProblems.map((p, i) => (<div key={i} className="rounded border p-2">{p.title}</div>))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Elevator Pitch Generator</div>
            <textarea className="w-full rounded-md border bg-background p-2 text-sm min-h-24" placeholder="Background, highlights, target role/context" value={pitchBackground} onChange={(e) => setPitchBackground(e.target.value)} />
            <Button size="sm" onClick={runPitch}>Generate Pitch</Button>
            {pitch && <div className="text-sm whitespace-pre-wrap border rounded p-2">{pitch}</div>}
          </div>
        </div>
      </Card>
    </div>
  )
}


