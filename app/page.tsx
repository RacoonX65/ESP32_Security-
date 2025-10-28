import { Badge } from "@/components/ui/badge"
import { Activity, Shield } from "lucide-react"
import { CameraStream } from "@/components/camera-stream"
import { MotionEvents } from "@/components/motion-events"
import { TriggerStatus } from "@/components/trigger-status"
import { NotificationSettings } from "@/components/notification-settings"

export default function SecurityDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">ESP32 Security System</h1>
                <p className="text-sm text-muted-foreground">Real-time monitoring dashboard</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-2">
              <Activity className="h-3 w-3 animate-pulse text-accent" />
              System Active
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Camera feed section */}
          <CameraStream />

          {/* Motion events display with real-time updates */}
          <MotionEvents />
          
          {/* Trigger status and history tracking */}
          <TriggerStatus />
        </div>
        
        {/* Notification settings panel */}
        <div className="mt-6">
          <NotificationSettings />
        </div>
      </main>
    </div>
  )
}
