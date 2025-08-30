# GoalCraftAI

AI-Powered Goal Achievement Platform - Transform your aspirations into achievable milestones with intelligent planning and tracking.

## 🏗️ Project Structure

```
GoalCraftAI/
├── frontend/                 # Next.js Frontend Application
│   ├── src/
│   │   └── app/             # Next.js App Router
│   │       ├── layout.tsx   # Root layout with SEO optimizations
│   │       ├── page.tsx     # Homepage
│   │       └── globals.css  # Global styles
│   ├── next.config.js       # Next.js configuration
│   ├── tailwind.config.ts   # Tailwind CSS configuration
│   ├── postcss.config.js    # PostCSS configuration
│   ├── tsconfig.json        # TypeScript configuration
│   └── package.json         # Frontend dependencies
│
├── backend/                  # Express.js Backend API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   │   └── User.ts      # User model with authentication
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # Utility functions
│   │   └── server.ts        # Express server setup
│   ├── tsconfig.json        # TypeScript configuration
│   ├── package.json         # Backend dependencies
│   └── .env.example         # Environment variables template
│
└── shared/                   # Shared TypeScript Types
    └── types/
        └── index.ts         # Common interfaces and types
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

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Environment Configuration**
   
   Backend:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```
   
   Frontend:
   ```bash
   cd frontend
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Start Development Servers**
   
   Backend (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

## 🛠️ Development

### Frontend (Next.js)

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **TypeScript**: Full type safety

**Available Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Backend (Express.js)

- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcryptjs
- **AI Integration**: OpenAI API
- **CORS**: Configured for frontend integration

**Available Scripts:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Shared Types

Common TypeScript interfaces and types shared between frontend and backend:
- User management types
- Goal and step definitions
- API response formats
- AI integration types
- Progress tracking interfaces

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