const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const io = require('socket.io')(server);
server.listen(process.env.PORT || 3000, () => {

    io.on('connection', (socket) => {
        socket.on('sendnotification', (notificationObject) => {
            console.log(notificationObject)
            socket.broadcast.emit('sendnotification', notificationObject)
        })
    })
})