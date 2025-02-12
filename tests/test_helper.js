const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: "Blog 1",
    author: "MM",
    url: "url_String",
    likes: 7
  },
  {
    title: "Blog 2",
    author: "NN",
    url: "url_String2",
    likes: 9
  }
]



const nonExistingId = async () => {
  const blog = new Blog({
    title: "Will be removed soon",
    author: "NN",
    url: "url_String2",
    likes: 9
  })

  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map( u=> u.toJSON())
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb
}