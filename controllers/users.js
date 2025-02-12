const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1/* , _id: 0 */ })
  response.json(users)
})


usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const isValidPassword = (v) => {
    return /^(?=[a-zA-Z])(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9_.-]{2,14}$/.test(v)
  }
  if (!password || !isValidPassword(password)) {
    return response.status(400).json({
      error: 'Password must start with a letter, contain at least one uppercase letter, one lowercase letter, one digit, and be between 3-15 characters long.'
    })
  }
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter