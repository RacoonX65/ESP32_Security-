"use client"

import { ref, onValue, off, set, get } from "firebase/database"
import { database } from "@/lib/supabase/client"

export interface MotionEvent {
  id: string
  message: string
  timestamp: string
  type: 'motion_detected' | 'motion_cleared'
  created_at: string
}

export interface SystemStatus {
  isOnline: boolean
  lastHeartbeat: string
  motionDetected: boolean
  systemArmed: boolean
  esp32IP?: string
}

class FirebaseService {
  private alarmRef = ref(database, 'alarm')
  private systemRef = ref(database, 'system')
  private motionEvents: MotionEvent[] = []
  private listeners: ((events: MotionEvent[]) => void)[] = []
  private statusListeners: ((status: SystemStatus) => void)[] = []
  private currentStatus: SystemStatus = {
    isOnline: false,
    lastHeartbeat: '',
    motionDetected: false,
    systemArmed: true
  }

  constructor() {
    this.initializeListeners()
  }

  private initializeListeners() {
    // Listen for alarm messages from ESP32
    onValue(this.alarmRef, (snapshot) => {
      const message = snapshot.val()
      if (message && typeof message === 'string') {
        this.processAlarmMessage(message)
      }
    })

    // Listen for system status updates
    onValue(this.systemRef, (snapshot) => {
      const systemData = snapshot.val()
      if (systemData) {
        this.updateSystemStatus(systemData)
      }
    })
  }

  private async processAlarmMessage(message: string) {
    const now = new Date()
    const timestamp = now.toISOString()
    
    // Parse the message to determine type
    const isMotionDetected = message.includes('🚨 Motion detected')
    const isMotionCleared = message.includes('✅ Motion cleared')
    
    if (isMotionDetected || isMotionCleared) {
      const event: MotionEvent = {
        id: `${now.getTime()}`,
        message,
        timestamp,
        type: isMotionDetected ? 'motion_detected' : 'motion_cleared',
        created_at: timestamp
      }

      // Add to events array (keep last 50 events)
      this.motionEvents.unshift(event)
      if (this.motionEvents.length > 50) {
        this.motionEvents = this.motionEvents.slice(0, 50)
      }

      // Update system status
      this.currentStatus.motionDetected = isMotionDetected
      this.currentStatus.lastHeartbeat = timestamp
      this.currentStatus.isOnline = true

      // Send notification for motion detection (only if system is armed)
      if (isMotionDetected && this.currentStatus.systemArmed) {
        this.sendNotification({
          type: 'motion_detected',
          message: `🚨 Security Alert: ${message}`,
          priority: 'high',
          timestamp
        })
      }

      // Notify listeners
      this.notifyEventListeners()
      this.notifyStatusListeners()
    }
  }

  private async sendNotification(notification: {
    type: string
    message: string
    priority: string
    timestamp: string
  }) {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification)
      })
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  private updateSystemStatus(systemData: any) {
    this.currentStatus = {
      ...this.currentStatus,
      ...systemData,
      lastHeartbeat: new Date().toISOString()
    }
    this.notifyStatusListeners()
  }

  private notifyEventListeners() {
    this.listeners.forEach(listener => listener([...this.motionEvents]))
  }

  private notifyStatusListeners() {
    this.statusListeners.forEach(listener => listener({...this.currentStatus}))
  }

  // Public methods
  subscribeToMotionEvents(callback: (events: MotionEvent[]) => void) {
    this.listeners.push(callback)
    // Immediately call with current events
    callback([...this.motionEvents])
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  subscribeToSystemStatus(callback: (status: SystemStatus) => void) {
    this.statusListeners.push(callback)
    // Immediately call with current status
    callback({...this.currentStatus})
    
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== callback)
    }
  }

  async armSystem() {
    try {
      const response = await fetch('/api/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'arm' })
      })
      
      if (!response.ok) {
        throw new Error('Failed to arm system')
      }
      
      // The Firebase listener will update the status automatically
      console.log('System armed successfully')
    } catch (error) {
      console.error('Error arming system:', error)
      throw error
    }
  }

  async disarmSystem() {
    try {
      const response = await fetch('/api/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'disarm' })
      })
      
      if (!response.ok) {
        throw new Error('Failed to disarm system')
      }
      
      // The Firebase listener will update the status automatically
      console.log('System disarmed successfully')
    } catch (error) {
      console.error('Error disarming system:', error)
      throw error
    }
  }

  async getSystemStatus(): Promise<SystemStatus> {
    try {
      const snapshot = await get(this.systemRef)
      const systemData = snapshot.val()
      return {
        ...this.currentStatus,
        ...systemData
      }
    } catch (error) {
      console.error('Error getting system status:', error)
      return this.currentStatus
    }
  }

  getMotionEvents(): MotionEvent[] {
    return [...this.motionEvents]
  }

  getCurrentStatus(): SystemStatus {
    return {...this.currentStatus}
  }

  // Check if system is online (last heartbeat within 2 minutes)
  isSystemOnline(): boolean {
    if (!this.currentStatus.lastHeartbeat) return false
    
    const lastHeartbeat = new Date(this.currentStatus.lastHeartbeat)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastHeartbeat.getTime()) / (1000 * 60)
    
    return diffMinutes < 2
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService()