# Pomodoro Pro 🍅

A high-precision Pomodoro timer designed for developers with task management, analytics, and keyboard-first workflow.

## ✨ Features

- **High-Precision Timer**: Web Worker-powered timer with minimal drift, even when tab is backgrounded
- **Smart Breaks**: Automatic short and long breaks with configurable intervals
- **Task Management**: Organize tasks with projects, tags, and priority levels
- **Analytics & Insights**: Track your productivity with detailed charts and progress metrics
- **Keyboard-First**: Full keyboard shortcuts and command palette for power users
- **PWA Ready**: Install as a native app with offline support and notifications
- **Dark/Light Theme**: Beautiful theming with system preference detection
- **Authentication**: Secure user accounts with NextAuth.js

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- SQLite (development) / PostgreSQL (production)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pomodoro-pro
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   DATABASE_PROVIDER="sqlite"
   DATABASE_URL="file:./prisma/dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # Google OAuth (optional - for Google sign-in)
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   ```

### Setting up Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Set the authorized redirect URI to: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env` file

4. **Set up the database**
   ```bash
   pnpm prisma:migrate
   pnpm db:seed
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Account

After seeding the database, you can sign in with:
- **Email**: `demo@pomodoro-pro.com`
- **Password**: `demo123`

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Start/Pause timer |
| `S` | Skip current phase |
| `R` | Reset timer |
| `F` | Switch to Focus phase |
| `B` | Switch to Short Break |
| `L` | Switch to Long Break |
| `⌘K` | Open command palette |
| `T` | Quick add task |
| `1` | Go to Tasks |
| `2` | Go to Stats |

## 🏗️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Prisma ORM with SQLite/PostgreSQL
- **Authentication**: NextAuth.js
- **State Management**: Zustand + TanStack Query
- **Timer**: Web Workers for high precision
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Testing**: Vitest + Playwright
- **PWA**: next-pwa

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Authenticated routes
│   ├── (marketing)/       # Public marketing pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── timer/            # Timer-specific components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── providers/            # Context providers
├── state/                # Zustand stores
├── workers/              # Web Workers
└── db/                   # Database utilities
```

## 🧪 Testing

### Unit Tests
```bash
pnpm test
```

### E2E Tests
```bash
pnpm e2e
```

### Type Checking
```bash
pnpm typecheck
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Set environment variables**:
   ```env
   DATABASE_PROVIDER="postgresql"
   DATABASE_URL="your-postgresql-url"
   NEXTAUTH_URL="https://your-domain.vercel.app"
   NEXTAUTH_SECRET="your-secret-key"
   ```
4. **Deploy**

### Manual Deployment

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Start the production server**
   ```bash
   pnpm start
   ```

## 🔧 Configuration

### Timer Settings

- **Pomodoro Duration**: 25 minutes (configurable)
- **Short Break**: 5 minutes (configurable)
- **Long Break**: 15 minutes (configurable)
- **Intervals per Long Break**: 4 (configurable)

### PWA Configuration

The app is configured as a Progressive Web App with:
- Offline support for core features
- Desktop notifications
- Install prompt
- App-like experience

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [Prisma](https://www.prisma.io/) for database management
- [Framer Motion](https://www.framer.com/motion/) for animations

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

Made with ❤️ for developers who want to stay focused and productive.
