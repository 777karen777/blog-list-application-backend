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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}