"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function PdfToolPage() {
  const [content, setContent] = useState("")
  const [format, setFormat] = useState<'markdown' | 'latex'>("markdown")
  const [filename, setFilename] = useState("document.pdf")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  async function convert() {
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, format, filename }),
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => "")
        setError(`Error ${res.status}: ${txt}`)
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename || "document.pdf"
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to convert"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Text → PDF</h1>
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 space-y-2">
            <div className="text-sm font-medium">Raw Text (Markdown or LaTeX)</div>
            <textarea
              className="w-full rounded-md border bg-background p-2 text-sm min-h-64 font-mono"
              placeholder={format === 'latex' ? "% LaTeX content here" : "# Markdown content here"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">Format</div>
              <select
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={format}
                onChange={(e) => setFormat(e.target.value as 'markdown' | 'latex')}
              >
                <option value="markdown">Markdown</option>
                <option value="latex">LaTeX</option>
              </select>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Filename</div>
              <input
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="document.pdf"
              />
            </div>
            <Separator />
            <Button onClick={convert} disabled={loading || !content.trim()}>{loading ? 'Converting…' : 'Convert to PDF'}</Button>
            {error && <div className="text-sm text-red-500 whitespace-pre-wrap break-words">{error}</div>}
            <div className="text-xs text-muted-foreground">
              AWS Lambda endpoint and API key will be configured later via environment variables.
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}


