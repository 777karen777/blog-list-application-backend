const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')


mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

const connectToDatabase = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI)
    logger.info('connected to  MongoDB')
  } catch (exeption)  {
    logger.error('error connecting to MongoDB:', exeption.message)
  }
}

connectToDatabase()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

app.use(middleware.requestLogger)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)


module.exports = app