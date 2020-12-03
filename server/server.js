const express = require('express')
const app = express() /* Get the App Portion of Express */
const socketIo = require('socket.io')
const http = require('http')

const {addUser, removeUser, getUser, getUsersInRoom} = require('./users.js')

const PORT = process.env.PORT || 5000

const mainRouter = require('./router')

const server = http.createServer(app)
const io = socketIo(server)

io.on('connection', (socket) => {
    socket.on('join', ({name, room}, callback) => {
        const {error, user} = addUser({id: socket.id, name, room})
        if (error) return callback(error)

        socket.emit('message', {user: 'admin', text: `${user.name}, welcome to the ${user.room} room.`})
        socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name}, has joined this room!`})

        socket.join(user.room)

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('message', {user: user.name, text: message})

        callback()
    })

    socket.on('disconnect', () => {
    console.log('\n\n\tUser had left!!!')
    })
})

app.use(mainRouter)

server.listen(PORT, (error) => {
    error ?
        console.log(`\nERROR! Something Went Wrong.\n`) :
        console.log(`\nServer is listening on PORT: ${PORT}\n`)
}) /* Telling to our App that we want to Listening on Certain PORT */