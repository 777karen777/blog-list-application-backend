const blogsRouter = require('express').Router()
const blog = require('../models/blog')
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
    
  response.json(blogs)      
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog
    .findById(request.params.id)
    .populate('user', { username: 1, name: 1 })
  response.json(blog)   
})

// const gettokenFrom = request => {
//   const authorization = request.get('authorization')
//   if (authorization && authorization.startsWith('Bearer ')) {
//     return authorization.replace('Bearer ', '')
//   }
//   return null
// }
  
blogsRouter.post('/', async (request, response) => {
  const reqBody = {...request.body, likes: (request.body.likes || 0)}
  //
  // console.log('request body is as follows: ', reqBody);
  // await Blog.deleteMany({})

  // const decoded = jwt.decode(request.token)
  // console.log('Decoded : ', decoded)
  const decodedToken = jwt.verify(/* gettokenFrom(request) */request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({error: 'token invalid' })
  }
  
  const user = await User.findById(decodedToken.id)

  // console.log("The user: ", user);
  

  const blog = new Blog({...reqBody, user: user._id})

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params
  const blogToDelete = await Blog.findById(id)
  // console.log('the blog is : ', blogToDelete)
  // console.log('The request is: ', request)
  if(!blogToDelete) {
    // blogToDelete.deleteOne()
    // console.log(error)
    return response.status(404).json({ error: 'Blog not found' })
  }
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  // console.log('Decoded token is: ', decodedToken);
  
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'invalid token' })
  }

  // const theUser = await User.findById(blogToDelete.user)


  // console.log('users blogs : ', theUser.blogs);
  

  if (blogToDelete.user.toString() !== decodedToken.id) {
    return response.status(403).json({ error: 'You are not the owner of the blog'})
  }
  await Blog.findByIdAndDelete(request.params.id)
  await User.findByIdAndUpdate(blogToDelete.user, { $pull: { blogs: blogToDelete._id } })
  // await User.findByIdAndUpdate(blogToDelete.user, { $pull: { blogs: '67af28d4e2efabb9395ff07d' } })
  response.status(204).end()

})

blogsRouter.put('/:id', async (request, response) => {
  const { id } = request.params
  const body = request.body

  // const existingBlog = await Blog.findById(id)
  // const updatedBlog = {
  //   title: body.title !== undefined ? body.title : existingBlog.title,
  //   author: body.author !== undefined ? body.author : existingBlog.author,
  //   url: body.url !== undefined ? body.url : existingBlog.url,
  //   likes: body.likes !== undefined ? body.likes : existingBlog.likes
  // }

  const savedBlog = await Blog.findByIdAndUpdate(id, /* updatedBlog */ body, { new: true, runValidators: true, context: 'query' })
  response.json(savedBlog)
})

module.exports = blogsRouter