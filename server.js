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
                if (user) {
                    const userindex = ConnectedUsers.findIndex(connecteduser => {
                        return connecteduser.userid === user._id
                    })
                    if (userindex < 0)
                        ConnectedUsers.push({ userid: user._id, socketid: socket.id })

                }
            } catch (error) {
                console.log('error')
            }
        })
        socket.on('users', () => {
            console.log(ConnectedUsers)
        })
        socket.on('disconnect', () => {

            const userindex = ConnectedUsers.findIndex(connecteduser => {
                return connecteduser.socketid === socket.id
            })
            if (userindex >= 0)
                ConnectedUsers.splice(userindex, 1)

        })
        socket.on('sendnotification', (notificationObject) => {
            const userindex = ConnectedUsers.findIndex(connecteduser => {
                return connecteduser.userid === notificationObject.userid
            })
            if (userindex >= 0)
                socket.broadcast.to(ConnectedUsers[userindex].socketid).emit('sendnotification', notificationObject.notification)
        })
    })
})