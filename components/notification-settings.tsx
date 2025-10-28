"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Settings, 
  TestTube,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"

export function NotificationSettings() {
  const { 
    permission, 
    settings, 
    updateSettings, 
    requestPermission,
    notifyMotionDetected 
  } = useNotifications()
  
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  const handleTestNotification = async () => {
    try {
      await notifyMotionDetected("Test Location")
      setTestResult('success')
      setTimeout(() => setTestResult(null), 3000)
    } catch (error) {
      setTestResult('error')
      setTimeout(() => setTestResult(null), 3000)
    }
  }

  const soundOptions = [
    { value: 'beep', label: 'Beep' },
    { value: 'chime', label: 'Chime' },
    { value: 'alert', label: 'Alert' },
    { value: 'none', label: 'No Sound' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={permission === 'granted' ? 'default' : permission === 'denied' ? 'destructive' : 'secondary'}>
            {permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked' : 'Not Set'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Permission Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Browser Notifications</Label>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {permission === 'granted' 
                  ? 'Notifications are enabled and working'
                  : permission === 'denied'
                  ? 'Notifications are blocked by your browser'
                  : 'Click to enable browser notifications'
                }
              </p>
            </div>
            <Button
              variant={permission === 'granted' ? 'secondary' : 'default'}
              size="sm"
              onClick={requestPermission}
              disabled={permission === 'granted'}
              className="gap-2"
            >
              <Bell className="h-4 w-4" />
              {permission === 'granted' ? 'Enabled' : 'Enable'}
            </Button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Notification Preferences</Label>
          
          {/* Browser Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="browser-notifications" className="text-sm">Browser Notifications</Label>
              <p className="text-xs text-muted-foreground">Show desktop notifications for motion alerts</p>
            </div>
            <Switch
              id="browser-notifications"
              checked={settings.browserNotifications}
              onCheckedChange={(checked) => updateSettings({ browserNotifications: checked })}
              disabled={permission !== 'granted'}
            />
          </div>

          {/* Sound Alerts Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="sound-alerts" className="text-sm">Sound Alerts</Label>
              <p className="text-xs text-muted-foreground">Play sound when motion is detected</p>
            </div>
            <Switch
              id="sound-alerts"
              checked={settings.soundAlerts}
              onCheckedChange={(checked) => updateSettings({ soundAlerts: checked })}
            />
          </div>

          {/* Sound Type Selection */}
          {settings.soundAlerts && (
            <div className="space-y-2">
              <Label className="text-sm">Sound Type</Label>
              <Select
                value={settings.soundType}
                onValueChange={(value) => updateSettings({ soundType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {soundOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Volume Control */}
          {settings.soundAlerts && settings.soundType !== 'none' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Volume</Label>
                <span className="text-xs text-muted-foreground">{Math.round(settings.volume * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <VolumeX className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[settings.volume]}
                  onValueChange={([value]) => updateSettings({ volume: value })}
                  max={1}
                  min={0}
                  step={0.1}
                  className="flex-1"
                />
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}

          {/* Auto Close Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Auto-close Duration</Label>
              <span className="text-xs text-muted-foreground">{settings.autoCloseDuration / 1000}s</span>
            </div>
            <Slider
              value={[settings.autoCloseDuration]}
              onValueChange={([value]) => updateSettings({ autoCloseDuration: value })}
              max={10000}
              min={3000}
              step={1000}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              How long notifications stay visible before auto-closing
            </p>
          </div>
        </div>

        {/* Test Section */}
        <div className="space-y-3 pt-4 border-t">
          <Label className="text-sm font-medium">Test Notifications</Label>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Send a test notification to verify your settings
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNotification}
              disabled={permission !== 'granted'}
              className="gap-2"
            >
              <TestTube className="h-4 w-4" />
              Test
            </Button>
          </div>
          
          {testResult && (
            <div className={`flex items-center gap-2 text-sm ${testResult === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {testResult === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Test notification sent successfully!
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Failed to send test notification
                </>
              )}
            </div>
          )}
        </div>

        {/* Help Section */}
        {permission === 'denied' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Notifications Blocked</p>
                <p className="text-yellow-700 mt-1">
                  To enable notifications, click the lock icon in your browser's address bar and allow notifications for this site.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}