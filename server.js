const express = require('express');
const axios = require('axios')
const cors = require('cors')
const Moralis = require("moralis-v1/node");
const console = require('console');
require('dotenv').config()
// const fs = require("fs");

const TG = require('telegram-bot-api')



const AppId = process.env.APP_ID
const ServerUrl = process.env.SERVER_URL;
const MasterKey = process.env.MASTER_KEY;
const TOKEN = process.env.TOKEN;
const CHAT_ID = process.env.CHAT_ID || -769764926

const whiteListedOrignsLive = 'https://blog.2spice.link'
const url = process.env.URL || "https://testnet.bscscan.com/tx/"


// await Moralis.start({ serverUrl: 'https://2nlnyiqavans.usemoralis.com:2053/server', appId: '2veCjTTSOVtcYuw3kCohS7SVFjZPBc8j0nQyFa00', masterKey: 'w4pUrmNaq7RxTH39TilElpboKQr7weZGLFxiGixB' })

const Port = process.env.PORT || 8000

const allowedOrigins = Port == 8000 ? ['http://localhost:3000', 'https://2spice.link'] : ['https://2spice.link']

const app = express()

app.use(cors())

const startMoralis = async () => {
    console.log(ServerUrl)
    console.log(AppId)
    console.log(MasterKey)
    try {
        await Moralis.start({ serverUrl: ServerUrl, appId: AppId, masterKey: MasterKey })
    } catch (err) {
        console.log(err)
    }
}


const likePostMain = async (mpId, email) => {
    const GEMS = Moralis.Object.extend('Gems')
    const User = Moralis.Object.extend('_User')
    const gem = new GEMS()
    const query = new Moralis.Query(User)
    query.equalTo('email', email)
    const user = await query.first({ useMasterKey: true })
    const balance = user.get('gems')
    user.set('gem_balance', balance + 0.03)
    user.save(null, { useMasterKey: true })
    gem.set('email', email)
    gem.set('gems', 0.03)
    gem.set('type', 'post_like')
    gem.set('mpId', mpId)
    gem.save(null, { useMasterKey: true })
}


app.post('/like', (req, res) => {
    const host = req.get('origin');
    const data = req.query
    console.log(data)
    console.log(host)
    if (host == whiteListedOrignsLive) {
        likePostMain(data.mpId, data.email)
    } else {
        console.log('failed')
    }

    console.log('recieved')
})

app.get('/get', (req, res) => {
    const GEMS = Moralis.Object.extend('_User')
    const query = new Moralis.Query(GEMS)
    const result = query.first({ useMasterKey: true })

    // startMoralis()
    res.send('result')

})


app.post('/send_buy_message', (req, res) => {
    const host = req.get('origin');

    if (!allowedOrigins.includes(host)) {
        console.log('restricted')
        res.status(400).send("restricted")
        return
    }
    const data = req.query
    const api = new TG({
        token: TOKEN
    })
    const receipient = data.receipient
    const amount = data.amount
    const tx_link = data.tx_link
    const startPrice = data.startPrice
    const currentPrice = data.currentPrice
    const Increase = data.increase

    const increase = currentPrice - 1

    console.log(
        `
        🟢 __2Spice Mint__ 💰
        Reciepient:${receipient}
        SPICE MINTED: ${amount} 
        TX LINK: [BSC](${url}${tx_link})
        Start Price: ${startPrice}
        Current price: ${currentPrice}
        Increase: ${increase.toString()}
        `
    )

    api.sendMessage({
        chat_id: CHAT_ID,
        text: `
        🟢 2Spice Mint 💰

Reciepient: ${receipient.toString()} 
SPICE MINTED: ${amount.toString()}
TX LINK: [BSC](${url}${tx_link})
Start Price: ${1}
Current price: ${(Math.round(currentPrice * 10000) / 10000).toString()}
Increase: ${increase.toString()}
        `,
        parse_mode: 'Markdown'
    })
    res.status(200).send("success")
})

app.post('/send_sell_message', (req, res) => {
    const host = req.get('origin');
    if (!allowedOrigins.includes(host)) {
        console.log('restricted')
        res.status(400).send("restricted")
        return
    }
    const data = req.query
    const api = new TG({
        token: TOKEN
    })
    const receipient = data.receipient
    const amount = data.amount
    const tx_link = data.tx_link
    const startPrice = data.startPrice
    const currentPrice = data.currentPrice
    const Increase = data.increase
    const increase = currentPrice - 1

    api.sendMessage({
        chat_id: CHAT_ID,
        text: `
        🔴 2Spice Redeemed 💰

Seller: ${receipient}
SPICE Redeemed: ${amount.toString()} 
TX LINK: [BSC](${url}${tx_link})
Start Price: ${1}
Current price: ${(Math.round(currentPrice * 10000) / 10000).toString()}
Increase: ${increase.toString()}
        `,
        parse_mode: 'Markdown'
    })
    res.status(200).send("success")
})



Moralis.start({ serverUrl: ServerUrl, appId: AppId, masterKey: MasterKey }).then(() => {
    app.listen(Port, () => {
        console.log(Port)
        console.log('hello world')
    })
})

