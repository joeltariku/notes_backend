const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./tests_helper')
const Note = require('../models/note')
const User = require('../models/user')

const api = supertest(app)
describe('when there is initially some notes saved', () => {
  beforeEach(async () => {
    await Note.deleteMany({})
    await Note.insertMany(helper.initialNotes) 

    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()
  })

  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all notes are returned', async () => {
    const response = await api.get('/api/notes')

    // assert.strictEqual(response.body.length, helper.initialNotes.length)
    expect(response.body.length).toBe(helper.initialNotes.length);
  })

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes')

    const contents = response.body.map(e => e.content)
    // assert(contents.includes('HTML is easy'))
    expect(contents.includes('HTML is easy')).toBe(true)
  })

  describe('viewing a specific note', () => {
    test('succeeds with a valid id', async () => {
      const notesAtStart = await helper.notesInDb()
      const noteToView = notesAtStart[0]

      const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      // assert.deepStrictEqual(resultNote.body, noteToView)
      expect(resultNote.body).toEqual(noteToView)
    })

    test('fails with statuscode 404 if note does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()

      await api.get(`/api/notes/${validNonexistingId}`).expect(404)
    })

    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api.get(`/api/notes/${invalidId}`).expect(400)
    })
  })

  describe('addition of a new note', () => {
    test('succeeds with valid data', async () => {
      const users = await helper.usersInDb()
      const firstUser = users[0]
      console.log("Users: ", users)
      console.log("User: ", firstUser)

      const newNote = {
        content: 'async/await simplifies making async calls',
        important: true,
        userId: firstUser.id
      }

      const response = await api
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const notesAtEnd = await helper.notesInDb()
      // assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1)
      expect(notesAtEnd.length).toBe(helper.initialNotes.length + 1)

      const contents = notesAtEnd.map(n => n.content)
      // assert(contents.includes('async/await simplifies making async calls'))
      expect(contents.includes('async/await simplifies making async calls'))

      // const addedNote = notesAtEnd.find(note => note.content === newNote.content)

      const usersAtEnd = await helper.usersInDb()
      const updatedUser = usersAtEnd.find(user => user.id === firstUser.id)
  
      expect(updatedUser.notes.find(note => note.toJSON() === response.body.id)).toBeDefined()
    })

    test('fails with status code 400 if data invalid', async () => {
      const newNote = { important: true }

      await api.post('/api/notes').send(newNote).expect(400)

      const notesAtEnd = await helper.notesInDb()

      // assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
      expect(notesAtEnd.length).toBe(helper.initialNotes.length)
    })
  })

  describe('deletion of a note', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const notesAtStart = await helper.notesInDb()
      const noteToDelete = notesAtStart[0]

      await api.delete(`/api/notes/${noteToDelete.id}`).expect(204)

      const notesAtEnd = await helper.notesInDb()

      const contents = notesAtEnd.map(n => n.content)
      // assert(!contents.includes(noteToDelete.content))
      expect(!contents.includes(noteToDelete.content))

      // assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)
      expect(notesAtEnd.length).toBe(helper.initialNotes.length - 1)
    })
  })
  describe('editing an existing note', () => {
    test('should successfuly edit existing note with proper data', async () => {
      const notesAtStart = await helper.notesInDb()
      const noteToEdit = notesAtStart[0]

      const editedNote = {
        ...noteToEdit,
        content: "I edited the content"
      }

      const result = await api
      .put(`/api/notes/${noteToEdit.id}`)
      .send(editedNote)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
      expect(result.body).toEqual(editedNote)

    })

    test('handles invalid put id', async () => {
      const badId = await helper.nonExistingId()
      const notesAtStart = await helper.notesInDb()
      const noteToEdit = notesAtStart[0]

      const editedNote = {
        ...noteToEdit,
        content: "bad request"
      }

      await api
        .put( `/api/notes/${badId}`)
        .send(editedNote)
        .expect(404)
    })
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})