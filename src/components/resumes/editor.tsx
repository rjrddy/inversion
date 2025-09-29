"use client"

import { useEffect, useMemo, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ResumeVersionType = {
  id: string
  content: any
  branchName: string
  createdAt: string
}

export function ResumeEditor({ resumeId, initialTitle }: { resumeId: string; initialTitle: string }) {
  const [title, setTitle] = useState(initialTitle)
  const [branchName, setBranchName] = useState("main")
  const [versions, setVersions] = useState<ResumeVersionType[]>([])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write your resume here…" }),
    ],
    content: "",
    editorProps: { attributes: { class: "prose prose-sm max-w-none focus:outline-none" } },
  })

  async function fetchVersions() {
    const res = await fetch(`/api/resumes/${resumeId}/versions`)
    const data = await res.json()
    setVersions(data)
    const latest = data[0]
    if (latest && editor) {
      editor.commands.setContent(latest.content || {})
      setBranchName(latest.branchName)
    }
  }

  useEffect(() => {
    fetchVersions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId])

  async function saveVersion() {
    const json = editor?.getJSON() ?? {}
    await fetch(`/api/resumes/${resumeId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: json, branchName }),
    })
    await fetch(`/api/resumes/${resumeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
    fetchVersions()
  }

  async function rollbackTo(versionId: string) {
    await fetch(`/api/resumes/${resumeId}/versions/rollback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetVersionId: versionId }),
    })
    fetchVersions()
  }

  const branches = useMemo(() => Array.from(new Set(versions.map(v => v.branchName))), [versions])

  const [jobDescription, setJobDescription] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiBullets, setAiBullets] = useState<string[]>([])

  async function tailor() {
    setAiLoading(true)
    try {
      const json = editor?.getJSON() ?? {}
      const res = await fetch("/api/ai/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, currentContent: json }),
      })
      const data = await res.json()
      setAiBullets(Array.isArray(data?.bullets) ? data.bullets : [])
    } finally {
      setAiLoading(false)
    }
  }

  function acceptBullet(text: string) {
    if (!editor) return
    editor.chain().focus().insertContent({ type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] }] }).run()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resume title" />
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={branchName}
            onChange={(e) => {
              const next = e.target.value
              setBranchName(next)
              const latest = versions.find(v => v.branchName === next)
              if (latest && editor) editor.commands.setContent(latest.content || {})
            }}
          >
            {["main", ...branches.filter(b => b !== "main")].map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <input
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="branch"
          />
        </div>
        <Button onClick={saveVersion}>Save version</Button>
      </div>
      <div className="border rounded-md p-3">
        <EditorContent editor={editor} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <h3 className="text-sm font-medium mb-2">Version history</h3>
          <div className="space-y-2">
            {versions.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded border p-2">
                <div className="text-sm">
                  <span className="font-medium">{v.branchName}</span> · {new Date(v.createdAt).toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => rollbackTo(v.id)}>Rollback</Button>
                </div>
              </div>
            ))}
            {versions.length === 0 && (
              <div className="text-sm text-muted-foreground">No versions yet. Create your first version.</div>
            )}
          </div>
        </div>
        <div className="lg:col-span-1">
          <h3 className="text-sm font-medium mb-2">AI Helper</h3>
          <textarea
            className="w-full rounded-md border bg-background p-2 text-sm min-h-28"
            placeholder="Paste job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <div className="mt-2 flex items-center gap-2">
            <Button size="sm" onClick={tailor} disabled={aiLoading || !jobDescription.trim()}>
              {aiLoading ? 'Tailoring...' : 'Tailor Resume'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAiBullets([])}>Clear</Button>
          </div>
          <div className="mt-3 space-y-2">
            {aiBullets.map((b, i) => (
              <div key={i} className="rounded border p-2 text-sm flex items-start justify-between gap-2">
                <span>{b}</span>
                <div className="shrink-0">
                  <Button size="sm" variant="secondary" onClick={() => acceptBullet(b)}>Accept</Button>
                </div>
              </div>
            ))}
            {aiBullets.length === 0 && (
              <div className="text-xs text-muted-foreground">No suggestions yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


