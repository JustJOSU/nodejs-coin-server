const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});

const WebSocket = require('ws');
const searchMarketCode = require('./src/searchMarketCode');

const cors = require('cors')

app.set('port', process.env.PORT || 3000);
app.use(cors());

process.on('uncaughtException', (err) => {
    console.log(`uncaughtException occur! : ${err}`);
    console.log(err.stack);
})

app.on('close', () => {
    console.log('Close Server');
})

let userCount = 0;

io.on('connection', (socket) => {
    console.log('user connect');
    userCount += 1;
    console.log(userCount);

    const ws = new WebSocket("wss://api.upbit.com/websocket/v1");

    ws.on('open', () => {
        searchMarketCode.then(data => {
            ws.send(`[{"ticket":"test"},{"type":"ticker","codes":[${data}]}]`)
        })
    })

    ws.on('message', (data) => {
        try {
            let str = data.toString('utf-8');
            let json = JSON.parse(str);
            socket.send(JSON.stringify(json));
        } catch (e) {
            console.error(e);
        }
    })

    ws.on('close', () => {
        console.log('소켓 연결 해제됨');
    })

    socket.on('disconnect', (reason) => {
        userCount -= 1;
        if (userCount <= 0) {
            ws.close();
            console.log(ws);
        }
        console.log(reason);
        console.log(userCount);
    })
});

http.listen(3000, () => {
    console.log('server start');
})