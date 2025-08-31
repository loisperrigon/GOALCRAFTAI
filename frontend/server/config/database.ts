import mongoose from 'mongoose'

export async function connectDB() {
  try {
    if (mongoose.connection.readyState >= 1) {
      return mongoose.connection
    }

    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/goalcraft'
    
    const options: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    }

    await mongoose.connect(uri, options)
    
    console.log('✅ MongoDB connected successfully')
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected')
    })

    return mongoose.connection
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    process.exit(1)
  }
}