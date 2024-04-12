require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')

app.use(express.json())

const cors = require('cors')

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}
app.use(cors())

app.use(express.static('dist'))


morgan.token('body', (request) =>{
  if(request.method === 'POST'){
    return JSON.stringify(request.body)
  }
  else{
    return ""
  }
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

/*
let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]
*/

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', async(request, response)=>{

  const persons = await Person.find({});
  const dataLength = persons.length;

  response.send(`
    <p>
      Phonebook has info for ${dataLength} people
    </p>
    <p>
      ${new Date()}
    </p>
    `)
})

app.get('/api/persons/:id', (request, response,next) => {
  Person.findById(request.params.id)
    .then(person => {
    if(person){
      response.json(person)
    } else{
      response.status(404).end()
    }
  }).catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response,next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedNumber => {
      response.json(updatedNumber)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'Name is missing' 
    })
  }

  if(!body.number){
    return response.status(400).json({
      error: 'Number is missing'
    })
  }

  const person = new Person( {
    name: body.name,
    number: body.number
  })

  person.save().then(personSaved =>{
    response.json(personSaved)
  })
})



const unknownEndpoint = (request, response) =>{
  response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

app.use(errorHandler)

const PORT= process.env.PORT
app.listen(PORT, () =>{
  console.log(`Server running on port ${PORT}`)
})


