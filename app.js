const app = require('express')();
const http = require('http').Server(app);
const router = require('./routes');

const WebSocket = require('ws');
const io = require('socket.io')(http, {
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});

const SMC = require('./routes/searchMarketCode');

const cors = require('cors');
const axios = require('axios');

// mongoDB default setting
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const assert = require('assert');
const { futimesSync } = require('fs');

const url = 'mongodb://localhost:27017';
const dbName = 'local';
const CoinSchema = new mongoose.Schema({
    code: String,
    price: Number
});
const CoinModel = mongoose.model('Coin', CoinSchema);

function connectDB() {
    console.log('Attempting to connect db...')
    mongoose.Promise = global.Promise;
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    database = mongoose.connection;

    database.on("error", console.error.bind(console, 'mongoose connection error.'));
    database.on("open", () => {
        console.log("DB Connected!!!");

    });

}
// mongoDB end

app.use(cors());

app.set('port', process.env.PORT || 3000);

app.use('/', router);

process.on('uncaughtException', (err) => {
    console.log(`uncaughtException occur! : ${err}`);
    console.log(err.stack);
})

app.on('close', () => {
    console.log('Close Server');
})

let userCount = 0;

let ws;

io.on('connection', (socket) => {
    console.log('user connect');
    if (userCount === 0) {
        ws = new WebSocket("wss://api.upbit.com/websocket/v1");
        ws.onopen = () => {
            console.log('api socket open');
            console.log(`socket status : ${ws.readyState}`);
        }
    }
    userCount += 1;
    console.log(`current user : ${userCount}`);

    ws.on('open', async () => {
        const params = await SMC.getRequestCodes();
        console.log(params);
        ws.send(`[{"ticket":"test"},{"type":"ticker","codes":[${params}],"isOnlyRealtime":true}]`)
    })

    ws.on('message', (data) => {
        try {
            let json = JSON.parse(data);
            let sendData = {
                'code': json.code,
                'price': json.trade_price
            };
            let buf = Buffer.from(JSON.stringify(sendData));
            let arrayBuf = new ArrayBuffer(buf.length);
            let view = new Uint8Array(arrayBuf);
            for (let i = 0; i < buf.length; ++i) {
                view[i] = buf[i];
            }
            console.log(arrayBuf);
            socket.send(arrayBuf);
        } catch (e) {
            console.error(e);
        }
    })

    ws.on('close', () => {
        console.log('소켓 연결 해제됨');
    })

    socket.on('disconnect', (reason) => {
        userCount -= 1;
        if (userCount === 0) {
            ws.close();
        }
        console.log(reason);
        console.log(`current user : ${userCount}`);
    })
});

http.listen(3000, () => {
    console.log('server start');
})