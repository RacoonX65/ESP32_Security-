import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// POST endpoint for ESP32 to send motion events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sensor_location } = body

    if (!sensor_location) {
      return NextResponse.json({ error: "sensor_location is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("motion_events")
      .insert({
        sensor_location,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error inserting motion event:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error processing motion event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET endpoint to fetch recent motion events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("motion_events")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[v0] Error fetching motion events:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ events: data || [] }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching motion events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
