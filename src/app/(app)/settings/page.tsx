'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Volume2, 
  Bell, 
  Moon, 
  Sun, 
  Monitor, 
  Smartphone, 
  Clock, 
  Eye, 
  Palette, 
  Database, 
  Download, 
  Trash2,
  Save,
  RefreshCw,
  Zap,
  Shield,
  Target,
  Timer,
  Music,
  Smartphone as Mobile,
  Globe,
  Lock,
  Unlock,
  Sparkles,
  Brain,
  Heart,
  EyeOff,
  VolumeX,
  Volume1,
  Volume2 as VolumeHigh,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Info,
  Star,
  Crown,
  Rocket,
  TrendingUp,
  Users,
  Key,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Sun as SunIcon,
  Cloud,
  CloudRain,
  Wind
} from 'lucide-react'
import { useTheme } from '@/providers/theme-provider'
import { useTimerStore } from '@/state/useTimerStore'
import { useSound } from '@/hooks/useSound'
import { toast } from 'sonner'

interface SettingsData {
  // Timer Settings
  pomodoroMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  intervalsPerLong: number
  
  // Auto-start Settings
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  strictFocusMode: boolean
  
  // Sound & Notifications
  alarmVolume: number
  desktopNotifications: boolean
  notificationSounds: boolean
  focusReminders: boolean
  breakReminders: boolean
  doNotDisturb: boolean
  
  // Advanced Timer Settings
  showSeconds: boolean
  pauseBehavior: 'pause' | 'stop' | 'continue'
  maxSessionsPerDay: number
  
  // UI Preferences
  timerDisplayStyle: 'digital' | 'minimal' | 'analog'
  enableAnimations: boolean
  compactMode: boolean
  
  // Theme & Appearance
  theme: 'light' | 'dark' | 'system'
  accentColor: string
  enableParticles: boolean
  
