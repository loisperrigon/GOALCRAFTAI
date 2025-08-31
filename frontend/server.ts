import express from 'express'
import next from 'next'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './server/config/database'
import authRoutes from './server/routes/auth.routes'
import objectivesRoutes from './server/routes/objectives.routes'
import { setupWebSocket } from './server/websocket/websocket.handler'

// Charger les variables d'environnement
dotenv.config()

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Créer l'app Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  // Connexion à MongoDB
  await connectDB()

  // Créer le serveur Express
  const server = express()
  const httpServer = createServer(server)
  
  // Configurer Socket.io
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      credentials: true
    }
  })

  // Middleware
  server.use(cors())
  server.use(express.json())
  server.use(express.urlencoded({ extended: true }))

  // Routes API (avant Next.js handler)
  server.use('/api/auth', authRoutes)
  server.use('/api/objectives', objectivesRoutes)

  // Health check
  server.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV 
    })
  })

  // Setup WebSocket handlers
  setupWebSocket(io)

  // Toutes les autres routes sont gérées par Next.js
  server.all('*', (req, res) => {
    return handle(req, res)
  })

  // Démarrer le serveur
  httpServer.listen(port, () => {
    console.log(`
      🚀 Server ready at http://localhost:${port}
      🔌 WebSocket ready at ws://localhost:${port}
      🌍 Environment: ${process.env.NODE_ENV}
      📦 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}
    `)
  })
})

// Gestion des erreurs
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})