# GoalCraftAI

AI-Powered Goal Achievement Platform - Transform your aspirations into achievable milestones with intelligent planning and tracking.

## 🏗️ Project Structure

```
GoalCraftAI/
├── frontend/                 # Next.js Application (Frontend + API)
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   │   ├── api/         # API Routes (backend)
│   │   │   │   ├── ai/      # AI endpoints (chat, webhook)
│   │   │   │   ├── auth/    # NextAuth endpoints
│   │   │   │   └── conversations/ # CRUD conversations
│   │   │   ├── (pages)/     # Application pages
│   │   │   └── layout.tsx   # Root layout
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── stores/          # Zustand stores
│   │   └── lib/             # Utilities and configs
│   ├── next.config.js       # Next.js configuration
│   ├── tailwind.config.ts   # Tailwind CSS v4
│   ├── tsconfig.json        # TypeScript configuration
│   └── package.json         # Dependencies
│
├── docs/                     # Documentation
│   ├── webhook-api.md       # API Webhook documentation
│   ├── N8N_INTEGRATION.md   # n8n workflow integration
│   └── WEBSOCKET_DOCUMENTATION.md # WebSocket architecture
│
├── ws-server/               # WebSocket Server
│   └── server.js            # Standalone WS server (port 3002)
│
└── CLAUDE.md                # Instructions for Claude AI
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GoalCraftAI
   ```

2. **Install Dependencies**
   ```bash
   cd frontend
   npm install --legacy-peer-deps  # Required for React 19
   ```

3. **Environment Configuration**
   
   Create `.env.local` in frontend:
   ```bash
   cd frontend
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```
   
   Required variables:
   ```env
   # MongoDB
   MONGODB_URI=mongodb+srv://...
   
   # NextAuth
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=http://localhost:3000
   
   # OAuth (optional)
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   
   # n8n Webhook
   N8N_WEBHOOK_SECRET=...
   
   # Encryption
   ENCRYPTION_KEY=...
   ```

4. **Start Development Servers**
   
   Next.js App (Terminal 1):
   ```bash
   cd frontend
   npm run dev
   ```
   
   WebSocket Server (Terminal 2):
   ```bash
   cd ws-server
   node server.js
   ```

## 🛠️ Development

### Tech Stack

**Frontend:**
- **Framework**: Next.js 15 with App Router
- **React**: Version 19 (latest)
- **Styling**: Tailwind CSS v4 + shadcn/ui (canary)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **TypeScript**: Full type safety

**Backend (API Routes):**
- **Runtime**: Next.js API Routes
- **Database**: MongoDB Atlas (native driver)
- **Authentication**: NextAuth v5 
- **Encryption**: AES-256-GCM for messages
- **AI Integration**: n8n workflows + OpenAI
- **Real-time**: WebSocket server (port 3002)

**Available Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## 🔧 Configuration

### Next.js Features

- **SEO Optimization**: Meta tags, Open Graph, Twitter Cards
- **Performance**: Image optimization, bundle splitting
- **Security**: Security headers, CSP
- **TypeScript**: Path aliases for clean imports

### Express.js Features

- **Database**: MongoDB connection with Mongoose
- **Security**: CORS, helmet, rate limiting ready
- **Authentication**: JWT-based auth system
- **AI Integration**: OpenAI client configuration
- **Error Handling**: Centralized error middleware

## 📦 Key Dependencies

### Frontend
- `next`: React framework
- `react`: UI library
- `tailwindcss`: Utility-first CSS
- `typescript`: Type safety
- `zustand`: State management
- `framer-motion`: Animations
- `lucide-react`: Icons

### Backend
- `express`: Web framework
- `mongoose`: MongoDB ODM
- `jsonwebtoken`: JWT authentication
- `bcryptjs`: Password hashing
- `openai`: AI integration
- `cors`: Cross-origin requests

## 🌟 Features

- **AI-Powered Goal Planning**: Intelligent goal breakdown and step generation
- **Progress Tracking**: Real-time progress monitoring and analytics
- **User Authentication**: Secure JWT-based authentication system
- **Responsive Design**: Mobile-first, responsive UI
- **SEO Optimized**: Search engine friendly with meta tags
- **TypeScript**: Full type safety across the stack
- **Modern Stack**: Latest versions of Next.js and Express.js

## 📱 API Endpoints

- `GET /health` - Health check
- `GET /api` - API information
- Additional routes will be implemented in controllers

## 🔐 Environment Variables

Check `.env.example` files in both frontend and backend directories for required environment variables.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.