const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on("connect", () => {
    console.log('연결');
    socket.on('message', (data) => {
        console.log(data);
    })
    setTimeout(() => {
        socket.disconnect();
    }, 5000);
})
