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
                console.log(user)
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
        socket.on('disconnect', () => {

            const userindex = ConnectedUsers.findIndex(connecteduser => {
                return connecteduser.socketid === socket.id
            })
            if (userindex >= 0)
                ConnectedUsers.splice(userindex, 1)

        })
        socket.on('sendnotification', (notificationObject) => {
            const userindex = ConnectedUsers.findIndex(connecteduser => {
                return connecteduser.userid === user._id
            })
            if (userids.includes(notificationObject.userid))
                socket.broadcast.to(ConnectedUsers[userindex].userid).emit('sendnotification', notificationObject.notification)
        })
    })
})