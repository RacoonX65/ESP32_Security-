import { database } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { ref, set, get } from "firebase/database"

// POST endpoint to control system (arm/disarm)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, armed } = body

    if (!action || (action !== 'arm' && action !== 'disarm')) {
      return NextResponse.json({ 
        error: "Invalid action. Use 'arm' or 'disarm'" 
      }, { status: 400 })
    }

    // Update system armed status
    const systemRef = ref(database, 'system')
    const currentSystem = await get(systemRef)
    const currentData = currentSystem.val() || {}

    const systemUpdate = {
      ...currentData,
      systemArmed: action === 'arm',
      lastUpdate: new Date().toISOString(),
      lastAction: action,
      actionTimestamp: new Date().toISOString()
    }

    await set(systemRef, systemUpdate)

    console.log(`[API] System ${action}ed successfully`)

    return NextResponse.json({ 
      success: true, 
      message: `System ${action}ed successfully`,
      systemArmed: action === 'arm',
      timestamp: new Date().toISOString()
    }, { status: 200 })
  } catch (error) {
    console.error("[API] Error updating system status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET endpoint to fetch current system status
export async function GET() {
  try {
    const systemRef = ref(database, 'system')
    const snapshot = await get(systemRef)
    const systemData = snapshot.val()

    if (!systemData) {
      return NextResponse.json({ 
        error: "No system data found" 
      }, { status: 404 })
    }

    // Check if system is online (heartbeat within last 2 minutes)
    const lastHeartbeat = new Date(systemData.lastHeartbeat || 0)
    const now = new Date()
    const isOnline = (now.getTime() - lastHeartbeat.getTime()) < 120000 // 2 minutes

    const status = {
      isOnline,
      lastHeartbeat: systemData.lastHeartbeat,
      systemArmed: systemData.systemArmed || false,
      motionDetected: systemData.motionDetected || false,
      esp32IP: systemData.esp32IP,
      sensor_location: systemData.sensor_location,
      lastAction: systemData.lastAction,
      actionTimestamp: systemData.actionTimestamp
    }

    return NextResponse.json({ status }, { status: 200 })
  } catch (error) {
    console.error("[API] Error fetching system status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}