"use client"

import { useEffect, useState, useCallback } from 'react'

interface NotificationOptions {
  enableBrowserNotifications: boolean
  enableSoundAlerts: boolean
  soundVolume: number
  soundType: 'beep' | 'chime' | 'alert' | 'none'
  autoCloseDuration: number
  // Legacy property names for backward compatibility
  browserNotifications: boolean
  soundAlerts: boolean
  volume: number
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [settings, setSettings] = useState<NotificationOptions>({
    enableBrowserNotifications: true,
    enableSoundAlerts: true,
    soundVolume: 0.5,
    soundType: 'beep',
    autoCloseDuration: 5000,
    // Legacy property names for backward compatibility
    browserNotifications: true,
    soundAlerts: true,
    volume: 0.5
  })

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
      
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((result) => {
          setPermission(result)
        })
      }
    }
  }, [])

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('esp32-security-notifications')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Failed to parse notification settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage
  const updateSettings = useCallback((newSettings: Partial<NotificationOptions>) => {
    const updatedSettings = { ...settings, ...newSettings }
    
    // Sync legacy property names with main properties
    if ('browserNotifications' in newSettings) {
      updatedSettings.enableBrowserNotifications = newSettings.browserNotifications!
    }
    if ('soundAlerts' in newSettings) {
      updatedSettings.enableSoundAlerts = newSettings.soundAlerts!
    }
    if ('volume' in newSettings) {
      updatedSettings.soundVolume = newSettings.volume!
    }
    
    // Sync main properties with legacy names
    if ('enableBrowserNotifications' in newSettings) {
      updatedSettings.browserNotifications = newSettings.enableBrowserNotifications!
    }
    if ('enableSoundAlerts' in newSettings) {
      updatedSettings.soundAlerts = newSettings.enableSoundAlerts!
    }
    if ('soundVolume' in newSettings) {
      updatedSettings.volume = newSettings.soundVolume!
    }
    
    setSettings(updatedSettings)
    localStorage.setItem('esp32-security-notifications', JSON.stringify(updatedSettings))
  }, [settings])

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!settings.enableSoundAlerts || settings.soundType === 'none') return

    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Create a simple beep sound
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Different sound patterns based on type
      switch (settings.soundType) {
        case 'chime':
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime) // C5
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1) // E5
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2) // G5
          break
        case 'alert':
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1)
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2)
          break
        default: // beep
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
      }
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(settings.soundVolume, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.error('Failed to play notification sound:', error)
    }
  }, [settings.enableSoundAlerts, settings.soundVolume, settings.soundType])

  // Send browser notification
  const sendNotification = useCallback((title: string, body: string, icon?: string) => {
    if (!settings.enableBrowserNotifications || permission !== 'granted') return

    try {
      const notification = new Notification(title, {
        body,
        icon: icon || '/placeholder-logo.svg',
        badge: '/placeholder-logo.svg',
        tag: 'motion-detection',
        requireInteraction: true
      })

      // Auto-close notification after configured duration
      setTimeout(() => {
        notification.close()
      }, settings.autoCloseDuration)

      // Handle notification click
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }, [settings.enableBrowserNotifications, permission, settings.autoCloseDuration])

  // Main notification function for motion detection
  const notifyMotionDetected = useCallback((sensorLocation: string = 'ESP32-CAM Area') => {
    const timestamp = new Date().toLocaleTimeString()
    
    // Send browser notification
    sendNotification(
      '🚨 Motion Detected!',
      `Motion detected at ${sensorLocation} at ${timestamp}`,
      '/placeholder-logo.svg'
    )

    // Play sound alert
    playNotificationSound()
  }, [sendNotification, playNotificationSound])

  // Request permission manually
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && permission !== 'granted') {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    }
    return permission
  }, [permission])

  return {
    permission,
    settings,
    updateSettings,
    notifyMotionDetected,
    requestPermission,
    playNotificationSound,
    sendNotification
  }
}