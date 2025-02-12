const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: {
		type: String,
		required: true,
		minlength: 2
	},
  author: {
		type: String,
		required: true,
		minlength: 2
	},
  url: {
		type: String,
		required: true,
		minlength: 2
	},
  likes: {
		type: Number,
		required: false
	},
  user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
})

blogSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		if (returnedObject._id) { // I added this because when excluding id field from populate in controllers/users usersRouter.get route I get error.
			returnedObject.id = returnedObject._id.toString()
		}
		delete returnedObject._id
		delete returnedObject.__v
	}
})

module.exports = mongoose.model('Blog', blogSchema)
