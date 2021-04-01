const io = require('socket.io-client');
const socket = io('http://localhost:3000');

let count = 0;
socket.on("connect", () => {
    console.log('연결');
    socket.on('message', (data) => {
        // let res = JSON.parse(data);
        console.log(data);
        count += 1;
    })
    setTimeout(() => {
        socket.disconnect();
        console.log(`count : ${count}`);
    }, 1000);
})
