const router = require('express').Router();

const SMC = require('./searchMarketCode');

router.get('/searchMarketCode', async (req, res) => {
    console.log("/searchMarketCode request!!!");
    const markets = await SMC.getMarket();
    res.send(markets)
})

module.exports = router;