import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { userSettingsSchema } from '@/lib/validators'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id }
    })

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        pomodoroMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        intervalsPerLong: 4,
        autoStartBreaks: true,
        autoStartPomodoros: false,
        strictFocusMode: false,
        alarmSound: 'bell.mp3',
        alarmVolume: 70,
        theme: 'system'
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = userSettingsSchema.parse(body)

    // Upsert settings (create if doesn't exist, update if it does)
    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        pomodoroMinutes: validatedData.pomodoroMinutes,
        shortBreakMinutes: validatedData.shortBreakMinutes,
        longBreakMinutes: validatedData.longBreakMinutes,
        intervalsPerLong: validatedData.intervalsPerLong,
        autoStartBreaks: validatedData.autoStartBreaks,
        autoStartPomodoros: validatedData.autoStartPomodoros,
        strictFocusMode: validatedData.strictFocusMode,
        alarmSound: validatedData.alarmSound,
        alarmVolume: validatedData.alarmVolume,
        theme: validatedData.theme,
      },
      create: {
        userId: session.user.id,
        pomodoroMinutes: validatedData.pomodoroMinutes,
        shortBreakMinutes: validatedData.shortBreakMinutes,
        longBreakMinutes: validatedData.longBreakMinutes,
        intervalsPerLong: validatedData.intervalsPerLong,
        autoStartBreaks: validatedData.autoStartBreaks,
        autoStartPomodoros: validatedData.autoStartPomodoros,
        strictFocusMode: validatedData.strictFocusMode,
        alarmSound: validatedData.alarmSound,
        alarmVolume: validatedData.alarmVolume,
        theme: validatedData.theme,
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error saving settings:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
