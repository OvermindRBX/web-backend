import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/kv"
import { authenticate, unauthorized } from "@/lib/auth/middleware"

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (!auth) {
      return unauthorized()
    }

    const categories = await db.getUserCategories(auth.userId)
    return NextResponse.json({ categories })
  } catch (err) {
    console.error("[API] GET /api/categories error:", err)
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
    const { name, icon } = body

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const existingcategories = await db.getUserCategories(auth.userId)
    const maxorder = existingcategories.reduce((max, c) => Math.max(max, c.order), -1)

    const category = {
      id: crypto.randomUUID(),
      userId: auth.userId,
      name: name.trim(),
      icon: icon || "Folder",
      order: maxorder + 1,
      createdAt: Date.now(),
    }

    await db.createCategory(category)
    return NextResponse.json({ category })
  } catch (err) {
    console.error("[API] POST /api/categories error:", err)
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
    const { id, name, icon, order } = body

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
    }

    const category = await db.getCategory(id)
    if (!category || category.userId !== auth.userId) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const updates: { name?: string; icon?: string; order?: number } = {}
    if (typeof name === "string") updates.name = name.trim()
    if (typeof icon === "string") updates.icon = icon
    if (typeof order === "number") updates.order = order

    await db.updateCategory(id, updates)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[API] PATCH /api/categories error:", err)
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
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
    }

    const category = await db.getCategory(id)
    if (!category || category.userId !== auth.userId) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    await db.deleteCategory(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[API] DELETE /api/categories error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
