const express = require('express')
const app = express()
var morgan = require('morgan')

const cors = require('cors')

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
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id == id)
    
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })

  app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })

  const generateId = () => {
    const maxId = persons.length > 0
      ? Math.max(...persons.map(n => Number(n.id)))
      : 0
    return String(maxId + 1)
  }
  
  app.post('/api/persons', (request, response) => {
    const body = request.body

    const names = persons.map(person=>person.name)
    console.log(names)
    console.log(names.includes(body.name))

    if (!body.name || !body.number) {
      return response.status(400).json({ 
        error: 'name or number missing' 
      })
    }

    if(names.includes(body.name)){
      return response.status(400).json({ 
        error: 'name already been used' 
      })
    }

    const person = {
      id:generateId(),
      name: body.name,
      number: body.number,
    }
    persons = persons.concat(person)

    response.json(person)
  })
  
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })