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

module.exports = {
  dummy,
  totalLikes,
}