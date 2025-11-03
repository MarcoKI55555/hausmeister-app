# Hausmeister-App (Starter)

Dieses Starter-Repo enthält ein einfaches Next.js + TypeScript + Tailwind Projekt,
konfiguriert für deine Supabase-Instanz und vorbereitet für SMTP-Mailversand via Gmail.

## Schnellstart (lokal)
1. Node.js (>=18) installieren
2. `npm install`
3. Environment-Variablen setzen (oder .env.local erstellen):
   - NEXT_PUBLIC_SUPABASE_URL=https://gutocyfzabqhsuuptskv.supabase.co
   - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dG9jeWZ6YWJxaHN1dXB0c2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzQyMTAsImV4cCI6MjA3Nzc1MDIxMH0.p8xVvTjqd5lJGC59pQvVQbOIOhv5M8iIdfl2PVzSdh8
   - MAIL_HOST=smtp.gmail.com
   - MAIL_PORT=587
   - MAIL_USER=marcoki55555@gmail.com
   - MAIL_PASS=<DEIN_GMAIL_APP_PASSWORT>
   - MAIL_FROM='Hausmeister-App <marcoki55555@gmail.com>'
4. `npm run dev`

## Deployment
1. Repo zu GitHub hochladen
2. Vercel mit GitHub verbinden und Repo importieren
3. Environment-Variablen in Vercel anlegen (wie oben)

