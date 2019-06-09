const path = require('path')
const http = require('http')
const express = require("express")
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInChat } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDeroctoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDeroctoryPath))


io.on('connection', (socket) => {
    console.log('New socket connection')

    socket.on('join', (options, callback) => {
        const filter = new Filter()
        const { err, user } = addUser({ id: socket.id, ...options })
        if (err) {
            return callback(err)
        }
        socket.join(user.roomID)

        socket.emit('message', generateMessage(`Welcome ${user.displayName}!`), user.displayName)
        socket.broadcast.to(user.roomID).emit('message', generateMessage(`${user.displayName} joined the chat`), user.displayName)
        io.to(user.roomID).emit('usersInChat', {
            roomID: user.roomID,
            users: getUsersInChat(user.roomID)
        })

        callback()
        socket.on('sendMessage', (message, username, callback) => {
            io.to(user.roomID).emit('message', generateMessage(filter.clean(message)), username)
            callback()
        })

        socket.on('sendLocation', (coords, callback) => {
            io.to(user.roomID).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`), user.displayName)
            callback()
        })

        socket.on('disconnect', () => {
            const user = removeUser(socket.id)
            if (user) {
                io.to(user.roomID).emit('message', generateMessage(`${user.displayName} left the chat`, user.displayName))
                io.to(user.roomID).emit('usersInChat', {
                    roomID: user.roomID,
                    users: getUsersInChat(user.roomID)
                })
            }
        })
    })
})

server.listen(port, () => {
    console.log('Express app is running on port: ', port)
})