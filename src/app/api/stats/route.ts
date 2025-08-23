import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        tasks: {
          where: {
            status: 'DONE'
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get today's sessions
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todaySessions = await prisma.timerSession.findMany({
      where: {
        userId: user.id,
        completed: true,
        endedAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Get this week's sessions
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const weekSessions = await prisma.timerSession.findMany({
      where: {
        userId: user.id,
        completed: true,
        endedAt: {
          gte: weekStart,
          lt: weekEnd
        }
      }
    })

    // Get all time sessions for total stats
    const allTimeSessions = await prisma.timerSession.findMany({
      where: {
        userId: user.id,
        completed: true,
        endedAt: { not: null }
      },
      orderBy: { endedAt: 'desc' }
    })

    // Find the most recent session counter reset
    const lastReset = await prisma.sessionCounterReset.findFirst({
      where: { userId: user.id },
      orderBy: { resetAt: 'desc' }
    })

    // Filter sessions to only include those after the most recent reset
    const resetDate = lastReset?.resetAt || null
    const sessionsAfterReset = resetDate 
      ? allTimeSessions.filter(session => new Date(session.endedAt!) > resetDate)
      : allTimeSessions

    // Calculate statistics
    const todayFocusTime = todaySessions.reduce((total, session) => total + (session.durationSec || 0), 0)
    const weekFocusTime = weekSessions.reduce((total, session) => total + (session.durationSec || 0), 0)
    const totalFocusTime = sessionsAfterReset.reduce((total, session) => total + (session.durationSec || 0), 0)
    
    const todayTasksCompleted = user.tasks.length
    const totalTasksCompleted = await prisma.task.count({
      where: {
        userId: user.id,
        status: 'DONE'
      }
    })

    // Calculate average session duration
    const avgSessionDuration = sessionsAfterReset.length > 0 
      ? Math.round(sessionsAfterReset.reduce((total, session) => total + (session.durationSec || 0), 0) / sessionsAfterReset.length)
      : 0

    // Calculate session distribution (only after most recent reset)
    const focusSessions = sessionsAfterReset.filter(s => s.phase === 'FOCUS').length
    const shortBreaks = sessionsAfterReset.filter(s => s.phase === 'SHORT_BREAK').length
    const longBreaks = sessionsAfterReset.filter(s => s.phase === 'LONG_BREAK').length
    const totalSessions = sessionsAfterReset.length
    
    console.log('Stats calculation:', {
      totalSessions: sessionsAfterReset.length,
      focusSessions,
      shortBreaks,
      longBreaks,
      userEmail: session.user.email,
      resetDate: resetDate?.toISOString()
    })

    // Calculate weekly progress (last 7 days)
    const weeklyProgress = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const daySessions = sessionsAfterReset.filter(session => {
        const sessionDate = new Date(session.endedAt!)
        return sessionDate >= dayStart && sessionDate < dayEnd
      })

      weeklyProgress.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sessions: daySessions.length,
        focusTime: daySessions.reduce((total, session) => total + (session.durationSec || 0), 0)
      })
    }

    // Get recent activity (last 5 sessions)
    const recentActivity = sessionsAfterReset.slice(0, 5).map(session => ({
      type: session.phase,
      duration: session.durationSec,
      completedAt: session.endedAt,
      id: session.id
    }))

    // Calculate streak (consecutive days with sessions)
    let streak = 0
    let currentDate = new Date(today)
    currentDate.setDate(currentDate.getDate() - 1) // Start from yesterday

    while (true) {
      const dayStart = new Date(currentDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const hasSessions = sessionsAfterReset.some(session => {
        const sessionDate = new Date(session.endedAt!)
        return sessionDate >= dayStart && sessionDate < dayEnd
      })

      if (hasSessions) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return NextResponse.json({
      today: {
        focusSessions: todaySessions.length,
        totalFocusTime: todayFocusTime,
        tasksCompleted: todayTasksCompleted
      },
      week: {
        focusSessions: weekSessions.length,
        totalFocusTime: weekFocusTime
      },
      allTime: {
        focusSessions: focusSessions,
        totalFocusTime,
        tasksCompleted: totalTasksCompleted,
        avgSessionDuration
      },
      distribution: {
        focus: totalSessions > 0 ? Math.round((focusSessions / totalSessions) * 100) : 0,
        shortBreaks: totalSessions > 0 ? Math.round((shortBreaks / totalSessions) * 100) : 0,
        longBreaks: totalSessions > 0 ? Math.round((longBreaks / totalSessions) * 100) : 0
      },
      weeklyProgress,
      recentActivity,
      streak
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
