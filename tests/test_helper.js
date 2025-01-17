const Blog = require('../models/blog')

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

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb
}