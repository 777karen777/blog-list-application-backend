const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return blog.likes 
      ? sum + blog.likes
      : sum
  }
  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  if(blogs.length === 0) {
    return null
  }
  /* let favorite = blogs[0]

  blogs.forEach((blog) => {
    if(blog.likes && blog.likes > favorite.likes) {
      favorite = blog
    }
  })
  return favorite  */
  
  const favorite = blogs.reduce((prev, cur) => {
    return (cur.likes || 0) > (prev.likes || 0) ? cur : prev

  })

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  }
}

const mostBlogs = (blogs) => {
  const blogsCount = {}

  let maxAutor = null
  let maxBlogs = 0

  blogs.forEach(blog => {
    const author = blog.author
    blogsCount[author] = (blogsCount[author] || 0) + 1

    if(blogsCount[author] > maxBlogs) {
      maxBlogs = blogsCount[author]
      maxAutor = author
    }
  })

  return {
    author: maxAutor,
    count: maxBlogs
  }
}

const mostLikes  = (blogs) => {
  const likesCount = {}

  let maxAutor = null
  let maxLikes = 0

  blogs.forEach(blog => {
    const author = blog.author
    likesCount[author] = (likesCount[author] || 0) + (blog.likes || 0)

    if(likesCount[author] > maxLikes) {
      maxLikes = likesCount[author]
      maxAutor = author
    }
  })

  return {
    author: maxAutor,
    likes: maxLikes
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}