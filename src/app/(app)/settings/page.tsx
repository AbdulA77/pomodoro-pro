'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Settings, Volume2, Bell, Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/providers/theme-provider'
import { useTimerStore } from '@/state/useTimerStore'
import { useSound } from '@/hooks/useSound'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { config, updateConfig } = useTimerStore()
  const { playBell } = useSound({ volume: 70, enabled: true })
  
  const [settings, setSettings] = useState({
    pomodoroMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    intervalsPerLong: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    strictFocusMode: false,
    alarmVolume: 70,
  })

  // Load settings from timer store
  useEffect(() => {
    setSettings({
      pomodoroMinutes: config.pomodoroMinutes,
      shortBreakMinutes: config.shortBreakMinutes,
      longBreakMinutes: config.longBreakMinutes,
      intervalsPerLong: config.intervalsPerLong,
      autoStartBreaks: config.autoStartBreaks,
      autoStartPomodoros: config.autoStartPomodoros,
      strictFocusMode: false, // Not in timer config yet
      alarmVolume: 70,
    })
  }, [config])

  const handleSettingChange = (key: string, value: any) => {
    // Handle number inputs - prevent NaN values
    if (typeof value === 'number' && isNaN(value)) {
      return
    }
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    // Update timer store with new settings
    updateConfig({
      pomodoroMinutes: settings.pomodoroMinutes,
      shortBreakMinutes: settings.shortBreakMinutes,
      longBreakMinutes: settings.longBreakMinutes,
      intervalsPerLong: settings.intervalsPerLong,
      autoStartBreaks: settings.autoStartBreaks,
      autoStartPomodoros: settings.autoStartPomodoros,
    })
    
    toast.success('Settings saved successfully!')
  }

  const handleTestSound = async () => {
    try {
      // Resume audio context if suspended (required for Web Audio API)
      if (typeof window !== 'undefined' && window.AudioContext) {
        const audioContext = new AudioContext()
        if (audioContext.state === 'suspended') {
          await audioContext.resume()
        }
      }
      
      playBell()
      toast.success('Sound test played!')
    } catch (error) {
      console.warn('Error playing sound:', error)
      toast.error('Could not play sound. Please check your browser settings.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Customize your Pomodoro experience
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Timer Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Timer Settings</span>
            </CardTitle>
            <CardDescription>
              Configure your Pomodoro timer durations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pomodoro">Focus Duration (minutes)</Label>
                <Input
                  id="pomodoro"
                  type="number"
                  value={settings.pomodoroMinutes || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 25 : parseInt(e.target.value)
                    if (!isNaN(value)) {
                      handleSettingChange('pomodoroMinutes', value)
                    }
                  }}
                  min="1"
                  max="120"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortBreak">Short Break (minutes)</Label>
                <Input
                  id="shortBreak"
                  type="number"
                  value={settings.shortBreakMinutes || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 5 : parseInt(e.target.value)
                    if (!isNaN(value)) {
                      handleSettingChange('shortBreakMinutes', value)
                    }
                  }}
                  min="1"
                  max="60"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="longBreak">Long Break (minutes)</Label>
                <Input
                  id="longBreak"
                  type="number"
                  value={settings.longBreakMinutes || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 15 : parseInt(e.target.value)
                    if (!isNaN(value)) {
                      handleSettingChange('longBreakMinutes', value)
                    }
                  }}
                  min="1"
                  max="120"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="intervals">Intervals per Long Break</Label>
                <Input
                  id="intervals"
                  type="number"
                  value={settings.intervalsPerLong || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 4 : parseInt(e.target.value)
                    if (!isNaN(value)) {
                      handleSettingChange('intervalsPerLong', value)
                    }
                  }}
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auto-start Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Auto-start Settings</CardTitle>
            <CardDescription>
              Configure automatic timer behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-start breaks</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically start break timers when focus sessions end
                </p>
              </div>
              <Switch
                checked={settings.autoStartBreaks}
                onCheckedChange={(checked) => handleSettingChange('autoStartBreaks', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-start pomodoros</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically start focus sessions when breaks end
                </p>
              </div>
              <Switch
                checked={settings.autoStartPomodoros}
                onCheckedChange={(checked) => handleSettingChange('autoStartPomodoros', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Strict focus mode</Label>
                <p className="text-sm text-muted-foreground">
                  Prevent interruptions during focus sessions
                </p>
              </div>
              <Switch
                checked={settings.strictFocusMode}
                onCheckedChange={(checked) => handleSettingChange('strictFocusMode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sound Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Volume2 className="h-5 w-5" />
              <span>Sound Settings</span>
            </CardTitle>
            <CardDescription>
              Configure audio notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Alarm Volume</Label>
                <span className="text-sm text-muted-foreground">{settings.alarmVolume}%</span>
              </div>
              <Slider
                value={[settings.alarmVolume]}
                onValueChange={([value]) => handleSettingChange('alarmVolume', value)}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            <Button variant="outline" className="w-full" onClick={handleTestSound}>
              <Bell className="mr-2 h-4 w-4" />
              Test Sound
            </Button>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the app's appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center space-x-2">
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4" />
                      <span>System</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="px-8" onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
