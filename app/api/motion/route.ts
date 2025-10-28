import { database } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { ref, push, get, query, orderByChild, limitToLast } from "firebase/database"

// POST endpoint for ESP32 to send motion events (optional - ESP32 now sends directly to Firebase)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sensor_location } = body

    if (!sensor_location) {
      return NextResponse.json({ error: "sensor_location is required" }, { status: 400 })
    }

    const motionEventsRef = ref(database, 'motion_events')
    const newEvent = {
      sensor_location,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      motion_detected: true
    }

    const result = await push(motionEventsRef, newEvent)

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: result.key, 
        ...newEvent 
      } 
    }, { status: 201 })
  } catch (error) {
    console.error("[Firebase] Error inserting motion event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET endpoint to fetch recent motion events from Firebase
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const motionEventsRef = ref(database, 'motion_events')
    const eventsQuery = query(
      motionEventsRef,
      orderByChild('timestamp'),
      limitToLast(limit)
    )

    const snapshot = await get(eventsQuery)
    const events: any[] = []

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        events.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        })
      })
    }

    // Reverse to get most recent first
    events.reverse()

    return NextResponse.json({ events }, { status: 200 })
  } catch (error) {
    console.error("[Firebase] Error fetching motion events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
