# Testing Checklist - Flowdoro App

## 🚀 Server Status
- [ ] Development server running on http://localhost:3000
- [ ] No console errors on startup

## 🔐 Authentication Testing

### User Registration
- [ ] Email/password registration works
- [ ] Form validation (name, email, password)
- [ ] Error handling for duplicate emails
- [ ] Success redirect to signin page

### Google OAuth
- [ ] "Continue with Google" button appears
- [ ] Google OAuth popup opens
- [ ] Email selection works
- [ ] Redirects to dashboard after authentication
- [ ] User session persists

### User Sign In
- [ ] Email/password signin works
- [ ] Error handling for invalid credentials
- [ ] Success redirect to dashboard
- [ ] "Remember me" functionality

### User Sign Out
- [ ] Sign out button works
- [ ] Redirects to home page
- [ ] Session cleared

## ⏱️ Timer Functionality

### Basic Timer
- [ ] Timer displays correctly (25:00 default)
- [ ] Start button works
- [ ] Pause button works
- [ ] Reset button works
- [ ] Timer counts down properly
- [ ] Timer stops at 00:00

### Phase Management
- [ ] Focus phase (25 minutes)
- [ ] Short break phase (5 minutes)
- [ ] Long break phase (15 minutes)
- [ ] Phase switching works
- [ ] Phase indicators display correctly

### Timer Controls
- [ ] Skip button works
- [ ] Auto-start breaks (if enabled)
- [ ] Auto-start pomodoros (if enabled)
- [ ] Sound notifications work
- [ ] Visual notifications work

## 📋 Task Management

### Task Creation
- [ ] Create new task
- [ ] Task title required
- [ ] Task description optional
- [ ] Priority selection (Low, Medium, High, Critical)
- [ ] Estimate pomodoros
- [ ] Due date selection
- [ ] Project assignment
- [ ] Tags assignment

### Task Management
- [ ] View all tasks
- [ ] Edit task
- [ ] Delete task
- [ ] Mark task as complete
- [ ] Change task status (Backlog, Todo, In Progress, Done)
- [ ] Task filtering by status
- [ ] Task sorting

### Task Integration
- [ ] Select task for timer
- [ ] Timer tracks pomodoros for selected task
- [ ] Task progress updates
- [ ] Completed pomodoros count

## 📊 Projects & Organization

### Project Management
- [ ] Create new project
- [ ] Project name required
- [ ] Project color selection
- [ ] View project tasks
- [ ] Edit project
- [ ] Delete project

### Tags
- [ ] Create new tag
- [ ] Assign tags to tasks
- [ ] Filter tasks by tags
- [ ] Tag management

## ⚙️ Settings & Preferences

### Timer Settings
- [ ] Change pomodoro duration
- [ ] Change short break duration
- [ ] Change long break duration
- [ ] Set intervals per long break
- [ ] Auto-start settings
- [ ] Strict focus mode

### User Preferences
- [ ] Theme selection (Light, Dark, System)
- [ ] Alarm sound selection
- [ ] Alarm volume control
- [ ] Settings persistence

## 📈 Analytics & Stats

### Dashboard
- [ ] Today's focus sessions count
- [ ] Total focus time today
- [ ] Tasks completed today
- [ ] Current streak
- [ ] Recent activity

### Statistics
- [ ] View detailed statistics
- [ ] Charts and graphs
- [ ] Historical data
- [ ] Export functionality

## 🎨 UI/UX Testing

### Responsive Design
- [ ] Desktop layout works
- [ ] Tablet layout works
- [ ] Mobile layout works
- [ ] Navigation works on all devices

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast
- [ ] Focus indicators

### Performance
- [ ] Fast page loads
- [ ] Smooth animations
- [ ] No lag during timer
- [ ] Efficient data loading

## 🔧 Technical Testing

### API Endpoints
- [ ] User registration API
- [ ] User authentication API
- [ ] Task CRUD APIs
- [ ] Project CRUD APIs
- [ ] Timer session APIs
- [ ] Settings APIs

### Database Operations
- [ ] User data persistence
- [ ] Task data persistence
- [ ] Settings persistence
- [ ] Session management
- [ ] Data relationships

### Error Handling
- [ ] Network error handling
- [ ] Invalid input handling
- [ ] Authentication error handling
- [ ] Database error handling

## 🚨 Known Issues to Check

- [ ] Google OAuth redirect issues
- [ ] Timer accuracy
- [ ] Data synchronization
- [ ] Session persistence
- [ ] Mobile responsiveness

## 📝 Test Results

### Working Features:
- 

### Broken Features:
- 

### Issues Found:
- 

### Priority Fixes Needed:
-
