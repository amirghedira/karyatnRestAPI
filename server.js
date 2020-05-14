const http = require('http');
const app = require('./app');
const jwt = require('jsonwebtoken')
const server = http.createServer(app);
const io = require('socket.io')(server);
const ConnectedUsers = [];
server.listen(process.env.PORT || 3000, () => {

    io.on('connection', (socket) => {
        console.log(socket.id)
        socket.on('connectuser', (token) => {
            try {
                let user = jwt.verify(token, process.env.JWT_SECRET_KEY)
                ConnectedUsers[user._id] = socket.id
            } catch (error) {
                console.log('error')
            }
        })
        socket.on('disconnect', () => {
            console.log('has disconnected ', socket.id)
            const index = ConnectedUsers.findIndex(usersocketid => {
                return usersocketid === socket.id
            })
            ConnectedUsers.splice(index, 1)

        })
        socket.on('sendnotification', (notificationObject) => {
            if (ConnectedUsers[notificationObject.userid])
                socket.broadcast.to(ConnectedUsers[notificationObject.userid]).emit('sendnotification', notificationObject)
        })
    })
})