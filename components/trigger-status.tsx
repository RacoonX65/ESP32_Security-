"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from "lucide-react"
import { ref, onValue, off } from "firebase/database"
import { database } from "@/lib/supabase/client"

interface TriggerEvent {
  id: string
  timestamp: string
  type: 'motion_start' | 'motion_end'
  duration?: number // in seconds
  sensor_location: string
  status: 'active' | 'resolved'
}

interface TriggerStats {
  totalTriggers: number
  todayTriggers: number
  averageDuration: number
  longestDuration: number
  currentStatus: 'active' | 'idle'
  lastTriggerTime?: string
}

export function TriggerStatus() {
  const [triggers, setTriggers] = useState<TriggerEvent[]>([])
  const [stats, setStats] = useState<TriggerStats>({
    totalTriggers: 0,
    todayTriggers: 0,
    averageDuration: 0,
    longestDuration: 0,
    currentStatus: 'idle'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [currentMotionStart, setCurrentMotionStart] = useState<string | null>(null)

  useEffect(() => {
    const motionRef = ref(database, 'motion_detected')
    
    const unsubscribe = onValue(motionRef, (snapshot) => {
      const motionDetected = snapshot.val()
      const currentTime = new Date().toISOString()
      
      if (typeof motionDetected === 'boolean') {
        if (motionDetected && !currentMotionStart) {
          // Motion started
          setCurrentMotionStart(currentTime)
          const newTrigger: TriggerEvent = {
            id: `trigger_${Date.now()}`,
            timestamp: currentTime,
            type: 'motion_start',
            sensor_location: 'ESP32-CAM Area',
            status: 'active'
          }
          
          setTriggers(prev => [newTrigger, ...prev])
          updateStats(prev => ({
            ...prev,
            currentStatus: 'active',
            lastTriggerTime: currentTime
          }))
          
        } else if (!motionDetected && currentMotionStart) {
          // Motion ended
          const duration = Math.round((new Date(currentTime).getTime() - new Date(currentMotionStart).getTime()) / 1000)
          
          const endTrigger: TriggerEvent = {
            id: `trigger_end_${Date.now()}`,
            timestamp: currentTime,
            type: 'motion_end',
            duration,
            sensor_location: 'ESP32-CAM Area',
            status: 'resolved'
          }
          
          setTriggers(prev => {
            const updated = [endTrigger, ...prev]
            // Update the corresponding start trigger with duration
            const startIndex = updated.findIndex(t => t.type === 'motion_start' && t.status === 'active')
            if (startIndex !== -1) {
              updated[startIndex] = { ...updated[startIndex], duration, status: 'resolved' }
            }
            return updated
          })
          
          setCurrentMotionStart(null)
          updateStats(prev => ({
            ...prev,
            currentStatus: 'idle'
          }))
        }
      }
      
      setIsLoading(false)
    })

    return () => off(motionRef, 'value', unsubscribe)
  }, [currentMotionStart])

  const updateStats = (updateFn: (prev: TriggerStats) => TriggerStats) => {
    setStats(updateFn)
  }

  // Calculate statistics
  useEffect(() => {
    const today = new Date().toDateString()
    const todayTriggers = triggers.filter(t => 
      new Date(t.timestamp).toDateString() === today && t.type === 'motion_start'
    ).length
    
    const motionStartTriggers = triggers.filter(t => t.type === 'motion_start')
    const triggersWithDuration = triggers.filter(t => t.duration !== undefined)
    
    const totalDuration = triggersWithDuration.reduce((sum, t) => sum + (t.duration || 0), 0)
    const averageDuration = triggersWithDuration.length > 0 ? totalDuration / triggersWithDuration.length : 0
    const longestDuration = Math.max(...triggersWithDuration.map(t => t.duration || 0), 0)
    
    setStats(prev => ({
      ...prev,
      totalTriggers: motionStartTriggers.length,
      todayTriggers,
      averageDuration,
      longestDuration
    }))
  }, [triggers])

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-spin" />
            Loading Trigger Status...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Trigger Status & History
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${stats.currentStatus === 'active' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
            {stats.currentStatus === 'active' ? 'Motion Active' : 'System Idle'}
          </div>
          {stats.lastTriggerTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last: {formatTime(stats.lastTriggerTime)}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalTriggers}</div>
                <div className="text-xs text-muted-foreground">Total Triggers</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.todayTriggers}</div>
                <div className="text-xs text-muted-foreground">Today</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{formatDuration(Math.round(stats.averageDuration))}</div>
                <div className="text-xs text-muted-foreground">Avg Duration</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{formatDuration(stats.longestDuration)}</div>
                <div className="text-xs text-muted-foreground">Longest</div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <ScrollArea className="h-[300px]">
              {triggers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No trigger events recorded yet</p>
                  <p className="text-xs">Motion detection events will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {triggers.map((trigger) => (
                    <div key={trigger.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {trigger.type === 'motion_start' ? (
                          <AlertTriangle className={`h-4 w-4 ${trigger.status === 'active' ? 'text-red-500' : 'text-orange-500'}`} />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <div>
                          <div className="font-medium text-sm">
                            {trigger.type === 'motion_start' ? 'Motion Started' : 'Motion Ended'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(trigger.timestamp)} at {formatTime(trigger.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={trigger.status === 'active' ? 'destructive' : 'secondary'}>
                          {trigger.status}
                        </Badge>
                        {trigger.duration && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDuration(trigger.duration)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Analytics Dashboard</p>
              <p className="text-xs">Detailed analytics coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}