require ('dotenv').config()
const express = require("express")
const app = express();
const cors = require('cors')
const Note = require ('./models/note')


const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(express.json())
app.use(requestLogger)
app.use(cors())
app.use(express.static('dist'))

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true,
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>")
});

app.get("/api/notes", (request, response) => {
  Note.find({}).then(notes =>{
    response.json(notes)
  })
});

app.get("/api/notes/:id", (request, response) => {
  Note.findById(request.params.id).then(note =>{
    if(note){
      response.json(note)
    }else{
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
      Note.findByIdAndDelete(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })

  
  app.post('/api/notes', (request, response, next) => {
    const body = request.body
  
    const note = new Note({
      content: body.content,
      important: body.important || false,
    })
  
    note.save()
      .then(savedNote => {
        response.json(savedNote)
      })
  
      .catch(error => next(error))
  })
  

  app.put('/api/notes/:id', (request, response, next) => {
    const body = request.body
  
    const note = {
      content: body.content,
      important: body.important,
    }
  
    Note.findByIdAndUpdate(request.params.id, note, { new: true })
      .then(updatedNote => {
        response.json(updatedNote)
      })
      .catch(error => next(error))
  })

  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.use(unknownEndpoint)

  const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).json({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message }) // Asegura que el error de validación se envíe correctamente
    }
  
    next(error)
  }
  
  app.use(errorHandler)
  

  const PORT = process.env.PORT 
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
