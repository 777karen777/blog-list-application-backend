const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const blogsRouter = require('express').Router()
const User = require('../models/user')