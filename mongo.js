const mongoose = require('mongoose')
require('dotenv').config()

// if (process.argv.length < 3) {
//   console.log('give password as argument')
//   process.exit(1)
// }

// const password = process.argv[2]
console.log('password: ', process.env.MONGO_PASSWORD)

console.log('Connecting to MongoDB...')

const url = `mongodb+srv://jojotk10:${process.env.MONGO_PASSWORD}@cluster0.k8jfzsn.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)


const note2 = new Note({
  content: 'Browser can execute only JavaScript',
  important: false,
})

note2.save().then(() => {
  console.log('note2 saved!')
  mongoose.connection.close()
})

Note.find({}).then((result) => {
  result.forEach((note) => {
    console.log(note)
  })
  mongoose.connection.close()
})