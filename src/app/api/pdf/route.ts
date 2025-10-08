import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lambdaUrl = process.env.LAMBDA_PDF_URL
    const apiKey = process.env.LAMBDA_PDF_API_KEY
    if (!lambdaUrl) {
      return NextResponse.json(
        { error: "PDF service not configured. Set LAMBDA_PDF_URL." },
        { status: 501 }
      )
    }

    const body = await req.json().catch(() => ({})) as { content?: string; format?: string; filename?: string }
    const content = (body?.content ?? "").toString()
    const format = (body?.format ?? "markdown").toString()
    const filename = (body?.filename ?? "document.pdf").toString()

    if (!content.trim()) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 })
    }
    if (!["markdown", "latex"].includes(format)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 })
    }

    const upstream = await fetch(lambdaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { "x-api-key": apiKey } : {}),
      },
      body: JSON.stringify({ content, format }),
    })

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "")
      return NextResponse.json({ error: "Upstream PDF error", details: errText }, { status: 502 })
    }

    const pdfArrayBuffer = await upstream.arrayBuffer()
    const res = new NextResponse(pdfArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename.replace(/"/g, '')}"`,
        "Cache-Control": "no-store",
      },
    })
    return res
  } catch (error) {
    console.error("Error converting to PDF:", error)
    return NextResponse.json({ error: "Failed to convert to PDF" }, { status: 500 })
  }
}


