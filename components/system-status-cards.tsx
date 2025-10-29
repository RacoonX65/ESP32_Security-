"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Activity, 
  Wifi, 
  WifiOff, 
  Eye, 
  EyeOff, 
  Clock,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { firebaseService, SystemStatus } from "@/lib/firebase-service"

export function SystemStatusCards() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isOnline: false,
    lastHeartbeat: '',
    motionDetected: false,
    systemArmed: true
  })
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    const unsubscribe = firebaseService.subscribeToSystemStatus((status) => {
      setSystemStatus(status)
    })

    return unsubscribe
  }, [])

  const formatLastSeen = (timestamp: string) => {
    if (!timestamp) return 'Never'
    
    const lastSeen = new Date(timestamp)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  // Use default values for server-side rendering to prevent hydration mismatch
  const isOnline = isHydrated ? systemStatus.isOnline : false
  const displayStatus = isHydrated ? systemStatus : {
    isOnline: false,
    lastHeartbeat: '',
    motionDetected: false,
    systemArmed: true
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* System Armed Status */}
      <Card className={`${displayStatus.systemArmed ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Status</CardTitle>
          <Shield className={`h-4 w-4 ${displayStatus.systemArmed ? 'text-green-600' : 'text-orange-600'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {displayStatus.systemArmed ? 'Armed' : 'Disarmed'}
          </div>
          <Badge 
            variant={displayStatus.systemArmed ? 'default' : 'secondary'}
            className={`mt-2 ${displayStatus.systemArmed ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100'}`}
          >
            {displayStatus.systemArmed ? (
              <>
                <Shield className="h-3 w-3 mr-1" />
                Protected
              </>
            ) : (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Monitoring Off
              </>
            )}
          </Badge>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card className={`${isOnline ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ESP32 Connection</CardTitle>
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isOnline ? 'Online' : 'Offline'}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <Clock className="h-3 w-3 inline mr-1" />
            Last seen: {formatLastSeen(displayStatus.lastHeartbeat)}
          </p>
        </CardContent>
      </Card>

      {/* Motion Detection Status */}
      <Card className={`${displayStatus.motionDetected ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Motion Status</CardTitle>
          {displayStatus.motionDetected ? (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-gray-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {displayStatus.motionDetected ? 'Detected' : 'Clear'}
          </div>
          <Badge 
            variant={displayStatus.motionDetected ? 'destructive' : 'secondary'}
            className="mt-2"
          >
            {displayStatus.motionDetected ? (
              <>
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                Motion Active
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                All Clear
              </>
            )}
          </Badge>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
          <Activity className={`h-4 w-4 ${isOnline ? 'text-green-600' : 'text-gray-400'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isOnline ? 'Healthy' : 'Degraded'}
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-xs text-muted-foreground">
              {isOnline ? 'All systems operational' : 'Connection issues detected'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}