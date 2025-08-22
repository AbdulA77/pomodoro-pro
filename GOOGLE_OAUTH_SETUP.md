# Google OAuth Setup Guide

## Why Google Sign-In Isn't Working

The Google sign-in button is currently showing a setup message because Google OAuth credentials haven't been configured yet. Here's how to fix it:

## Step-by-Step Setup

### 1. Go to Google Cloud Console
Visit [Google Cloud Console](https://console.cloud.google.com/)

### 2. Create or Select a Project
- Create a new project or select an existing one
- Make sure you're in the correct project

### 3. Enable Google+ API
- Go to "APIs & Services" → "Library"
- Search for "Google+ API" or "Google Identity API"
- Click on it and press "Enable"

### 4. Create OAuth 2.0 Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth 2.0 Client IDs"
- Choose "Web application"
- Give it a name (e.g., "Pomodoro Pro")

### 5. Configure Authorized Redirect URIs
Add this exact URL to the "Authorized redirect URIs" section:
```
http://localhost:3000/api/auth/callback/google
```

### 6. Save and Copy Credentials
- Click "Create"
- Copy the **Client ID** and **Client Secret**

### 7. Add to Your Environment
Open your `.env` file and add:
```env
GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

### 8. Restart Your Development Server
```bash
pnpm dev
```

## Testing

After setup:
1. Visit `http://localhost:3000`
2. Click "Continue with Google"
3. You should be redirected to Google's sign-in page
4. After signing in, you'll be redirected back to your dashboard

## Troubleshooting

### Common Issues:
- **"Invalid redirect URI"**: Make sure the redirect URI is exactly `http://localhost:3000/api/auth/callback/google`
- **"Client ID not found"**: Double-check your `.env` file and restart the server
- **"API not enabled"**: Make sure you've enabled the Google+ API

### For Production:
When deploying, add your production domain to the authorized redirect URIs:
```
https://yourdomain.com/api/auth/callback/google
```

## Security Notes
- Never commit your `.env` file to version control
- Keep your Client Secret secure
- Use different credentials for development and production
