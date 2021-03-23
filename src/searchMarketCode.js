const axios = require('axios');
const url = 'https://api.upbit.com/v1/market/all';

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

module.exports = searchMarketCode();