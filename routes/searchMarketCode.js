const axios = require('axios');
const url = 'https://api.upbit.com/v1/market/all';

async function getData() {
    const data = (await axios.get(url, { params: { isDetail: 'true' } })).data;
    const markets = await Promise.all(
        data.map(value => value.market).filter(value => value[0] == 'K')
    )
    return markets;
}

async function getMarket() {
    const markets = await getData();
    const codes = []
    for (const element of markets) {
        let temp = {
            'code': element,
            'price': 0
        };
        codes.push(temp);
    }
    console.log(codes);
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