const WebSocket = require('ws');
const axios = require('axios');
const url = 'https://api.upbit.com/v1/market/all';

const ws = new WebSocket("wss://api.upbit.com/websocket/v1");

const searchMarketCode = async () => {
    const response = await axios.get(url, { params: { isDetail: 'ture' } });
    const data = response.data;
    const krwList = []
    for (let i = 0; i < data.length; i++) {
        let temp = data[i].market.split('-')[0]
        if (temp === 'KRW') {
            krwList.push(`"${data[i].market}"`);
        }
    }
    return krwList;
}

ws.on('open', () => {
    searchMarketCode().then(data => {
        ws.send(`[{"ticket":"test"},{"type":"ticker","codes":[${data}]},{}]`)
    })
})
ws.on('message', (data) => {
    try {
        let str = data.toString('utf-8');
        let json = JSON.parse(data);
        console.log(json);
    } catch (e) {
        console.error(e);
    }
})

ws.on('close', () => {
    console.log('소켓 연결 해제됨');
})