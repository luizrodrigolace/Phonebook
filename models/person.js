const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URL

console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

  const numberValidator = [
    {
        validator: function(value){
            // Regex para validar a estrutura: 2-3 digitos, hifen, seguido por digitos
            return /^\d{2,3}-\d+$/.test(value);
        },
        message: props => `${props.value} is not a valid number` 
    },
    {
            validator: function(value){
                //verificar se o numero total de caracteres é pelo menos 8
                return value.length >= 8;
            },
            message: props => 'Phone number must be at least 8 characters long!' 
    }
  ]


  const personSchema = new mongoose.Schema({
    name: {
      type: String,
      minlength: 3,
      required: true
    },
    number: {
      type: String,
      required: true,
      validate: numberValidator
    }
  });

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

  module.exports = mongoose.model('Person', personSchema)
