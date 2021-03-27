const axios = require('axios');
const e = require('cors');
const url = 'https://api.upbit.com/v1/market/all';

async function getData() {
    const data = (await axios.get(url, { params: { isDetail: 'true' } })).data;
    const markets = await Promise.all(
        data.map(value => value.market)
    )
    return markets;
}

async function getMarket() {
    const markets = await getData();
    const codes = {
        'krw': [],
        'btc': [],
        'usdt': [],
    }
    for(const element of markets) {
        let temp = element[0]
        if (temp == 'B') {
            codes.btc.push(element);
        } else if (temp == 'K') {
            codes.krw.push(element);
        } else {
            codes.usdt.push(element)
        }
    }

    return codes;
}

async function getRequestCodes() {
    const markets = await getData();
    return await Promise.all(
        markets.map(value => {
            return `"${value}"`;
        })
    )
}

exports.getMarket = getMarket;
exports.getRequestCodes = getRequestCodes;