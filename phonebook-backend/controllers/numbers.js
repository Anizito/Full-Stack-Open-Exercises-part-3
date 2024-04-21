const numbersRouter = require('express').Router()
const Person = require('../models/person')

numbersRouter.get('/', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

numbersRouter.get('/info', async (request, response) => {
  const persons = await Person.find({})
  const dataLength = persons.length

  response.send(`
    <p>
      Phonebook has info for ${dataLength} people
    </p>
    <p>
      ${new Date()}
    </p>
    `)
})

numbersRouter.get('/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    }).catch(error => next(error))
})

numbersRouter.delete('/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

numbersRouter.put('/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(updatedNumber => {
      response.json(updatedNumber)
    })
    .catch(error => next(error))
})

numbersRouter.post('/', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'Name is missing'
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'Number is missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(personSaved => {
    response.json(personSaved)
  }).catch(error => next(error))
})

module.exports = numbersRouter
