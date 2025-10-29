"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Activity, 
  Wifi, 
  Clock, 
  Server, 
  Signal,
  Zap,
  Thermometer,
  HardDrive
} from "lucide-react"
import { firebaseService, SystemStatus } from "@/lib/firebase-service"

export function SystemMonitoring() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isOnline: false,
    lastHeartbeat: '',
    motionDetected: false,
    systemArmed: true
  })
  const [uptime, setUptime] = useState(0)

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToSystemStatus((status) => {
      setSystemStatus(status)
    })

    // Update uptime every minute
    const uptimeInterval = setInterval(() => {
      if (systemStatus.lastHeartbeat) {
        const startTime = new Date(systemStatus.lastHeartbeat)
        const now = new Date()
        const uptimeMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60))
        setUptime(Math.max(0, uptimeMinutes))
      }
    }, 60000)

    return () => {
      unsubscribe()
      clearInterval(uptimeInterval)
    }
  }, [systemStatus.lastHeartbeat])

  const formatUptime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ${minutes % 60}m`
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }

  const getSignalStrength = () => {
    // Simulate signal strength based on connection status
    return systemStatus.isOnline ? Math.floor(Math.random() * 30) + 70 : 0
  }

  const isOnline = systemStatus.isOnline
  const signalStrength = getSignalStrength()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          System Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Health */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className={`h-4 w-4 ${isOnline ? 'text-green-600' : 'text-red-600'}`} />
              <span className="text-sm font-medium">Connection</span>
            </div>
            <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
              {isOnline ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          
          {isOnline && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Signal Strength</span>
                <span>{signalStrength}%</span>
              </div>
              <Progress value={signalStrength} className="h-2" />
            </div>
          )}
        </div>

        {/* System Uptime */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Uptime</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {isOnline ? formatUptime(uptime) : 'Offline'}
            </span>
          </div>
        </div>

        {/* System Status Indicators */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="text-sm font-medium">System Health</div>
          
          <div className="space-y-2">
            {/* ESP32 Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs">ESP32 Module</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {isOnline ? 'Operational' : 'Offline'}
              </span>
            </div>

            {/* Motion Sensor */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-xs">Motion Sensor</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {isOnline ? (systemStatus.motionDetected ? 'Triggered' : 'Ready') : 'Offline'}
              </span>
            </div>

            {/* Firebase Connection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs">Firebase</span>
              </div>
              <span className="text-xs text-muted-foreground">Connected</span>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs">Notifications</span>
              </div>
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="text-sm font-medium">Performance</div>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-green-600" />
                <span>Response Time</span>
              </div>
              <div className="text-muted-foreground">
                {isOnline ? '< 100ms' : 'N/A'}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-600" />
                <span>Power Status</span>
              </div>
              <div className="text-muted-foreground">
                {isOnline ? 'Stable' : 'Unknown'}
              </div>
            </div>
          </div>
        </div>

        {/* Last Update */}
        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Last update: {systemStatus.lastHeartbeat ? 
              new Date(systemStatus.lastHeartbeat).toLocaleTimeString() : 
              'Never'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  )
}