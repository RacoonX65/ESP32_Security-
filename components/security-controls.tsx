"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  ShieldOff, 
  Settings, 
  Bell, 
  BellOff,
  Lock,
  Unlock,
  AlertTriangle
} from "lucide-react"
import { firebaseService, SystemStatus } from "@/lib/firebase-service"
import { useToast } from "@/hooks/use-toast"

export function SecurityControls() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isOnline: false,
    lastHeartbeat: '',
    motionDetected: false,
    systemArmed: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToSystemStatus((status) => {
      setSystemStatus(status)
    })

    return unsubscribe
  }, [])

  const handleArmSystem = async () => {
    setIsLoading(true)
    try {
      await firebaseService.armSystem()
      toast({
        title: "System Armed",
        description: "Security monitoring is now active",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to arm the system",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisarmSystem = async () => {
    setIsLoading(true)
    try {
      await firebaseService.disarmSystem()
      toast({
        title: "System Disarmed",
        description: "Security monitoring is now disabled",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disarm the system",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isOnline = systemStatus.isOnline

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Security Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Armed/Disarmed Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">System Status</Label>
              <p className="text-xs text-muted-foreground">
                {systemStatus.systemArmed ? 'Motion detection active' : 'Motion detection disabled'}
              </p>
            </div>
            <Badge 
              variant={systemStatus.systemArmed ? 'default' : 'secondary'}
              className={systemStatus.systemArmed ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}
            >
              {systemStatus.systemArmed ? 'Armed' : 'Disarmed'}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleArmSystem}
              disabled={isLoading || systemStatus.systemArmed || !isOnline}
              variant={systemStatus.systemArmed ? "secondary" : "default"}
              className="flex-1"
            >
              <Shield className="h-4 w-4 mr-2" />
              Arm System
            </Button>
            <Button
              onClick={handleDisarmSystem}
              disabled={isLoading || !systemStatus.systemArmed || !isOnline}
              variant={!systemStatus.systemArmed ? "secondary" : "outline"}
              className="flex-1"
            >
              <ShieldOff className="h-4 w-4 mr-2" />
              Disarm
            </Button>
          </div>

          {!isOnline && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-md">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800 dark:text-orange-200">
                ESP32 is offline. Controls are disabled.
              </span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Quick Actions</Label>
          
          <div className="space-y-3">
            {/* Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {notificationsEnabled ? (
                  <Bell className="h-4 w-4 text-blue-600" />
                ) : (
                  <BellOff className="h-4 w-4 text-gray-400" />
                )}
                <Label htmlFor="notifications" className="text-sm">
                  Push Notifications
                </Label>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            {/* Motion Status Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {systemStatus.motionDetected ? (
                  <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
                ) : (
                  <Lock className="h-4 w-4 text-green-600" />
                )}
                <Label className="text-sm">
                  Motion Detection
                </Label>
              </div>
              <Badge 
                variant={systemStatus.motionDetected ? "destructive" : "secondary"}
                className="text-xs"
              >
                {systemStatus.motionDetected ? 'Active' : 'Clear'}
              </Badge>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="pt-4 border-t border-border">
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Connection:</span>
              <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Mode:</span>
              <span>{systemStatus.systemArmed ? 'Security Active' : 'Monitoring Only'}</span>
            </div>
            {systemStatus.esp32IP && (
              <div className="flex justify-between">
                <span>ESP32 IP:</span>
                <span className="font-mono">{systemStatus.esp32IP}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}