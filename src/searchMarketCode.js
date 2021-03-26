const axios = require('axios');
const url = 'https://api.upbit.com/v1/market/all';

async function getMarket(market = 'all') {
    const data = (await axios.get(url, { params: { isDetail: 'true' } })).data;
    const markets = await Promise.all(
        data.map(value => value.market)
    )
    if (market == 'all') {
        return markets;
    } else {
        return await Promise.all(
            markets.filter(value => value.indexOf(market.toUpperCase()) != -1)
        )
    }
}

module.exports = getMarket;
// const searchMarketCode = async (flag) => {
//     const response = await axios.get(url, { params: { isDetail: 'ture' } });
//     const data = response.data;
//     if (flag) {
//         const krwList = []
//         for (let i = 0; i < data.length; i++) {
//             let temp = data[i].market.split('-')[0]
//             if (temp === 'KRW') {
//                 krwList.push(`"${data[i].market}"`);
//             }
//         }
//     } else {
//         return data.map(value => {
//             let temp = value.market;
//             if (temp.indexOf('KRW') !== -1) {
//                 return temp.split('-')[1];
//             } else {
//                 return 0;
//             }
//         }).filter(value => value !== 0)

//         return krwList;
//     }
// }

// module.exports = searchMarketCode();