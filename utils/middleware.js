const logger = require('./logger')
const User = require('../models/user')
const jwt = require('jsonwebtoken')



const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:', request.path)
  logger.info('Body:', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}

const tokenExtractor = (request, response, next) => {
  // console.log('I am in tokenExtractor!');
  
  const authorization = request.get('authorization')
  // console.log("From Middleware 23: ", authorization);
  
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  } else {
    request.token = null
  }
  
  next()
}

const userExtractor = async (request, response, next) => {

  if (request.method === 'GET') {
    return next()
  }
  
  // console.log('I am in userExtractor!');
/*   const authorization = request.get('authorization')
 */  // console.log('\n\nHHHHEEEERRRREEE in middle\n\n');
  // console.log('AUTH is : ', authorization)

  if (/* authorization && authorization.startsWith('Bearer ') */ request.token) {
    try {
      const decodedToken = jwt.verify(request.token, process.env.SECRET)
      if (!decodedToken.id) {
        return response.status(404).json({error: 'invalid token'})
      }
      const user = await User.findById(decodedToken.id)

      request.user = await User.findById(decodedToken.id)
      if (!user) {
        return response.status(404).json({ error: 'user not found' })
      }
      request.user = user
    } catch (error) {
      return next(error)
    }
    // if (!request.user) {
    //   return response.status(404).json({error: 'invalid token'})
    // }
  } else {
    // console.log('The authorization token: ',authorization)
    return response.status(401).json({ error: 'missing token'})
  }

  next()
}


/* const userExtractor = async (request, response, next) => {
  if (request.method === 'GET') {
    return next()
  }

  const authorization = request.get('authorization')
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'missing token' })
  }

  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'invalid token' })
    }

    const user = await User.findById(decodedToken.id)
    if (!user) {
      return response.status(404).json({ error: 'user not found' })
    }

    request.user = user
  } catch (error) {
    return next(error)
  }

  next()
} */


const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if(error.name === 'CastError') {
    return response.status(400).send({ error: 'malformated id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'token invalid' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' })
  }

  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}