const mongoose = require('mongoose');
require('dotenv').config();

// if (process.argv.length < 3) {
//   console.log('give password as argument')
//   process.exit(1)
// }

const password = process.env.MONGO_PASSWORD;

const url = `mongodb+srv://jojotk10:${password}@cluster0.k8jfzsn.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Note = mongoose.model('Note', noteSchema)

module.exports = Note;
