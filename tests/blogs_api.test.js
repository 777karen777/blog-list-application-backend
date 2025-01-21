const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')

const Blog = require('../models/blog')
const blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

describe('API calls', () => {

  test('blogs are returned as json', async () => {
    await api.get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are right number of blogs', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length )
  })

  test('The unic identifier property of the blog post is named "id"', async () => {
    const response = await api.get('/api/blogs')
    const propNamedId = Object.keys(response.body[0])
    assert(propNamedId.includes('id') && !propNamedId.includes('_id'))
  })
  
  test('2-The unic identifier property of the blog post is named "id"', async () => {
    const response = await api.get('/api/blogs')
    const propNamedId = response.body.map(blog => blog.id)
    const propNamed_id = response.body.filter(blog => blog._id)
    assert.strictEqual(propNamedId.length, helper.initialBlogs.length)
    assert.strictEqual(propNamed_id.length, 0)
  })

  //Suggested by GPT
  test('3-The unic identifier property of the blog post is named "id"', async () => {
    const response = await api.get('/api/blogs')
    const allHaveID = response.body.every(blog => 'id' in blog)
    const noneHave_iD = response.body.every(blog => !('_id' in blog))
    assert(allHaveID && noneHave_iD)
  })
  
  //Suggested by GPT
  test('4-The unic identifier property of the blog post is named "id"', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach(blog => {
      assert('id' in blog)
      assert(!('_id' in blog))
    });
  })

  test('A new blog post is successfully created', async () => {
    const beforePost =  await helper.blogsInDb()

    const newBlog = {
      title: 'Added with POST',
      author: 'TTT',
      url: 'url_String5',
      likes: 77
    }

    /* const postResp =  */await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
    
    // console.log(postResp)
    const response = await api.get('/api/blogs')

    const titles = response.body.map(blog => blog.title)

    assert.strictEqual(response.body.length, beforePost.length + 1)

    assert(titles.includes('Added with POST'))
  })
  
  test(' if the likes property is missing from the request, it will default to the value 0', async () => {
    const beforePost =  await helper.blogsInDb()

    const newBlog = {
      title: 'Added with missing "likes" property',
      author: 'TTT',
      url: 'url_String7',
    }

    const postResp = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
    
    // console.log(postResp)

    const response = await api.get('/api/blogs')
    const lastIndex = response.body.length - 1
    assert(response.body.every(blog => 'likes' in blog))
    assert.strictEqual(response.body[lastIndex].likes, 0)
  })
  
  test('responds with the status code 400 Bad Request if the title or url properties are missing from the request data', async () => {
    const beforePost =  await helper.blogsInDb()

    const newBlog = {
      // title: 'Added with missing "title" or "autor" property',
      author: 'TTT',
      url: 'url_String8',
    }

    const postResp = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)
    
  })

  test('deletion succeeds with status code 204', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    const ids = blogsAtEnd.map(blog => blog.id)

    assert(!ids.includes(blogToDelete.id))
    assert.strictEqual(blogsAtStart.length - 1, blogsAtEnd.length)
  })

  test('blog update succeeds with status code 200', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedProps = {
      author: `${blogToUpdate.author} (updated)`,
      likes: blogToUpdate.likes + 1,
      sum: 'kkk'
    }

    const updated = await api.put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedProps)
      .expect(200)

    assert.strictEqual(updated.body.title, blogToUpdate.title)
    assert.strictEqual(updated.body.author, updatedProps.author)
    assert.strictEqual(updated.body.author, updatedProps.author)
    assert.strictEqual(updated.body.likes, updatedProps.likes)
    assert.strictEqual(updated.body.sum, undefined)

    // console.log(blogToUpdate);
    // console.log("Then");
    // console.log(updated.body);
    
  })  

})


after(async () => {
  await mongoose.connection.close()
})