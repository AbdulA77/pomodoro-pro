import { z } from 'zod'

// User registration and login
export const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Task schemas
export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  projectId: z.string().optional(),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  estimatePomodoros: z.number().int().min(1).default(1),
  dueAt: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const taskUpdateSchema = taskSchema.partial()

// Project schemas
export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  color: z.string().default('blue'),
})

// Task template schemas
export const taskTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  estimatePomodoros: z.number().int().min(1).default(1),
  projectId: z.string().optional(),
  tags: z.string().optional(), // Store as comma-separated string
  isActive: z.boolean().default(true),
})

// Timer session schemas
export const timerSessionSchema = z.object({
  taskId: z.string().optional(),
  phase: z.enum(['FOCUS', 'SHORT_BREAK', 'LONG_BREAK']),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  durationSec: z.number().int().min(0),
  completed: z.boolean().default(false),
  interruptions: z.number().int().min(0).default(0),
})

// User settings schemas
export const userSettingsSchema = z.object({
  pomodoroMinutes: z.number().int().min(1).max(120).default(25),
  shortBreakMinutes: z.number().int().min(1).max(60).default(5),
  longBreakMinutes: z.number().int().min(1).max(120).default(15),
  intervalsPerLong: z.number().int().min(1).max(10).default(4),
  autoStartBreaks: z.boolean().default(true),
  autoStartPomodoros: z.boolean().default(false),
  strictFocusMode: z.boolean().default(false),
  alarmSound: z.string().default('bell.mp3'),
  alarmVolume: z.number().int().min(0).max(100).default(70),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
})

// Tag schemas
export const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
})

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
})

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type TaskInput = z.infer<typeof taskSchema>
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type TaskTemplateInput = z.infer<typeof taskTemplateSchema>
export type TimerSessionInput = z.infer<typeof timerSessionSchema>
export type UserSettingsInput = z.infer<typeof userSettingsSchema>
export type TagInput = z.infer<typeof tagSchema>
export type ApiResponse = z.infer<typeof apiResponseSchema>
