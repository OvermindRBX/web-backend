import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/kv"
import { authenticate, unauthorized } from "@/lib/auth/middleware"

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (!auth) {
      return unauthorized()
    }

    const memories = await db.getUserMemories(auth.userId)
    return NextResponse.json({ memories })
  } catch (err) {
    console.error("[API] GET /api/memories error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (!auth) {
      return unauthorized()
    }

    const body = await req.json()
    const { content, source } = body

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const memory = {
      id: crypto.randomUUID(),
      userId: auth.userId,
      content: content.trim(),
      source: source || "user_added",
      enabled: true,
      createdAt: Date.now(),
    }

    await db.createMemory(memory)
    return NextResponse.json({ memory })
  } catch (err) {
    console.error("[API] POST /api/memories error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (!auth) {
      return unauthorized()
    }

    const body = await req.json()
    const { id, enabled, content } = body

    if (!id) {
      return NextResponse.json({ error: "Memory ID is required" }, { status: 400 })
    }

    const memory = await db.getMemory(id)
    if (!memory || memory.userId !== auth.userId) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 })
    }

    const updates: { enabled?: boolean; content?: string } = {}
    if (typeof enabled === "boolean") updates.enabled = enabled
    if (typeof content === "string") updates.content = content.trim()

    await db.updateMemory(id, updates)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[API] PATCH /api/memories error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (!auth) {
      return unauthorized()
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Memory ID is required" }, { status: 400 })
    }

    const memory = await db.getMemory(id)
    if (!memory || memory.userId !== auth.userId) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 })
    }

    await db.deleteMemory(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[API] DELETE /api/memories error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
