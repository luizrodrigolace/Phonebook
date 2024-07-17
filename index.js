require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())


// Criando um token personalizado 'body' que captura e formata o corpo da requisição
morgan.token('body', (req) => JSON.stringify(req.body));

// Configurando Morgan para usar o formato 'tiny' e incluir o novo token 'body'
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

let persons = [
  { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123455"
  },
  { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": "4",
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]


app.get('/info', (request, response) => {
    response.send(`<p> Phonebook has info for ${persons.length} people </p>
                  <p>${new Date()}</p>`)
})
  
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/notes/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end() 
      }
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: 'malformatted id' })
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: 'malformatted id' })
    })
})

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => Number(n.id)))
    : 0
  return String(maxId + 1)
}
  
app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' });
  }

  Person.findOne({name:body.name})
    .then(existingPerson =>{
      if(existingPerson){
        //Person already exists, update their number
        const updatedPerson = {
          name:body.name,
          number: body.number
        }

        Person.findByIdAndUpdate(existingPerson._id, updatedPerson, {new:true, runValidators:true, context: 'query'})
          .then(updatedPerson => {
            response.json(updatedPerson);
          })
          .catch(error => next(error))
      }
      else{
        // Person doesn't exist, create a new entry
        const person = new Person({
          name: body.name,
          number: body.number,
        })
      
        person.save()
          .then(savedPerson => {
            response.json(savedPerson);
          })
          .catch(error => next(error));
      }
    })
    .catch(error=>next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})