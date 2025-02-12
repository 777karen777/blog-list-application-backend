const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')

const Blog = require('../models/blog')
const blog = require('../models/blog')

const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)


describe('Some initial API calls', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
  
    for (let blog of helper.initialBlogs) {
      let blogObject = new Blog(blog)
      await blogObject.save()
    }
  })

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

  // //Suggested by GPT
  test('3-The unic identifier property of the blog post is named "id"', async () => {
    const response = await api.get('/api/blogs')
    const allHaveID = response.body.every(blog => 'id' in blog)
    const noneHave_iD = response.body.every(blog => !('_id' in blog))
    assert(allHaveID && noneHave_iD)
  })
  
  // //Suggested by GPT
  test('4-The unic identifier property of the blog post is named "id"', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach(blog => {
      assert('id' in blog)
      assert(!('_id' in blog))
    });
  })
})

describe('Tests for Post requests', () => {
  let userId = null
  let token = null

  const newUser = {
    "username": "knikogho",
    "name": "Karen",
    "password": "Secret7"
  }

  describe('Trying to add USER', () => {
    // beforeEach(async () => {
      // await Blog.deleteMany({})
      
      
    test('adding user Fails because of username is not long enough', async () => {
        const usersAtStart = await helper.usersInDb()
        
        const result = await api
        .post('/api/users')
        .send({...newUser, "username": "kn"})
        .expect(400)
        .expect('Content-Type', /application\/json/)
        
        const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      
      assert (result.body.error.includes('is shorter than the minimum allowed length'))
      
      // userId = addedUser._body.id
      // console.log('New user id is: ', userId)
      
    })
    
    test('adding user Fails because of invalid password', async () => {
      const usersAtStart = await helper.usersInDb()
      
      const result = await api
        .post('/api/users')
        .send({...newUser, "password": "kn"})
        .expect(400)
        .expect('Content-Type', /application\/json/)
  
        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
        
        assert (result.body.error.includes('Password must start with a letter, contain at least one uppercase letter, one lowercase letter, one digit'))
        
        // userId = addedUser._body.id
        // console.log('New user id is: ', userId)
        
    })
      
    test('Adding user Succeeds', async () => {
      await User.deleteMany({})
  
      const usersAtStart = await helper.usersInDb()
      
      const addedUser = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
      // console.log( 'THE error: ', addedUser.body.error)
  
      const usersAtEnd = await helper.usersInDb()
  
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
    
    })
      
    test('Adding user fails because of non unique username', async () => {
      // await User.deleteMany({})
  
      const usersAtStart = await helper.usersInDb()
      
      const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
      // console.log( 'THE error: ', addedUser.body.error)
  
      const usersAtEnd = await helper.usersInDb()
  
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  
      assert(result.body.error.includes('expected `username` to be unique'))  
    })
  
  })
  
  describe('Trying to Log In', () => {

    test('trying to log in with incorrect username', async () => {
      
      const result = await api
        .post('/api/login')
        .send({...newUser, "username": "wrnong_username"})
        .expect(401)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('invalid username or password'))

    })
    
    test('trying to log in with incorrect password', async () => {
      
      const result = await api
        .post('/api/login')
        .send({...newUser, "password": "wrnong_password"})
        .expect(401)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('invalid username or password'))

    })
    
    test('Log in SUCCEEDS', async () => {      
      const newLogin = await api
        .post('/api/login')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      token = newLogin._body.token
    })
    // userId = addedUser._body.id
    // console.log('New user id is: ', userId)
    
  
    // console.log('Token is : ', token)
    
  
    
  })
  
  describe('Trying to add a blog',() => {
    // await Blog.deleteMany({})

    test('A new blog post creation fails without Authorization', async () => {
      const blogsAtStart =  await helper.blogsInDb()
      
      const newBlog = {
        title: 'This post wont be added, becouse of authorization line is commented in the request',
        author: 'KaNi',
        url: 'url_String5',
        likes: 7777,
      }
    
      const result = await api
      .post('/api/blogs')
      // .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('token invalid'))

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
      
      // console.log("PostResp is :", postResp)
      // const response = await api.get('/api/blogs')
    
      // const titles = response.body.map(blog => blog.title)
    
      // assert.strictEqual(response.body.length, beforePost.length + 1)
    
      // assert(titles.includes('Added with POST'))
    })

    test('A new blog post creation fails because of invalid token', async () => {
      const blogsAtStart =  await helper.blogsInDb()
      
      const newBlog = {
        title: 'This post wont be added, because of invalid token',
        author: 'KaNi',
        url: 'url_String5',
        likes: 7777,
      }
    
      const result = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer invalidiating_the_token${token}`)
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('token invalid'))

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
   
    })
    
    test('A new blog post creation SUCCEEDS', async () => {
      const blogsAtStart =  await helper.blogsInDb()
      
      const newBlog = {
        title: 'This post WILL be added SUCCESSFULLY!',
        author: 'KaNi',
        url: 'url_String5',
        likes: 7777,
      }
    
      const result = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)


      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1)
      
      const response = await api.get('/api/blogs')
    
      const titles = response.body.map(blog => blog.title)    
    
      assert(titles.includes(newBlog.title))
    })

    test(' if the likes property is missing from the request, it will default to the value 0', async () => {
      const blogsAtStart =  await helper.blogsInDb()
    
      const newBlog = {
        title: 'Added with missing "likes" property',
        author: 'KaNi',
        url: 'url_String7',
      }
    
      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      
      // console.log(postResp)
    
      const response = await api.get('/api/blogs')
      const lastIndex = response.body.length - 1
      assert(response.body.every(blog => 'likes' in blog))
      assert.strictEqual(response.body[lastIndex].likes, 0)
      assert.strictEqual(response.body.length, blogsAtStart.length + 1)
    })

    test('responds with the status code 400 Bad Request if the title or url properties are missing from the request data', async () => {
      const blogsAtStart =  await helper.blogsInDb()
    
      const newBlog = {
        // title: 'Added with missing "title" or "autor" property',
        author: 'KaNi',
        url: 'url_String8',
      }
    
      const result = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)

      assert(result.body.error.includes('Blog validation failed: title: Path `title` is required.'))      
    })
  })
  
  describe('Updating a blog', () => {
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
      assert.strictEqual(updated.body.likes, updatedProps.likes)
      assert.strictEqual(updated.body.sum, undefined)    
      // console.log(blogToUpdate);
      // console.log("Then");
      // console.log(updated.body);      
    })
  })

  describe('Deleting a blog', () => {
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
  })
})


  
  





// describe('when there is initially one user in db', () => {
//   beforeEach(async () => {
//     await User.deleteMany({})

//     const passwordHash = await bcrypt.hash('Sekret1', 10)
//     const user = new User({ username: 'root', passwordHash })

//     await user.save()
//   })

//   test('creation succeds with a fresh username', async () => {
//     const usersAtStart = await helper.usersInDb()

//     const newUser = {
//       username: 'kani',
//       name: 'Karen Nikoghosyan',
//       password: 'Secret1'
//     }

//     await api
//       .post('/api/users')
//       .send(newUser)
//       .expect(201)
//       .expect('Content-Type', /application\/json/)
    
//     const usersAtEnd = await helper.usersInDb()
//     assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

//     const usernames = usersAtEnd.map(u => u.username)
//     assert(usernames.includes(newUser.username))
//   })

//   test('creation fails with proper statuscode and message if username already taken', async () => {
//     const usersAtStart = await helper.usersInDb()

//     const newUser = {
//       username: 'root',
//       name: 'Superuser',
//       password: 'secret2'
//     }

//     const result = await api
//       .post('/api/users')
//       .send(newUser)
//       .expect(400)
//       .expect('Content-Type', /application\/json/)

//     const usersAtEnd = await helper.usersInDb()
//     assert(result.body.error.includes('expected `username` to be unique'))

//     assert.strictEqual(usersAtEnd.length, usersAtStart.length)
//   })
// })

// describe('When trying to add a new user', () => {
//   test('Adding a new user with valid username and valid password succeds', async () => {

//   })
// })


after(async () => {
  await Blog.deleteMany({})
  await mongoose.connection.close()
})