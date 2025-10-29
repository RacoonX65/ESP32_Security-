"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, MapPin, Clock, Bell, BellOff, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { firebaseService, MotionEvent, SystemStatus } from "@/lib/firebase-service"
import { useNotifications } from "@/hooks/use-notifications"

export function MotionEvents() {
  const [events, setEvents] = useState<MotionEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isOnline: false,
    lastHeartbeat: '',
    motionDetected: false,
    systemArmed: true
  })
  
  const { 
    permission, 
    settings, 
    notifyMotionDetected, 
    requestPermission 
  } = useNotifications()

  // Listen for motion events and system status from Firebase service
  useEffect(() => {
    setIsLoading(true)
    
    const unsubscribeEvents = firebaseService.subscribeToMotionEvents((newEvents) => {
      setEvents(newEvents)
      setIsLoading(false)
      
      // Trigger notification for new motion detection events
      if (newEvents.length > 0 && newEvents[0].type === 'motion_detected') {
        notifyMotionDetected("ESP32-CAM Area")
      }
    })

    const unsubscribeStatus = firebaseService.subscribeToSystemStatus((status) => {
      setSystemStatus(status)
    })

    return () => {
      unsubscribeEvents()
      unsubscribeStatus()
    }
  }, [])

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
            <Badge variant={systemStatus.motionDetected ? "destructive" : "secondary"} className="gap-1">
              {systemStatus.motionDetected ? (
                <>
                  <AlertTriangle className="h-3 w-3 animate-pulse" />
                  Motion Active
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3" />
                  All Clear
                </>
              )}
            </Badge>
            {events.length > 0 && <Badge variant="outline">{events.length}</Badge>}
            
            {/* System Status Indicator */}
            <Badge variant={systemStatus.isOnline ? "default" : "destructive"} className="gap-1">
              <div className={`h-2 w-2 rounded-full ${systemStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              {systemStatus.isOnline ? 'Online' : 'Offline'}
            </Badge>
            
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
        
        {/* System Status Display */}
        {systemStatus.lastHeartbeat && (
          <div className="text-xs text-muted-foreground mt-2">
            Last update: {formatTime(systemStatus.lastHeartbeat)}
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
                      <div className={`mt-0.5 rounded-full p-1.5 ${
                        event.type === 'motion_detected' ? 'bg-red-100 text-red-600' : 
                        event.type === 'motion_cleared' ? 'bg-green-100 text-green-600' : 
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {event.type === 'motion_detected' ? (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        ) : event.type === 'motion_cleared' ? (
                          <CheckCircle className="h-3.5 w-3.5" />
                        ) : (
                          <Activity className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{event.message}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(event.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={event.type === 'motion_detected' ? "destructive" : 
                               event.type === 'motion_cleared' ? "default" : "outline"} 
                      className="text-xs"
                    >
                      {event.type === 'motion_detected' ? 'Alert' : 
                       event.type === 'motion_cleared' ? 'Clear' : 'Event'}
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
