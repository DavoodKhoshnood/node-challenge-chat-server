const express = require('express')
const cors = require('cors')
const { sendStatus } = require('express/lib/response')

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const welcomeMessage = {
  id: 0,
  from: 'Bart',
  text: 'Welcome to CYF chat system!',
  timeSent: 0,
}

let messages = [welcomeMessage]

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.get('/messages', (req, res, next) => {
  res.send(messages)
})

app.get('/messages/search', (req, res, next) => {
  const searchText = req.query.text
  const filteredMessages = messages.filter((message) =>
    message.text.includes(searchText),
  )
  if (filteredMessages.length > 0) res.send(filteredMessages)
  else res.status(400).send('There is no message whose text contains!')
})

app.get('/messages/latest', (req, res, next) => {
  const latest = messages.slice(-10)
  res.send(latest)
})

app.get('/messages/:id', (req, res, next) => {
  const id = parseInt(req.params.id)
  const message = messages.find((message) => message.id === id)
  if (!message) return res.status(404).send('Message not found!')
  res.json(message)
})

app.post('/messages', (req, res) => {
  if (!req.body.from)
    res
      .status(400)
      .send('Message must be send from someone! Please fill "Name"!')
  else if (!req.body.text)
    res.status(400).send('Message must be have a text! Please fill "Message"!')
  else {
    const newId = Math.max(...messages.map((m) => m.id)) + 1
    const newDate = new Date()
    const newMessage = {
      id: newId,
      from: req.body.from,
      text: req.body.text,
      timeSent: newDate,
    }
    messages.push(newMessage)
    res.sendStatus(201)
  }
})

app.delete('/messages/:id', function (req, res) {
  const id = req.params.id
  const found = messages.some((message) => message.id == id)
  if (found) {
    messages = messages.filter((message) => message.id != id)
    res.status(200).json('Message deleted!')
  } else res.status(400).json('Message not found!')
})

app.put('/messages/:id', (req, res, next) => {
  const updatedMessage = req.body
  const id = updatedMessage.id
  if (checkFields(updatedMessage, res)) {
    ;[...messages].map((message, index) => {
      if (message.id === id) {
        updatedMessage.timeSent = message.timeSent
        messages[index] = updatedMessage
      }
    })
    res.sendStatus(201)
  } else res.status(400).send('Update failed!')
})

const checkFields = (message, res) => {
  result = false
  if (!message.from) res.status(400).send('Please enter name!')
  else if (!message.text) res.status(400).send('Please enter message!')
  else result = true

  return result
}

app.listen(port, () => {
  console.log(`Server starting on port ${port}`)
})
