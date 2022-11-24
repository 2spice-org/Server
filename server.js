const express = require('express');
const axios = require('axios')
const cors = require('cors')
const Moralis = require("moralis-v1/node");
const console = require('console');
require('dotenv').config()
// const fs = require("fs");


const AppId = process.env.APP_ID
const ServerUrl = process.env.SERVER_URL;
const MasterKey = process.env.MASTER_KEY;

const whiteListedOrignsLive = 'https://blog.2spice.link'
const whiteListedOrignsTest = 'http://localhost:3001'

// await Moralis.start({ serverUrl: 'https://2nlnyiqavans.usemoralis.com:2053/server', appId: '2veCjTTSOVtcYuw3kCohS7SVFjZPBc8j0nQyFa00', masterKey: 'w4pUrmNaq7RxTH39TilElpboKQr7weZGLFxiGixB' })

const Port = process.env.PORT || 8000

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
    const gem = new GEMS()
    gem.set('email', email)
    gem.set('gems', 0.03)
    gem.set('type', 'post_like')
    gem.set('mpId', mpId)
    gem.save(null, { useMasterKey: true })
}


app.post('/like', (req, res) => {
    const host = req.get('origin');
    const data = res
    console.log(host)
    if (host == whiteListedOrignsLive || host == whiteListedOrignsTest) {
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


Moralis.start({ serverUrl: ServerUrl, appId: AppId, masterKey: MasterKey }).then(() => {
    app.listen(Port, () => {
        console.log(Port)
        console.log('hello world')
    })
})

