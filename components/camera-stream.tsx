"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Video, WifiOff, Settings } from "lucide-react"
import { ref, onValue, off } from "firebase/database"
import { database } from "@/lib/supabase/client"

export function CameraStream() {
  const [cameraUrl, setCameraUrl] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [tempUrl, setTempUrl] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Listen for live URL updates from Firebase
  useEffect(() => {
    const liveUrlRef = ref(database, 'camera/live_url')
    
    const unsubscribe = onValue(liveUrlRef, (snapshot) => {
      const url = snapshot.val()
      if (url && typeof url === 'string') {
        setCameraUrl(url)
        setTempUrl(url)
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    }, (error) => {
      console.error('Firebase error:', error)
      setIsLoading(false)
    })

    return () => off(liveUrlRef, 'value', unsubscribe)
  }, [])

  const handleUpdateUrl = () => {
    setCameraUrl(tempUrl)
    setShowSettings(false)
    setIsConnected(false)
  }

  const handleImageLoad = () => {
    setIsConnected(true)
  }

  const handleImageError = () => {
    setIsConnected(false)
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Live Camera Feed
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "destructive"} className="gap-1">
              {isConnected ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Disconnected
                </>
              )}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSettings && (
          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="camera-url">ESP32-CAM Stream URL</Label>
              <Input
                id="camera-url"
                type="text"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="http://192.168.1.100:81/stream"
              />
              <p className="text-xs text-muted-foreground">Enter your ESP32-CAM IP address and stream endpoint</p>
            </div>
            <Button onClick={handleUpdateUrl} size="sm">
              Update Stream URL
            </Button>
          </div>
        )}

        <div className="relative aspect-video rounded-lg bg-muted overflow-hidden border border-border">
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <div className="text-center">
                <p className="font-medium">Connecting to ESP32-CAM</p>
                <p className="text-sm">Fetching live stream URL...</p>
              </div>
            </div>
          ) : !cameraUrl ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
              <WifiOff className="h-12 w-12" />
              <div className="text-center">
                <p className="font-medium">ESP32-CAM Not Available</p>
                <p className="text-sm">Waiting for camera to come online...</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                Manual Configuration
              </Button>
            </div>
          ) : !isConnected && !showSettings ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
              <WifiOff className="h-12 w-12" />
              <div className="text-center">
                <p className="font-medium">Camera Disconnected</p>
                <p className="text-sm">Check your ESP32-CAM connection</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                Configure Stream URL
              </Button>
            </div>
          ) : null}
          {cameraUrl && (
            <img
              src={cameraUrl}
              alt="ESP32-CAM Live Stream"
              className={`h-full w-full object-cover ${!isConnected ? "hidden" : ""}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Stream: {cameraUrl || "Waiting for ESP32-CAM..."}</span>
          <span>{cameraUrl ? "MJPEG Format" : "Firebase Connected"}</span>
        </div>
      </CardContent>
    </Card>
  )
}
