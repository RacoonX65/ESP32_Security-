"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, MapPin, Clock, Bell, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ref, onValue, off } from "firebase/database"
import { database } from "@/lib/supabase/client"
import { useNotifications } from "@/hooks/use-notifications"

interface MotionEvent {
  id: string
  timestamp: string
  sensor_location: string
  created_at: string
  motion_detected: boolean
}

export function MotionEvents() {
  const [events, setEvents] = useState<MotionEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentMotionStatus, setCurrentMotionStatus] = useState(false)
  const [lastMotionTime, setLastMotionTime] = useState<string | null>(null)
  
  const { 
    permission, 
    settings, 
    notifyMotionDetected, 
    requestPermission 
  } = useNotifications()

  // Listen for motion detection updates from Firebase
  useEffect(() => {
    const motionRef = ref(database, 'camera/motion_detected')
    
    const unsubscribe = onValue(motionRef, (snapshot) => {
      const motionDetected = snapshot.val()
      setIsLoading(false)
      
      if (typeof motionDetected === 'boolean') {
        const previousStatus = currentMotionStatus
        setCurrentMotionStatus(motionDetected)
        
        // Create a new event when motion is detected (transition from false to true)
        if (motionDetected && !previousStatus) {
          const currentTime = new Date().toISOString()
          setLastMotionTime(currentTime)
          
          const newEvent: MotionEvent = {
            id: Date.now().toString(),
            timestamp: currentTime,
            sensor_location: "ESP32-CAM Area",
            created_at: currentTime,
            motion_detected: true
          }
          
          setEvents(prevEvents => [newEvent, ...prevEvents.slice(0, 49)]) // Keep last 50 events
          
          // Trigger notification
          notifyMotionDetected("ESP32-CAM Area")
        }
      }
    }, (error) => {
      console.error('Firebase motion detection error:', error)
      setError('Failed to connect to motion detection')
      setIsLoading(false)
    })

    return () => off(motionRef, 'value', unsubscribe)
  }, [currentMotionStatus])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Motion Events
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={currentMotionStatus ? "destructive" : "secondary"} className="gap-1">
              {currentMotionStatus ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  Motion Detected
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  No Motion
                </>
              )}
            </Badge>
            {events.length > 0 && <Badge variant="outline">{events.length}</Badge>}
            
            {/* Notification Status & Control */}
            <Button
              variant="outline"
              size="sm"
              onClick={requestPermission}
              className="gap-1"
              disabled={permission === 'granted'}
            >
              {permission === 'granted' ? (
                <>
                  <Bell className="h-3 w-3 text-green-500" />
                  <span className="text-xs">Alerts On</span>
                </>
              ) : permission === 'denied' ? (
                <>
                  <BellOff className="h-3 w-3 text-red-500" />
                  <span className="text-xs">Blocked</span>
                </>
              ) : (
                <>
                  <Bell className="h-3 w-3" />
                  <span className="text-xs">Enable</span>
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Last Motion Time Display */}
        {lastMotionTime && (
          <div className="text-xs text-muted-foreground mt-2">
            Last motion: {formatTime(lastMotionTime)}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-muted-foreground text-sm">Connecting to motion sensor...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-destructive text-sm font-medium">Connection Error</p>
              <p className="text-muted-foreground text-xs mt-1">{error}</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">No motion events yet</p>
              <p className="text-muted-foreground text-xs mt-1">Monitoring for motion detection...</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <div className="mt-0.5 rounded-full bg-accent/20 p-1.5">
                        <Activity className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium">{event.sensor_location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(event.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Motion
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
