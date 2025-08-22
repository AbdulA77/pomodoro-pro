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

    // Calculate statistics
    const todayFocusTime = todaySessions.reduce((total, session) => total + (session.durationSec || 0), 0)
    const weekFocusTime = weekSessions.reduce((total, session) => total + (session.durationSec || 0), 0)
    const totalFocusTime = allTimeSessions.reduce((total, session) => total + (session.durationSec || 0), 0)
    
    const todayTasksCompleted = user.tasks.length
    const totalTasksCompleted = await prisma.task.count({
      where: {
        userId: user.id,
        status: 'DONE'
      }
    })

    // Calculate average session duration
    const avgSessionDuration = allTimeSessions.length > 0 
      ? Math.round(allTimeSessions.reduce((total, session) => total + (session.durationSec || 0), 0) / allTimeSessions.length)
      : 0

    // Calculate session distribution
    const focusSessions = allTimeSessions.filter(s => s.phase === 'FOCUS').length
    const shortBreaks = allTimeSessions.filter(s => s.phase === 'SHORT_BREAK').length
    const longBreaks = allTimeSessions.filter(s => s.phase === 'LONG_BREAK').length
    const totalSessions = allTimeSessions.length

    // Calculate weekly progress (last 7 days)
    const weeklyProgress = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const daySessions = allTimeSessions.filter(session => {
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
    const recentActivity = allTimeSessions.slice(0, 5).map(session => ({
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

      const hasSessions = allTimeSessions.some(session => {
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
        focusSessions: allTimeSessions.length,
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
