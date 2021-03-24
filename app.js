const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});

const WebSocket = require('ws');
const searchMarketCode = require('./src/searchMarketCode');

const cors = require('cors');
const { response } = require('express');
const { default: axios } = require('axios');

app.set('port', process.env.PORT || 3000);

app.use(cors());

app.get('/searchMarketCode', (req, res) => {
    const code = async () => {
        const response = await axios.get('https://api.upbit.com/v1/market/all', { params: { isDetail: 'ture' } });
        const data = response.data;
        const krwList = data.map(value => {
            let temp = value.market;
            if (temp.indexOf('KRW') !== -1) {
                return temp.split('-')[1];
            } else {
                return 0;
            }
        }).filter(value => value !== 0)
        return krwList;
    }
    code().then(data => {
        res.send(data)
    })
})

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

    ws.on('open', () => {
        searchMarketCode.then(data => {
            ws.send(`[{"ticket":"test"},{"type":"ticker","codes":[${data}]}]`)
        })
    })

    ws.on('message', (data) => {
        try {
            let json = JSON.parse(data);
            let sendData = {
                code: json.code.split('-')[1],
                price: json.trade_price
            };
            socket.send(JSON.stringify(sendData));
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