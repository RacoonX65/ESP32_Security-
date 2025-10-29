import { database } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { ref, set, get, query, orderByChild, limitToLast } from "firebase/database"

// POST endpoint for ESP32 to send alarm data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, type, sensor_location, esp32_ip } = body

    // Validate required fields
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 })
    }

    // Update alarm data in Firebase (this will trigger the client-side listeners)
    const alarmRef = ref(database, 'alarm')
    await set(alarmRef, message)

    // Update system status with heartbeat and ESP32 info
    const systemRef = ref(database, 'system')
    const systemUpdate = {
      lastHeartbeat: new Date().toISOString(),
      isOnline: true,
      ...(esp32_ip && { esp32IP: esp32_ip }),
      ...(sensor_location && { sensor_location })
    }
    
    await set(systemRef, systemUpdate)

    console.log(`[API] Received alarm from ESP32: ${message}`)

    return NextResponse.json({ 
      success: true, 
      message: "Alarm data received and processed",
      timestamp: new Date().toISOString()
    }, { status: 200 })
  } catch (error) {
    console.error("[API] Error processing ESP32 alarm data:", error)
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
