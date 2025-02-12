const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    unique: true,
    // validate: (v) => {
    //   return /^[a-zA-Z](?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9_.-]+$/.test(v) && /* v.length >= 3 && */ v.length <= 15
    // }
  },
  name: String,
  passwordHash: {
    type: String,
    // minlength: 3,
    // validate: (v) => {
    //   return /^[a-zA-Z](?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9_.-]+$/.test(v) && v.length >= 3 && v.length <= 15
    // }
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ],  
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User