  // Productivity Features
  enableStreaks: boolean
  enableGoals: boolean
  enableInsights: boolean
  enableSocialFeatures: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const settingVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

const accentColors = [
  { name: 'Blue', value: 'blue', class: 'from-blue-500 to-cyan-500' },
  { name: 'Purple', value: 'purple', class: 'from-purple-500 to-pink-500' },
  { name: 'Green', value: 'green', class: 'from-green-500 to-emerald-500' },
  { name: 'Orange', value: 'orange', class: 'from-orange-500 to-red-500' },
  { name: 'Teal', value: 'teal', class: 'from-teal-500 to-cyan-500' },
  { name: 'Pink', value: 'pink', class: 'from-pink-500 to-rose-500' },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { config, updateConfig } = useTimerStore()
  const { playBell } = useSound({ volume: 70, enabled: true })
  
  const [settings, setSettings] = useState<SettingsData>({
    // Timer Settings
    pomodoroMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    intervalsPerLong: 4,
    
    // Auto-start Settings
    autoStartBreaks: true,
    autoStartPomodoros: false,
    strictFocusMode: false,
    
    // Sound & Notifications
    alarmVolume: 70,
    desktopNotifications: true,
    notificationSounds: true,
    focusReminders: false,
    breakReminders: true,
    doNotDisturb: false,
    
    // Advanced Timer Settings
    showSeconds: false,
    pauseBehavior: 'pause',
    maxSessionsPerDay: 0,
    
    // UI Preferences
    timerDisplayStyle: 'digital',
    enableAnimations: true,
    compactMode: false,
    
    // Theme & Appearance
    theme: 'system',
    accentColor: 'blue',
    enableParticles: true,
    
    // Productivity Features
    enableStreaks: true,
    enableGoals: true,
    enableInsights: true,
    enableSocialFeatures: false,
  })

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load settings from timer store
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      pomodoroMinutes: config.pomodoroMinutes,
      shortBreakMinutes: config.shortBreakMinutes,
      longBreakMinutes: config.longBreakMinutes,
      intervalsPerLong: config.intervalsPerLong,
      autoStartBreaks: config.autoStartBreaks,
      autoStartPomodoros: config.autoStartPomodoros,
      theme: theme,
    }))
  }, [config, theme])

  const handleSettingChange = useCallback((key: keyof SettingsData, value: any) => {
    // Handle number inputs - prevent NaN values
    if (typeof value === 'number' && isNaN(value)) {
      return
    }
    
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasUnsavedChanges(true)
    
    // Auto-save theme changes
    if (key === 'theme') {
      setTheme(value)
    }
  }, [setTheme])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    
    try {
      // Update timer store with new settings
      updateConfig({
        pomodoroMinutes: settings.pomodoroMinutes,
        shortBreakMinutes: settings.shortBreakMinutes,
        longBreakMinutes: settings.longBreakMinutes,
        intervalsPerLong: settings.intervalsPerLong,
        autoStartBreaks: settings.autoStartBreaks,
        autoStartPomodoros: settings.autoStartPomodoros,
      })
      
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setHasUnsavedChanges(false)
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSettings = () => {
    setSettings({
      pomodoroMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      intervalsPerLong: 4,
      autoStartBreaks: true,
      autoStartPomodoros: false,
      strictFocusMode: false,
      alarmVolume: 70,
      desktopNotifications: true,
      notificationSounds: true,
      focusReminders: false,
      breakReminders: true,
      doNotDisturb: false,
      showSeconds: false,
      pauseBehavior: 'pause',
      maxSessionsPerDay: 0,
      timerDisplayStyle: 'digital',
      enableAnimations: true,
      compactMode: false,
      theme: 'system',
      accentColor: 'blue',
      enableParticles: true,
      enableStreaks: true,
      enableGoals: true,
      enableInsights: true,
      enableSocialFeatures: false,
    })
    setHasUnsavedChanges(true)
    toast.info('Settings reset to defaults')
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

  const getVolumeIcon = (volume: number) => {
    if (volume === 0) return VolumeX
    if (volume < 30) return Volume1
    if (volume < 70) return Volume2
    return VolumeHigh
  }

  const VolumeIcon = getVolumeIcon(settings.alarmVolume)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse" />
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2"
              >
                Settings
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-gray-300 text-lg"
              >
                Customize your Flowdoro experience
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex space-x-3"
            >
              <Button
                onClick={handleResetSettings}
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all duration-300"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={!hasUnsavedChanges || isSaving}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Settings Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 lg:grid-cols-2"
        >
          {/* Timer Settings */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Timer className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Timer Settings</CardTitle>
                    <CardDescription className="text-gray-400">
                      Configure your Pomodoro timer durations
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div variants={settingVariants} className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pomodoro" className="text-gray-300">Focus Duration</Label>
                    <div className="relative">
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
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">min</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shortBreak" className="text-gray-300">Short Break</Label>
                    <div className="relative">
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
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">min</span>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div variants={settingVariants} className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="longBreak" className="text-gray-300">Long Break</Label>
                    <div className="relative">
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
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">min</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="intervals" className="text-gray-300">Intervals per Long Break</Label>
                    <div className="relative">
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
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">sessions</span>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Auto-start Settings */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Auto-start Settings</CardTitle>
                    <CardDescription className="text-gray-400">
                      Control automatic timer behavior
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div variants={settingVariants} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-gray-300">Auto-start Breaks</Label>
                    <p className="text-xs text-gray-400">Automatically start break timers</p>
                  </div>
                  <Switch
                    checked={settings.autoStartBreaks}
                    onCheckedChange={(checked) => handleSettingChange('autoStartBreaks', checked)}
                    className="data-[state=checked]:bg-green-500"
                  />
                </motion.div>
                
                <motion.div variants={settingVariants} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-gray-300">Auto-start Pomodoros</Label>
                    <p className="text-xs text-gray-400">Automatically start focus sessions</p>
                  </div>
                  <Switch
                    checked={settings.autoStartPomodoros}
                    onCheckedChange={(checked) => handleSettingChange('autoStartPomodoros', checked)}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </motion.div>
                
                <motion.div variants={settingVariants} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-gray-300">Strict Focus Mode</Label>
                    <p className="text-xs text-gray-400">Prevent interruptions during focus</p>
                  </div>
                  <Switch
                    checked={settings.strictFocusMode}
                    onCheckedChange={(checked) => handleSettingChange('strictFocusMode', checked)}
                    className="data-[state=checked]:bg-red-500"
                  />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sound & Notifications */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Sound & Notifications</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage audio and notification preferences
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div variants={settingVariants} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Alarm Volume</Label>
                      <p className="text-xs text-gray-400">Set notification sound volume</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <VolumeIcon className="h-4 w-4 text-gray-400" />
                      <Button
                        onClick={handleTestSound}
                        size="sm"
                        variant="outline"
                        className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                      >
                        Test
                      </Button>
                    </div>
                  </div>
                  <Slider
                    value={[settings.alarmVolume]}
                    onValueChange={([value]) => handleSettingChange('alarmVolume', value)}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </motion.div>
                
                <Separator className="bg-white/10" />
                
                <motion.div variants={settingVariants} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Desktop Notifications</Label>
                      <p className="text-xs text-gray-400">Show browser notifications</p>
                    </div>
                    <Switch
                      checked={settings.desktopNotifications}
                      onCheckedChange={(checked) => handleSettingChange('desktopNotifications', checked)}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Notification Sounds</Label>
                      <p className="text-xs text-gray-400">Play sounds with notifications</p>
                    </div>
                    <Switch
                      checked={settings.notificationSounds}
                      onCheckedChange={(checked) => handleSettingChange('notificationSounds', checked)}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Do Not Disturb</Label>
                      <p className="text-xs text-gray-400">Silence all notifications</p>
                    </div>
                    <Switch
                      checked={settings.doNotDisturb}
                      onCheckedChange={(checked) => handleSettingChange('doNotDisturb', checked)}
                      className="data-[state=checked]:bg-red-500"
                    />
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Appearance & Theme */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
                    <Palette className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Appearance & Theme</CardTitle>
                    <CardDescription className="text-gray-400">
                      Customize the look and feel
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div variants={settingVariants} className="space-y-3">
                  <Label className="text-gray-300">Theme</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={settings.theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSettingChange('theme', 'light')}
                      className={settings.theme === 'light' ? 'bg-white text-black' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'}
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </Button>
                    <Button
                      variant={settings.theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSettingChange('theme', 'dark')}
                      className={settings.theme === 'dark' ? 'bg-white text-black' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'}
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </Button>
                    <Button
                      variant={settings.theme === 'system' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSettingChange('theme', 'system')}
                      className={settings.theme === 'system' ? 'bg-white text-black' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      System
                    </Button>
                  </div>
                </motion.div>
                
                <motion.div variants={settingVariants} className="space-y-3">
                  <Label className="text-gray-300">Accent Color</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {accentColors.map((color) => (
                      <Button
                        key={color.value}
                        variant={settings.accentColor === color.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSettingChange('accentColor', color.value)}
                        className={`${
                          settings.accentColor === color.value 
                            ? `bg-gradient-to-r ${color.class} text-white` 
                            : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                        }`}
                      >
                        {color.name}
                      </Button>
                    ))}
                  </div>
                </motion.div>
                
                <motion.div variants={settingVariants} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Enable Animations</Label>
                      <p className="text-xs text-gray-400">Show smooth transitions and effects</p>
                    </div>
                    <Switch
                      checked={settings.enableAnimations}
                      onCheckedChange={(checked) => handleSettingChange('enableAnimations', checked)}
                      className="data-[state=checked]:bg-purple-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Enable Particles</Label>
                      <p className="text-xs text-gray-400">Show floating background particles</p>
                    </div>
                    <Switch
                      checked={settings.enableParticles}
                      onCheckedChange={(checked) => handleSettingChange('enableParticles', checked)}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Compact Mode</Label>
                      <p className="text-xs text-gray-400">Reduce spacing for more content</p>
                    </div>
                    <Switch
                      checked={settings.compactMode}
                      onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Advanced Settings */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Advanced Settings</CardTitle>
                    <CardDescription className="text-gray-400">
                      Fine-tune your experience
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div variants={settingVariants} className="space-y-3">
                  <Label className="text-gray-300">Timer Display Style</Label>
                  <Select value={settings.timerDisplayStyle} onValueChange={(value: any) => handleSettingChange('timerDisplayStyle', value)}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="analog">Analog</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
                
                <motion.div variants={settingVariants} className="space-y-3">
                  <Label className="text-gray-300">Pause Behavior</Label>
                  <Select value={settings.pauseBehavior} onValueChange={(value: any) => handleSettingChange('pauseBehavior', value)}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      <SelectItem value="pause">Pause Timer</SelectItem>
                      <SelectItem value="stop">Stop Timer</SelectItem>
                      <SelectItem value="continue">Continue in Background</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
                
                <motion.div variants={settingVariants} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Show Seconds</Label>
                      <p className="text-xs text-gray-400">Display seconds on timer</p>
                    </div>
                    <Switch
                      checked={settings.showSeconds}
                      onCheckedChange={(checked) => handleSettingChange('showSeconds', checked)}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-300">Max Sessions Per Day</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={settings.maxSessionsPerDay || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value)
                          if (!isNaN(value)) {
                            handleSettingChange('maxSessionsPerDay', value)
                          }
                        }}
                        min="0"
                        max="50"
                        placeholder="0 = unlimited"
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Productivity Features */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Productivity Features</CardTitle>
                    <CardDescription className="text-gray-400">
                      Enable advanced productivity tools
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div variants={settingVariants} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-gray-300">Enable Streaks</Label>
                    <p className="text-xs text-gray-400">Track consecutive days of focus</p>
                  </div>
                  <Switch
                    checked={settings.enableStreaks}
                    onCheckedChange={(checked) => handleSettingChange('enableStreaks', checked)}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </motion.div>
                
                <motion.div variants={settingVariants} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-gray-300">Enable Goals</Label>
                    <p className="text-xs text-gray-400">Set and track productivity goals</p>
                  </div>
                  <Switch
                    checked={settings.enableGoals}
                    onCheckedChange={(checked) => handleSettingChange('enableGoals', checked)}
                    className="data-[state=checked]:bg-green-500"
                  />
                </motion.div>
                
                <motion.div variants={settingVariants} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-gray-300">Enable Insights</Label>
                    <p className="text-xs text-gray-400">AI-powered productivity insights</p>
                  </div>
                  <Switch
                    checked={settings.enableInsights}
                    onCheckedChange={(checked) => handleSettingChange('enableInsights', checked)}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </motion.div>
                
                <motion.div variants={settingVariants} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-gray-300">Social Features</Label>
                    <p className="text-xs text-gray-400">Share progress with friends</p>
                  </div>
                  <Switch
                    checked={settings.enableSocialFeatures}
                    onCheckedChange={(checked) => handleSettingChange('enableSocialFeatures', checked)}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Unsaved Changes Indicator */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">You have unsaved changes</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
